/**
 * AI検索で引用されているかを確かめる。
 *
 * Usage:
 *   npx tsx scripts/ai-citation-check.ts              # 全記事の狙いキーワード
 *   npx tsx scripts/ai-citation-check.ts --limit 5    # 件数を絞る
 *   npx tsx scripts/ai-citation-check.ts --match おやつ --out /tmp/x  # 語を絞る（動作確認用）
 *   npx tsx scripts/ai-citation-check.ts --out docs/night/2026-11-05
 *   npx tsx scripts/ai-citation-check.ts --repeat 1   # 1語1回だけ（既定は2回）
 *
 * Gemini に Google 検索を使わせて回答させ、応答に付く引用元
 * （groundingChunks）に自サイトが入っているかを見る。あわせて、
 * 引用されている他ドメインと、Gemini が実際に投げた検索クエリ
 * （webSearchQueries）も残す。後者は「どんな質問に展開されるか」が分かるので、
 * FAQ に足す問いを決める材料になる。
 *
 * GA4 の AI流入（ai-traffic.ts）は「来た後」しか見えない。こちらは
 * 引用されているかどうかを直接見る。
 *
 * 費用について: Gemini API は利用額を API から取れない。1回ごとの
 * トークン数（usageMetadata）と呼び出し回数を残すので、料金表と突き合わせる。
 * 残高切れ（402）や上限（429）は理由として記録する。
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { GUIDES } from "../src/lib/guides";
import { PUBLIC_SITE_HOST } from "./lib/site";
import { nightDir } from "./lib/night";

const MODEL = "gemini-2.5-flash";
/** 呼び出しの間隔。まとめて投げると 429 が返る。 */
const INTERVAL_MS = 2000;

const args = process.argv.slice(2);
const numberAfter = (flag: string, fallback: number) => {
  const i = args.indexOf(flag);
  if (i === -1) return fallback;
  const n = Number(args[i + 1]);
  return Number.isFinite(n) ? n : fallback;
};
const stringAfter = (flag: string): string | null => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1] || null;
};
const limit = numberAfter("--limit", 0);
/**
 * 1語を何回取るか。1回取りだと、ページを変えていない語が一晩で出入りし
 * （11-15〜11-18 の4夜で毎晩4〜7語）、打ち手の効果と揺れを分けられなかった。
 * 既定は2回。トークンはおよそ回数倍になる（1回で約5.5万）。
 */
const repeat = Math.max(1, Math.floor(numberAfter("--repeat", 2)));
const outDir = stringAfter("--out");
/** 狙う語にこの文字列を含むものだけ取る（動作確認用） */
const match = stringAfter("--match");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY が未設定。AI引用チェックは行わない。");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

type Result = {
  /** このキーワードを狙っている記事。複数あることがある。 */
  slugs: string[];
  keyword: string;
  cited: boolean;
  /** 引用元のドメイン（重複を除く） */
  domains: string[];
  /**
   * 引用された自サイトのURL（中継URLのリダイレクトを解いたもの）。
   * ドメインだけでは、狙った記事が引かれたのか別の記事が引かれたのかが分からない。
   * 解けなかったものは中継URLのまま入れる。
   */
  citedUrls: string[];
  /** Gemini が実際に投げた検索クエリ */
  searchQueries: string[];
  tokens: number;
  error?: string;
  /**
   * 回ごとの結果（--repeat）。上の各フィールドは1回目の値のまま残す
   * （前の夜の json と比べられるように）。tokens だけは全回の合計。
   */
  runs?: Run[];
};

type Run = Omit<Result, "slugs" | "keyword" | "runs">;

/** 取得できた回のうち、引用された回数と取得できた回数。 */
function citedTally(r: Result): { cited: number; ok: number } {
  const runs = r.runs ?? [r];
  const ok = runs.filter((x) => !x.error);
  return { cited: ok.filter((x) => x.cited).length, ok: ok.length };
}

