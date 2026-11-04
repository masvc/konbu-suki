/**
 * 月次SEO/アナリティクスレポート
 *
 * GSC + GA4 のスナップショットを保存し、前月比較を出力。
 * 月初に1回実行すればOK。
 *
 * Usage:
 *   npx tsx scripts/monthly-report.ts          # 過去28日レポート + スナップショット保存
 *   npx tsx scripts/monthly-report.ts --no-save # 保存せずレポートのみ
 */
import "dotenv/config";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { getSearchConsoleClient, getGA4Client, SEARCH_CONSOLE_SITE } from "./lib/google-auth";
import { toSitePath } from "./lib/site";

const GA4_PROPERTY = process.env.GA4_PROPERTY_ID;
const REPORT_DIR = "./data/monthly-reports";
const GOLF_FILTER = {
  dimension: "page" as const,
  operator: "includingRegex" as const,
  expression: "^https://golf\\.peaky\\.co\\.jp/",
};

type MonthlyReport = {
  date: string;
  period: { startDate: string; endDate: string };
  gsc: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    topQueries: { key: string; clicks: number; impressions: number; ctr: number; position: number }[];
    topPages: { key: string; clicks: number; impressions: number; ctr: number; position: number }[];
  };
  ga4: {
    users: number;
    sessions: number;
    pageViews: number;
    avgDuration: number;
    bounceRate: number;
    topSources: { source: string; sessions: number }[];
  } | null;
};

async function fetchGSC(days = 28) {
  const sc = getSearchConsoleClient();
  const end = new Date(); end.setDate(end.getDate() - 3);
  const start = new Date(end); start.setDate(start.getDate() - days);
  const startDate = start.toISOString().split("T")[0];
  const endDate = end.toISOString().split("T")[0];
  const fg = [{ filters: [GOLF_FILTER] }];

  const [summary, queries, pages] = await Promise.all([
    sc.searchanalytics.query({ siteUrl: SEARCH_CONSOLE_SITE, requestBody: { startDate, endDate, type: "web", dimensionFilterGroups: fg } }),
    sc.searchanalytics.query({ siteUrl: SEARCH_CONSOLE_SITE, requestBody: { startDate, endDate, dimensions: ["query"], rowLimit: 50, type: "web", dimensionFilterGroups: fg } }),
    sc.searchanalytics.query({ siteUrl: SEARCH_CONSOLE_SITE, requestBody: { startDate, endDate, dimensions: ["page"], rowLimit: 30, type: "web", dimensionFilterGroups: fg } }),
  ]);

  const s = summary.data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const mapRows = (rows: typeof queries.data.rows) =>
    (rows || []).map((r) => ({
      key: toSitePath(r.keys?.[0] || ""),
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }));

  return {
    period: { startDate, endDate },
    clicks: s.clicks as number,
    impressions: s.impressions as number,
    ctr: s.ctr as number,
    position: s.position as number,
    topQueries: mapRows(queries.data.rows),
    topPages: mapRows(pages.data.rows),
  };
}

async function fetchGA4(days = 28) {
  if (!GA4_PROPERTY) return null;
  const ad = getGA4Client();
  const startDate = `${days}daysAgo`;
  const endDate = "today";

  const [summary, sources] = await Promise.all([
    ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" },
          { name: "averageSessionDuration" }, { name: "bounceRate" },
        ],
      },
    }),
    ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "10",
      },
    }),
  ]);

  const row = summary.data.rows?.[0]?.metricValues;
  if (!row) return null;

  return {
    users: Number(row[0].value),
    sessions: Number(row[1].value),
    pageViews: Number(row[2].value),
    avgDuration: Math.round(Number(row[3].value)),
    bounceRate: Number((Number(row[4].value) * 100).toFixed(1)),
    topSources: (sources.data.rows || []).map((r) => ({
      source: `${r.dimensionValues![0].value} / ${r.dimensionValues![1].value}`,
      sessions: Number(r.metricValues![0].value),
    })),
  };
}

