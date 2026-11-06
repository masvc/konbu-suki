/**
 * AI検索で引用されているかを確かめる。
 *
 * Usage:
 *   npx tsx scripts/ai-citation-check.ts              # 全記事の狙いキーワード
 *   npx tsx scripts/ai-citation-check.ts --limit 5    # 件数を絞る
 *   npx tsx scripts/ai-citation-check.ts --out docs/night/2026-11-05
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
const outDir = stringAfter("--out");

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
  /** Gemini が実際に投げた検索クエリ */
  searchQueries: string[];
  tokens: number;
  error?: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function ask(keyword: string): Promise<Omit<Result, "slugs" | "keyword">> {
  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: `「${keyword}」について知りたい。要点を教えて。` }] }],
      config: { tools: [{ googleSearch: {} }] },
    });

    // groundingChunks の web.uri は中継用のURLで、ドメインは web.title に入る。
    // uri を見てもドメインは分からない。
    const meta = res.candidates?.[0]?.groundingMetadata as
      | { groundingChunks?: { web?: { title?: string } }[]; webSearchQueries?: string[] }
      | undefined;
    const domains = [
      ...new Set(
        (meta?.groundingChunks ?? [])
          .map((c) => c.web?.title?.trim())
          .filter((t): t is string => Boolean(t))
      ),
    ];
    return {
      cited: domains.some((d) => d.includes(PUBLIC_SITE_HOST)),
      domains,
      searchQueries: meta?.webSearchQueries ?? [],
      tokens: res.usageMetadata?.totalTokenCount ?? 0,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { cited: false, domains: [], searchQueries: [], tokens: 0, error: message };
  }
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
    `狙いキーワード ${results.length}件のうち、自サイトが引用されたのは **${ok.length}件**。`
  );
  lines.push(`消費トークン ${tokens.toLocaleString()}（呼び出し ${results.length}回）。`);
  if (failed.length > 0) lines.push(`取得できなかったもの ${failed.length}件（下の表に理由）。`);
  lines.push("");

  lines.push("## キーワード別");
  lines.push("");
  lines.push("| 狙う語 | 記事 | 自サイト | 引用元ドメイン |");
  lines.push("| --- | --- | --- | --- |");
  for (const r of results) {
    const mark = r.error ? `取得失敗: ${r.error.slice(0, 40)}` : r.cited ? "**引用された**" : "引用なし";
    lines.push(`| ${r.keyword} | ${r.slugs.join(" / ")} | ${mark} | ${r.domains.join(" / ") || "-"} |`);
  }
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
  const entries = [...byKeyword.entries()].map(([keyword, slugs]) => ({ keyword, slugs }));
  const targets = limit > 0 ? entries.slice(0, limit) : entries;

  console.log(`\nAI引用チェック: ${targets.length}件 (${MODEL})\n`);

  const results: Result[] = [];
  for (const [i, t] of targets.entries()) {
    const r = await ask(t.keyword);
    results.push({ slugs: t.slugs, keyword: t.keyword, ...r });
    const mark = r.error ? "ERR " : r.cited ? "引用 " : "--  ";
    console.log(`[${i + 1}/${targets.length}] ${mark} ${t.keyword}  (${r.domains.length}ドメイン)`);
    if (i < targets.length - 1) await sleep(INTERVAL_MS);
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
  console.log(
    `SUMMARY: 引用 ${cited}/${results.length} / 取得失敗 ${errors} / トークン ${tokens}`
  );
}

main();
