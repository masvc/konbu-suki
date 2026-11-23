/**
 * AI引用チェックの結果を、夜をまたいで並べる（前夜比）。
 *
 * 呼び出しは ai-citation-check.ts から。
 *   npx tsx scripts/ai-citation-check.ts --diff                      # 今夜を最後に直近4夜を並べるだけ（Gemini は呼ばない）
 *   npx tsx scripts/ai-citation-check.ts --diff --date 2026-11-23 --nights 3
 * 通常のチェックの後にも自動で書く（ai-citation-diff.md）。
 *
 * 単独のスクリプトにしなかったのは、夜間の許可リスト（auto-settings.json）に
 * ai-citation-check.ts が既に入っているため。新しいスクリプトは許可が無く夜間に回せない。
 *
 * ai-citation-check.ts は1語を2回取る（--repeat）。1夜だけを見ると、本文を
 * 変えていない語が 2/2 ⇔ 1/2 と出入りするのを「減った」「効いた」と読み違える。
 * 分析枠は毎晩これを手で並べていた（11-17〜11-23 の7夜）。
 *
 * 出すもの:
 * - 語ごとの「n/m」を夜ごとに並べた表（m は回数、n は自サイトが引用された回数）。
 *   引用されたのが狙いの記事でなかった回があれば「（別）」を付ける
 * - 最後の夜の index-status.json の最終クロール日
 * - 「引用なし → 毎回引用」「毎回引用 → 引用なし」「2夜続けて毎回引用（新しく）」の語
 *
 * 「効果」の判定（2夜続けて 2/2、かつ変更後の版がクロール済み）のうち、
 * 変更日は記事ごとに取れない（記事は guides.ts 1ファイルにまとまっている）。
 * 最終クロールは並べるので、変更日との突き合わせは improve-log を見て分析枠が行う。
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const NIGHT_ROOT = path.resolve(__dirname, "..", "..", "docs", "night");

type Run = { cited: boolean; citedUrls?: string[] };
type Row = { slugs: string[]; keyword: string; cited: boolean; citedUrls?: string[]; runs?: Run[] };
type Cell = { hit: number; total: number; offTarget: boolean };

const isTarget = (url: string, slugs: string[]) =>
  slugs.some((s) => url.replace(/[?#].*$/, "").replace(/\/$/, "").endsWith(`/guide/${s}`));

function cellOf(row: Row): Cell {
  const runs: Run[] = row.runs?.length ? row.runs : [{ cited: row.cited, citedUrls: row.citedUrls }];
  let hit = 0;
  let offTarget = false;
  for (const r of runs) {
    if (!r.cited) continue;
    hit++;
    const urls = r.citedUrls ?? [];
    if (urls.length > 0 && !urls.some((u) => isTarget(u, row.slugs))) offTarget = true;
  }
  return { hit, total: runs.length, offTarget };
}

/** lastNight（YYYY-MM-DD）以前で ai-citation.json がある夜を最大 nights 個並べた md。無ければ null。 */
export function citationDiffMarkdown(lastNight: string, nights = 4): string | null {
  const dates = readdirSync(NIGHT_ROOT)
    .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= lastNight)
    .filter((d) => existsSync(path.join(NIGHT_ROOT, d, "ai-citation.json")))
    .sort()
    .slice(-Math.max(2, nights));
  if (dates.length === 0) return null;

  const table = new Map<string, Map<string, Cell>>();
  const slugsOf = new Map<string, string[]>();
  for (const d of dates) {
    const rows = JSON.parse(readFileSync(path.join(NIGHT_ROOT, d, "ai-citation.json"), "utf8")) as Row[];
    const m = new Map<string, Cell>();
    for (const row of rows) {
      m.set(row.keyword, cellOf(row));
      slugsOf.set(row.keyword, row.slugs);
    }
    table.set(d, m);
  }

  const last = dates[dates.length - 1];
  const prev = dates[dates.length - 2];
  const third = dates[dates.length - 3];

  /** 最後の夜の最終クロール（path → MM-DD） */
  const crawl = new Map<string, string>();
  const statusPath = path.join(NIGHT_ROOT, last, "index-status.json");
  if (existsSync(statusPath)) {
    const status = JSON.parse(readFileSync(statusPath, "utf8")) as {
      rows: { path: string; state: string; lastCrawl: string | null }[];
    };
    for (const r of status.rows) crawl.set(r.path, r.lastCrawl ? r.lastCrawl.slice(5, 10) : `未（${r.state}）`);
  }

  const keywords = [...table.get(last)!.keys()];
  const at = (d: string | undefined, k: string) => (d ? table.get(d)?.get(k) : undefined);
  const fmt = (c: Cell | undefined) => (c ? `${c.hit}/${c.total}${c.offTarget ? "（別）" : ""}` : "-");
  const full = (c: Cell | undefined) => !!c && c.total > 0 && c.hit === c.total;
  const none = (c: Cell | undefined) => !!c && c.hit === 0;

  const lines: string[] = [];
  lines.push(`# AI引用の夜ごとの並び（${dates[0]} 〜 ${last}）`, "");
  lines.push(
    "`ai-citation-check.ts --diff` が出した。n/m は m 回のうち自サイトが引用された回数。",
    "「（別）」は引用されたのが狙いの記事ではなかった回があること。最終クロールは最後の夜の index-status.json。",
    "効果に数えるのは「2夜続けて毎回引用、かつ変更後の版がクロール済み」だけ。変更日は improve-log で確かめる。",
    "",
  );
  const summary = dates.map((d) => {
    const cells = [...table.get(d)!.values()];
    const f = cells.filter(full).length;
    const n = cells.filter(none).length;
    return `${d.slice(5)} 毎回${f}・一部${cells.length - f - n}・なし${n}`;
  });
  lines.push(`集計: ${summary.join(" / ")}`, "");

  const listOf = (title: string, pick: (k: string) => boolean) => {
    const ks = keywords.filter(pick);
    lines.push(`## ${title}（${ks.length}語）`, "");
    if (ks.length === 0) lines.push("（なし）");
    for (const k of ks) {
      const slugs = slugsOf.get(k) ?? [];
      const lc = slugs.map((s) => crawl.get(`/guide/${s}`) ?? "-").join(" / ");
      lines.push(`- ${k}（${slugs.join(", ")}・最終クロール ${lc}）: ${dates.map((d) => fmt(at(d, k))).join(" → ")}`);
    }
    lines.push("");
  };
  listOf("引用なし → 毎回引用", (k) => none(at(prev, k)) && full(at(last, k)));
  listOf("毎回引用 → 引用なし", (k) => full(at(prev, k)) && none(at(last, k)));
  listOf(
    "2夜続けて毎回引用（その前の夜は毎回ではない）",
    (k) => full(at(prev, k)) && full(at(last, k)) && (!third || !full(at(third, k))),
  );
  listOf("毎回引用 → 一部だけ", (k) => full(at(prev, k)) && !full(at(last, k)) && !none(at(last, k)));

  lines.push("## 全語", "");
  lines.push(`| 狙う語 | 記事 | ${dates.map((d) => d.slice(5)).join(" | ")} | 最終クロール |`);
  lines.push(`| --- | --- | ${dates.map(() => "---").join(" | ")} | --- |`);
  for (const k of keywords) {
    const slugs = slugsOf.get(k) ?? [];
    const lc = slugs.map((s) => crawl.get(`/guide/${s}`) ?? "-").join(" / ");
    lines.push(`| ${k} | ${slugs.join(", ")} | ${dates.map((d) => fmt(at(d, k))).join(" | ")} | ${lc} |`);
  }
  lines.push("");
  return lines.join("\n");
}