function printReport(report: MonthlyReport, prev: MonthlyReport | null) {
  const pct = (a: number, b: number) => b === 0 ? "N/A" : `${((a - b) / b * 100).toFixed(1)}%`;
  const diff = (a: number, b: number) => {
    const d = a - b;
    return d >= 0 ? `+${d}` : `${d}`;
  };

  console.log(`\n${"=".repeat(70)}`);
  console.log(`  月次レポート: ${report.date}`);
  console.log(`  期間: ${report.period.startDate} 〜 ${report.period.endDate}`);
  if (prev) console.log(`  前回: ${prev.date} (${prev.period.startDate} 〜 ${prev.period.endDate})`);
  console.log(`${"=".repeat(70)}`);

  // GSC
  console.log(`\n【Search Console】`);
  console.log(`  クリック:  ${report.gsc.clicks}${prev ? ` (${diff(report.gsc.clicks, prev.gsc.clicks)}, ${pct(report.gsc.clicks, prev.gsc.clicks)})` : ""}`);
  console.log(`  表示:      ${report.gsc.impressions}${prev ? ` (${diff(report.gsc.impressions, prev.gsc.impressions)}, ${pct(report.gsc.impressions, prev.gsc.impressions)})` : ""}`);
  console.log(`  CTR:       ${(report.gsc.ctr * 100).toFixed(1)}%${prev ? ` (${diff(Number((report.gsc.ctr * 100).toFixed(1)), Number((prev.gsc.ctr * 100).toFixed(1)))}pt)` : ""}`);
  console.log(`  平均順位:  ${report.gsc.position.toFixed(1)}${prev ? ` (${diff(Number(report.gsc.position.toFixed(1)), Number(prev.gsc.position.toFixed(1)))})` : ""}`);

  console.log(`\n  Top10 クエリ:`);
  for (const q of report.gsc.topQueries.slice(0, 10)) {
    console.log(`    ${q.key.padEnd(40)} ${String(q.clicks).padStart(4)} click  ${String(q.impressions).padStart(5)} imp  ${(q.ctr * 100).toFixed(1).padStart(4)}%  pos ${q.position.toFixed(1)}`);
  }

  // GA4
  if (report.ga4) {
    console.log(`\n【GA4】`);
    console.log(`  PV:        ${report.ga4.pageViews}${prev?.ga4 ? ` (${diff(report.ga4.pageViews, prev.ga4.pageViews)}, ${pct(report.ga4.pageViews, prev.ga4.pageViews)})` : ""}`);
    console.log(`  Users:     ${report.ga4.users}${prev?.ga4 ? ` (${diff(report.ga4.users, prev.ga4.users)})` : ""}`);
    console.log(`  Sessions:  ${report.ga4.sessions}${prev?.ga4 ? ` (${diff(report.ga4.sessions, prev.ga4.sessions)})` : ""}`);
    console.log(`  直帰率:    ${report.ga4.bounceRate}%${prev?.ga4 ? ` (${diff(report.ga4.bounceRate, prev.ga4.bounceRate)}pt)` : ""}`);
    console.log(`  平均滞在:  ${report.ga4.avgDuration}秒${prev?.ga4 ? ` (${diff(report.ga4.avgDuration, prev.ga4.avgDuration)}秒)` : ""}`);

    console.log(`\n  流入Top5:`);
    for (const s of report.ga4.topSources.slice(0, 5)) {
      console.log(`    ${s.source.padEnd(35)} ${String(s.sessions).padStart(5)} sessions`);
    }
  }

  console.log(`\n${"=".repeat(70)}\n`);
}

async function main() {
  const noSave = process.argv.includes("--no-save");

  console.log("GSC データ取得中...");
  const gsc = await fetchGSC();
  console.log("GA4 データ取得中...");
  const ga4 = await fetchGA4();

  const report: MonthlyReport = {
    date: new Date().toISOString().split("T")[0],
    period: gsc.period,
    gsc: {
      clicks: gsc.clicks,
      impressions: gsc.impressions,
      ctr: gsc.ctr,
      position: gsc.position,
      topQueries: gsc.topQueries,
      topPages: gsc.topPages,
    },
    ga4,
  };

  // 前回のレポートを読み込み
  let prev: MonthlyReport | null = null;
  if (existsSync(REPORT_DIR)) {
    const files = readdirSync(REPORT_DIR)
      .filter((f: string) => f.endsWith(".json") && f !== "latest.json")
      .sort()
      .reverse();
    const prevFile = files.find((f: string) => f !== `${report.date}.json`);
    if (prevFile) {
      prev = JSON.parse(readFileSync(`${REPORT_DIR}/${prevFile}`, "utf-8"));
    }
  }

  printReport(report, prev);

  if (!noSave) {
    mkdirSync(REPORT_DIR, { recursive: true });
    const filename = `${REPORT_DIR}/${report.date}.json`;
    writeFileSync(filename, JSON.stringify(report, null, 2));
    writeFileSync(`${REPORT_DIR}/latest.json`, JSON.stringify(report, null, 2));
    console.log(`✅ レポート保存: ${filename}`);
  }
}

main().catch(console.error);
