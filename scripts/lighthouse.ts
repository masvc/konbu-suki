/**
 * Core Web Vitals を PageSpeed Insights で計測する。
 *
 * Usage:
 *   npx tsx scripts/lighthouse.ts                 # 主要ページ
 *   npx tsx scripts/lighthouse.ts --all           # 全ガイド記事も
 *   npx tsx scripts/lighthouse.ts --url /guide/x
 *   npx tsx scripts/lighthouse.ts --desktop
 *
 * **APIキーが要る。** キー無しでも叩けるが、共有枠なのですぐ上限に当たる
 * （実際 "Quota exceeded for quota metric 'Queries'" が返った）。
 * .env に PAGESPEED_API_KEY を足すと安定して計測できる。
 * 取得先: Google Cloud コンソールで PageSpeed Insights API を有効にして APIキーを作る。
 *
 * 未設定でもキー無しで1回は試す。落ちたら理由を出して終わる（夜間の枠を
 * 止めないため）。
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GUIDES } from "../src/lib/guides";
import { PUBLIC_SITE_URL } from "./lib/site";
import { nightDir } from "./lib/night";

const args = process.argv.slice(2);
const all = args.includes("--all");
const desktop = args.includes("--desktop");
const stringAfter = (f: string) => {
  const i = args.indexOf(f);
  return i === -1 ? null : args[i + 1] || null;
};
const urlArg = stringAfter("--url");
const outDir = stringAfter("--out");

/** 計測の対象。全記事を毎回叩くと時間も枠も食うので、既定は代表的な3ページ。 */
function targets(): string[] {
  if (urlArg) return [urlArg];
  if (all) return ["/", "/guide", ...Object.keys(GUIDES).map((s) => `/guide/${s}`)];
  return ["/", "/guide", "/guide/kobujime"];
}

type Row = {
  path: string;
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
  bestPractices: number | null;
  lcp: string | null;
  cls: string | null;
  tbt: string | null;
  error?: string;
};

async function measure(p: string): Promise<Row> {
  const params = new URLSearchParams({
    url: `${PUBLIC_SITE_URL}${p}`,
    strategy: desktop ? "desktop" : "mobile",
  });
  for (const c of ["performance", "seo", "accessibility", "best-practices"]) {
    params.append("category", c);
  }
  const key = process.env.PAGESPEED_API_KEY;
  if (key) params.set("key", key);

  const empty: Row = {
    path: p,
    performance: null,
    seo: null,
    accessibility: null,
    bestPractices: null,
    lcp: null,
    cls: null,
    tbt: null,
  };
  try {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`);
    // PSI の応答は項目が多いので、使うところだけ型を書く。
    type PsiAudit = { displayValue?: string };
    type Psi = {
      error?: { message?: string };
      lighthouseResult?: {
        categories?: Record<string, { score?: number | null }>;
        audits?: Record<string, PsiAudit>;
      };
    };
    const data = (await res.json()) as Psi;
    if (data.error) return { ...empty, error: String(data.error.message ?? "").slice(0, 160) };
    const lr = data.lighthouseResult;
    const score = (k: string) => {
      const v = lr?.categories?.[k]?.score;
      return v == null ? null : Math.round(v * 100);
    };
    return {
      path: p,
      performance: score("performance"),
      seo: score("seo"),
      accessibility: score("accessibility"),
      bestPractices: score("best-practices"),
      lcp: lr?.audits?.["largest-contentful-paint"]?.displayValue ?? null,
      cls: lr?.audits?.["cumulative-layout-shift"]?.displayValue ?? null,
      tbt: lr?.audits?.["total-blocking-time"]?.displayValue ?? null,
    };
  } catch (e) {
    return { ...empty, error: e instanceof Error ? e.message : String(e) };
  }
}

async function main() {
  const paths = targets();
  const strategy = desktop ? "デスクトップ" : "モバイル";
  console.log(`\nCore Web Vitals（${strategy}）: ${paths.length}ページ`);
  if (!process.env.PAGESPEED_API_KEY) {
    console.log("PAGESPEED_API_KEY が未設定。共有枠で叩くので上限に当たることがある。\n");
  }

  const rows: Row[] = [];
  for (const p of paths) {
    const row = await measure(p);
    rows.push(row);
    if (row.error) console.log(`  NG  ${p}  ${row.error}`);
    else
      console.log(
        `  ${String(row.performance).padStart(3)} perf / ${String(row.seo).padStart(3)} seo  ${p}  LCP ${row.lcp} CLS ${row.cls}`
      );
  }

  const dir = outDir ? path.resolve(outDir) : nightDir();
  mkdirSync(dir, { recursive: true });
  const lines = ["# Core Web Vitals", "", `${new Date().toLocaleString("sv-SE")} 計測（${strategy}）`, ""];
  lines.push("| ページ | 性能 | SEO | ユーザー補助 | 推奨事項 | LCP | CLS | TBT |");
  lines.push("| --- | ---: | ---: | ---: | ---: | --- | --- | --- |");
  for (const r of rows) {
    if (r.error) {
      lines.push(`| ${r.path} | 計測できず: ${r.error} | | | | | | |`);
      continue;
    }
    lines.push(
      `| ${r.path} | ${r.performance} | ${r.seo} | ${r.accessibility} | ${r.bestPractices} | ${r.lcp} | ${r.cls} | ${r.tbt} |`
    );
  }
  writeFileSync(path.join(dir, "lighthouse.md"), lines.join("\n") + "\n");

  const failed = rows.filter((r) => r.error).length;
  const low = rows.filter((r) => (r.performance ?? 100) < 90).length;
  console.log(`\n${path.join(dir, "lighthouse.md")}`);
  console.log(`SUMMARY: 計測 ${rows.length - failed}/${rows.length} / 性能90未満 ${low}`);
}

main();
