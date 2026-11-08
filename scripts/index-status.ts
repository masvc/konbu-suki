/**
 * Search Console でインデックス状況を調べ、未登録の理由別に数える。
 *
 * Usage:
 *   npx tsx scripts/index-status.ts              # ガイド記事＋主要ページ
 *   npx tsx scripts/index-status.ts --all        # サイトマップの全URL（時間がかかる）
 *   npx tsx scripts/index-status.ts --out docs/night/2026-11-09
 *
 * 「検出 - インデックス未登録」と「クロール済み - インデックス未登録」は意味が違う。
 *   検出     … URL は知っているが、まだページを取得していない。待てば進む
 *   クロール済み … 中身を見たうえで登録を見送っている。記事の強化が効く
 * この2つを分けて数えないと、何をすべきか決められない。
 *
 * あわせて、人が URL 検査からインデックス登録をリクエストする優先URLを5本選ぶ。
 * リクエストは API からはできず（Indexing API は求人・配信イベント専用）、
 * 1日の上限もあるので、効く順に並べる。
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getSearchConsoleClient, SEARCH_CONSOLE_SITE } from "./lib/google-auth";
import { GUIDES } from "../src/lib/guides";
import { PUBLIC_SITE_URL } from "./lib/site";
import { nightDir } from "./lib/night";

/** API は1件ずつ。続けて投げると弾かれるので間隔を空ける。 */
const INTERVAL_MS = 1200;

const args = process.argv.slice(2);
const all = args.includes("--all");
const outDir = (() => {
  const i = args.indexOf("--out");
  return i === -1 ? null : args[i + 1] || null;
})();

type Row = {
  path: string;
  state: string;
  lastCrawl: string | null;
  googleCanonical: string | null;
  /** 内部リンクで何本から指されているか。多いほど柱に近い */
  inbound: number;
  /** 本文の文字数 */
  length: number;
};

/** related の被リンク数を数える。柱記事ほど多く指される。 */
function inboundCounts(): Map<string, number> {
  const counts = new Map<string, number>();
  for (const slug of Object.keys(GUIDES)) counts.set(slug, 0);
  for (const g of Object.values(GUIDES)) {
    for (const target of g.related ?? []) {
      if (counts.has(target)) counts.set(target, (counts.get(target) ?? 0) + 1);
    }
  }
  return counts;
}

function bodyLength(slug: string): number {
  const g = GUIDES[slug as keyof typeof GUIDES];
  return g.sections.reduce((sum, s) => sum + s.body.length, 0);
}

async function inspect(sc: ReturnType<typeof getSearchConsoleClient>, url: string) {
  try {
    const res = await (
      sc as unknown as {
        urlInspection: {
          index: {
            inspect: (a: unknown) => Promise<{
              data?: {
                inspectionResult?: {
                  indexStatusResult?: {
                    coverageState?: string;
                    lastCrawlTime?: string;
                    googleCanonical?: string;
                  };
                };
              };
            }>;
          };
        };
      }
    ).urlInspection.index.inspect({
      requestBody: { inspectionUrl: url, siteUrl: SEARCH_CONSOLE_SITE, languageCode: "ja" },
    });
    const r = res.data?.inspectionResult?.indexStatusResult ?? {};
    return {
      state: r.coverageState ?? "取得できず",
      lastCrawl: r.lastCrawlTime ?? null,
      googleCanonical: r.googleCanonical ?? null,
    };
  } catch (e) {
    return {
      state: `取得できず（${e instanceof Error ? e.message.slice(0, 50) : ""}）`,
      lastCrawl: null,
      googleCanonical: null,
    };
  }
}

/** 登録されている状態かどうか。文言は日本語で返る。 */
function isIndexed(state: string): boolean {
  return state.includes("登録されました") || state.includes("インデックスに登録済み");
}