/** 2回とも / 片方だけ / どちらもなし の3段（回数が3回以上でも同じ考え方）。 */
function stability(r: Result): "毎回" | "一部" | "なし" | "取得失敗" {
  const { cited, ok } = citedTally(r);
  if (ok === 0) return "取得失敗";
  if (cited === 0) return "なし";
  return cited === ok ? "毎回" : "一部";
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function ask(keyword: string): Promise<Run> {
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: `「${keyword}」について知りたい。要点を教えて。` }] }],
      config: { tools: [{ googleSearch: {} }] },
    });

    // groundingChunks の web.uri は中継用のURLで、ドメインは web.title に入る。
    // uri を見てもドメインは分からない。自サイトの分だけ uri のリダイレクトを解いて、
    // どのページが引かれたかを残す。
    const meta = res.candidates?.[0]?.groundingMetadata as
      | { groundingChunks?: { web?: { title?: string; uri?: string } }[]; webSearchQueries?: string[] }
      | undefined;
    const chunks = meta?.groundingChunks ?? [];
    const domains = [
      ...new Set(chunks.map((c) => c.web?.title?.trim()).filter((t): t is string => Boolean(t))),
    ];
    const ownUris = [
      ...new Set(
        chunks
          .filter((c) => c.web?.title?.includes(PUBLIC_SITE_HOST))
          .map((c) => c.web?.uri)
          .filter((u): u is string => Boolean(u))
      ),
    ];
    const citedUrls = [...new Set(await Promise.all(ownUris.map(resolveRedirect)))];
    const tokens = res.usageMetadata?.totalTokenCount ?? 0;
    const searchQueries = meta?.webSearchQueries ?? [];
    // 引用元が0件のときは、検索の結果が返らなかった。「引用なし」と区別しないと、
    // 取れなかった夜を「外れた」と読んでしまう（2026-11-14「昆布水 作り方」）。
    if (chunks.length === 0) {
      return { cited: false, domains, citedUrls, searchQueries, tokens, error: "引用元が0件（検索結果なし）" };
    }
    return {
      cited: domains.some((d) => d.includes(PUBLIC_SITE_HOST)),
      domains,
      citedUrls,
      searchQueries,
      tokens,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { cited: false, domains: [], citedUrls: [], searchQueries: [], tokens: 0, error: message };
  }
}

/** 中継URLの転送先を返す。解けなければ中継URLのまま返す。 */
async function resolveRedirect(uri: string): Promise<string> {
  try {
    const res = await fetch(uri, { redirect: "manual", signal: AbortSignal.timeout(10_000) });
    const location = res.headers.get("location");
    if (location) return new URL(location, uri).toString();
    return uri;
  } catch {
    return uri;
  }
}

/** 自サイトのURLを、表で読みやすいようにパスだけにする。 */
function toPath(url: string): string {
  try {
    const u = new URL(url);
    return u.hostname.includes(PUBLIC_SITE_HOST) ? u.pathname : url;
  } catch {
    return url;
  }
}

function pageCellOf(run: Run, slugs: string[]): string {
  if (!run.cited) return "-";
  const paths = run.citedUrls.map(toPath).filter((p) => p.startsWith("/"));
  if (paths.length === 0) return "URL不明";
  const targets = new Set(slugs.map((s) => `/guide/${s}`));
  const hit = paths.some((p) => targets.has(p.replace(/\/$/, "")));
  return `${hit ? "狙いどおり" : "**別ページ**"}: ${paths.join(" / ")}`;
}

/** 回ごとの「引用されたページ」を「1回目 ／ 2回目」の形で並べる。 */
function pageCell(r: Result): string {
  const runs = r.runs ?? [r];
  if (runs.length === 1) return pageCellOf(runs[0], r.slugs);
  return runs.map((x, i) => `${i + 1}: ${x.error ? "取得失敗" : pageCellOf(x, r.slugs)}`).join(" ／ ");
}

function markCell(r: Result): string {
  const runs = r.runs ?? [r];
  if (runs.length === 1) {
    return r.error ? `取得失敗: ${r.error.slice(0, 40)}` : r.cited ? "**引用された**" : "引用なし";
  }
  const { cited, ok } = citedTally(r);
  const s = stability(r);
  const label =
    s === "毎回" ? "**毎回引用**" : s === "一部" ? "一部だけ" : s === "なし" ? "引用なし" : "取得失敗";
  const failed = runs.length - ok;
  return `${label}（${cited}/${ok}${failed > 0 ? `・失敗${failed}` : ""}）`;
}