async function main() {
  const sc = getSearchConsoleClient();
  const inbound = inboundCounts();

  const paths = all
    ? ["/", "/guide", ...Object.keys(GUIDES).map((s) => `/guide/${s}`)]
    : ["/", "/guide", ...Object.keys(GUIDES).map((s) => `/guide/${s}`)];

  console.log(`\nインデックス状況: ${paths.length}ページ\n`);
  const rows: Row[] = [];
  for (const [i, p] of paths.entries()) {
    const slug = p.startsWith("/guide/") ? p.slice("/guide/".length) : "";
    const r = await inspect(sc, `${PUBLIC_SITE_URL}${p}`);
    rows.push({
      path: p,
      state: r.state,
      lastCrawl: r.lastCrawl,
      googleCanonical: r.googleCanonical,
      inbound: slug ? (inbound.get(slug) ?? 0) : 99,
      length: slug ? bodyLength(slug) : 0,
    });
    console.log(`  [${i + 1}/${paths.length}] ${p.padEnd(34)} ${r.state}`);
    if (i < paths.length - 1) await new Promise((res) => setTimeout(res, INTERVAL_MS));
  }

  // 理由別に数える
  const byState = new Map<string, string[]>();
  for (const r of rows) byState.set(r.state, [...(byState.get(r.state) ?? []), r.path]);

  // 人がリクエストする優先URL。登録されていないもののうち、
  // 内部リンクで多く指されている（＝柱に近い）順、次に本文が長い順。
  const priority = rows
    .filter((r) => !isIndexed(r.state) && !r.state.startsWith("取得できず"))
    .sort((a, b) => b.inbound - a.inbound || b.length - a.length)
    .slice(0, 5);

  const lines: string[] = ["# インデックス状況", ""];
  lines.push(`${new Date().toLocaleString("sv-SE")} 取得。対象 ${rows.length}ページ`);
  lines.push("");
  lines.push("## 理由別の件数");
  lines.push("");
  lines.push("| 状態 | 件数 |");
  lines.push("| --- | ---: |");
  for (const [state, list] of [...byState.entries()].sort((a, b) => b[1].length - a[1].length)) {
    lines.push(`| ${state} | ${list.length} |`);
  }
  lines.push("");
  lines.push("「検出 - インデックス未登録」はまだページを取得していない状態で、待てば進む。");
  lines.push("「クロール済み - インデックス未登録」は中身を見たうえで見送っている状態で、記事の強化が効く。");
  lines.push("");
  lines.push("## URL検査でリクエストする優先5本");
  lines.push("");
  lines.push("人が Search Console の URL 検査から登録をリクエストする。API からはできない。");
  lines.push("内部リンクで多く指されている（柱に近い）順。柱が載れば、そこから個別記事も見つかりやすくなる。");
  lines.push("");
  for (const [i, r] of priority.entries()) {
    lines.push(`${i + 1}. ${PUBLIC_SITE_URL}${r.path}`);
    lines.push(`   状態: ${r.state} / 被リンク ${r.inbound}本 / 本文 ${r.length}字`);
  }
  lines.push("");
  lines.push("## 全ページ");
  lines.push("");
  lines.push("| ページ | 状態 | 最終クロール |");
  lines.push("| --- | --- | --- |");
  for (const r of rows) {
    lines.push(`| ${r.path} | ${r.state} | ${r.lastCrawl ?? "未"} |`);
  }

  const dir = outDir ? path.resolve(outDir) : nightDir();
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "index-status.md");
  writeFileSync(file, lines.join("\n") + "\n");
  writeFileSync(path.join(dir, "index-status.json"), JSON.stringify({ rows, priority }, null, 2));

  const indexed = rows.filter((r) => isIndexed(r.state)).length;
  console.log(`\n${file}`);
  console.log(`SUMMARY: 登録 ${indexed}/${rows.length} / 未登録の理由 ${byState.size}種 / 優先URL ${priority.length}本`);
}

main();