function markdown(results: Result[]): string {
  const ok = results.filter((r) => r.cited);
  const failed = results.filter((r) => r.error);
  const tokens = results.reduce((sum, r) => sum + r.tokens, 0);

  // 競合の集計。自サイトは除く。
  const counts = new Map<string, number>();
  for (const r of results) {
    for (const d of r.domains) {
      if (d.includes(PUBLIC_SITE_HOST)) continue;
      counts.set(d, (counts.get(d) ?? 0) + 1);
    }
  }
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);

  const lines: string[] = [];
  lines.push("# AI引用チェック");
  lines.push("");
  lines.push(`${new Date().toLocaleString("sv-SE")} 実行。モデル: ${MODEL}`);
  lines.push("");
  lines.push(
    `狙いキーワード ${results.length}件のうち、自サイトが引用されたのは **${ok.length}件**（1回目の結果。前の夜と比べる数）。`
  );
  const calls = results.reduce((sum, r) => sum + (r.runs?.length ?? 1), 0);
  if (calls > results.length) {
    const count = (s: ReturnType<typeof stability>) => results.filter((r) => stability(r) === s).length;
    lines.push("");
    lines.push(
      `1語あたり ${Math.round(calls / results.length)}回取った。` +
        `**毎回引用 ${count("毎回")}件** / 一部だけ ${count("一部")}件 / 引用なし ${count("なし")}件 / 取得失敗 ${count("取得失敗")}件。`
    );
    lines.push("「一部だけ」は取るたびに入れ替わる語で、1夜の出入りを打ち手の効果と読まない。");
  }
  lines.push("");
  lines.push(`消費トークン ${tokens.toLocaleString()}（呼び出し ${calls}回）。`);
  if (failed.length > 0) lines.push(`取得できなかったもの ${failed.length}件（下の表に理由）。`);
  lines.push("");

  lines.push("## キーワード別");
  lines.push("");
  lines.push("| 狙う語 | 記事 | 自サイト | 引用されたページ | 引用元ドメイン |");
  lines.push("| --- | --- | --- | --- | --- |");
  for (const r of results) {
    lines.push(
      `| ${r.keyword} | ${r.slugs.join(" / ")} | ${markCell(r)} | ${pageCell(r)} | ${r.domains.join(" / ") || "-"} |`
    );
  }
  lines.push("");
  lines.push(
    "「引用されたページ」: 狙いの記事が引かれたら「狙いどおり」、別のページなら「別ページ」。" +
      "中継URLを解けなかったものは「URL不明」（ドメインでは引用ありと出ている）。"
  );
  lines.push("");

  lines.push("## 引用されている他ドメイン（回数順）");
  lines.push("");
  if (top.length === 0) {
    lines.push("なし。");
  } else {
    lines.push("| ドメイン | 引用された狙いキーワード数 |");
    lines.push("| --- | ---: |");
    for (const [domain, n] of top) lines.push(`| ${domain} | ${n} |`);
  }
  lines.push("");

  lines.push("## 展開された検索クエリ");
  lines.push("");
  lines.push("AI が実際に投げたクエリ。ここに出ている問いは FAQ に足す候補になる。");
  lines.push("");
  for (const r of results) {
    if (r.searchQueries.length === 0) continue;
    lines.push(`- ${r.keyword} → ${r.searchQueries.join(" / ")}`);
  }
  lines.push("");
  return lines.join("\n");
}

async function main() {
  // 狙いキーワードは記事間で重なる（商品検索用の語なので、柱と枝で同じに
  // なることがある）。キーワード単位にまとめないと、同じ問いを2回投げて
  // API を余分に使う。
  const byKeyword = new Map<string, string[]>();
  for (const [slug, g] of Object.entries(GUIDES)) {
    // 狙う語で測る。searchKeyword は商品検索用で、記事の出来とは別物
    // （昆布締めの個別記事が「真昆布」「羅臼昆布」で測られていた）。
    const query = g.targetQuery ?? g.searchKeyword;
    if (!query) continue;
    const slugs = byKeyword.get(query) ?? [];
    slugs.push(slug);
    byKeyword.set(query, slugs);
  }
  const entries = [...byKeyword.entries()]
    .map(([keyword, slugs]) => ({ keyword, slugs }))
    .filter((e) => !match || e.keyword.includes(match));
  const targets = limit > 0 ? entries.slice(0, limit) : entries;

  console.log(`\nAI引用チェック: ${targets.length}件 (${MODEL})\n`);

  const results: Result[] = [];
  for (const [i, t] of targets.entries()) {
    const runs: Run[] = [];
    for (let n = 0; n < repeat; n++) {
      const r = await ask(t.keyword);
      runs.push(r);
      const mark = r.error ? "ERR " : r.cited ? "引用 " : "--  ";
      const pages = r.citedUrls.length > 0 ? `  ${r.citedUrls.map(toPath).join(" ")}` : "";
      const nth = repeat > 1 ? ` #${n + 1}` : "";
      console.log(`[${i + 1}/${targets.length}]${nth} ${mark} ${t.keyword}  (${r.domains.length}ドメイン)${pages}`);
      const last = i === targets.length - 1 && n === repeat - 1;
      if (!last) await sleep(INTERVAL_MS);
    }
    const first = runs[0];
    results.push({
      slugs: t.slugs,
      keyword: t.keyword,
      ...first,
      tokens: runs.reduce((sum, r) => sum + r.tokens, 0),
      ...(repeat > 1 ? { runs } : {}),
    });
  }

  // --out で渡された先は無いことがある。nightDir() は自分で作るが、
  // こちらは作られていない前提で揃える。
  const dir = outDir ? path.resolve(outDir) : nightDir();
  mkdirSync(dir, { recursive: true });
  const mdPath = path.join(dir, "ai-citation.md");
  const jsonPath = path.join(dir, "ai-citation.json");
  writeFileSync(mdPath, markdown(results));
  writeFileSync(jsonPath, JSON.stringify(results, null, 2));

  const cited = results.filter((r) => r.cited).length;
  const errors = results.filter((r) => r.error).length;
  const tokens = results.reduce((sum, r) => sum + r.tokens, 0);
  console.log(`\n${mdPath}`);
  const steady =
    repeat > 1 ? ` / 毎回引用 ${results.filter((r) => stability(r) === "毎回").length}・一部 ${results.filter((r) => stability(r) === "一部").length}` : "";
  console.log(
    `SUMMARY: 引用 ${cited}/${results.length}${steady} / 取得失敗 ${errors} / トークン ${tokens}`
  );
}

main();
