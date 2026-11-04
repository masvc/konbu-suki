/**
 * SEO効果測定スナップショット
 *
 * Search Console データを JSON に保存して前回比較。
 * 使い方:
 *   npx tsx scripts/seo-snapshot.ts          # スナップショット保存
 *   npx tsx scripts/seo-snapshot.ts compare  # 前回との比較
 *   npx tsx scripts/seo-snapshot.ts 7        # 過去7日のデータ
 */

import "dotenv/config";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { getSearchConsoleClient, SEARCH_CONSOLE_SITE } from "./lib/google-auth";
import { toSitePath } from "./lib/site";

const SNAPSHOT_DIR = "./data/seo-snapshots";
const GOLF_FILTER = {
  dimension: "page" as const,
  operator: "includingRegex" as const,
  expression: "^https://golf\\.peaky\\.co\\.jp/",
};

function getDateRange(days = 28) {
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start = new Date(end);
  start.setDate(start.getDate() - days);
  return {
    startDate: start.toISOString().split("T")[0],
    endDate: end.toISOString().split("T")[0],
  };
}

type SnapshotRow = {
  key: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type Snapshot = {
  date: string;
  period: { startDate: string; endDate: string };
  summary: { clicks: number; impressions: number; ctr: number; position: number };
  queries: SnapshotRow[];
  pages: SnapshotRow[];
};

async function fetchData(days: number): Promise<Snapshot> {
  const sc = getSearchConsoleClient();
  const { startDate, endDate } = getDateRange(days);
  const filterGroups = [{ filters: [GOLF_FILTER] }];

  // Summary
  const summaryRes = await sc.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: { startDate, endDate, type: "web", dimensionFilterGroups: filterGroups },
  });
  const s = summaryRes.data.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };

  // Queries
  const queryRes = await sc.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: 100,
      type: "web",
      dimensionFilterGroups: filterGroups,
    },
  });

  // Pages
  const pageRes = await sc.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 50,
      type: "web",
      dimensionFilterGroups: filterGroups,
    },
  });

  const mapRows = (rows: typeof queryRes.data.rows): SnapshotRow[] =>
    (rows || []).map((r) => ({
      key: r.keys?.[0] || "",
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0,
    }));

  return {
    date: new Date().toISOString().split("T")[0],
    period: { startDate, endDate },
    summary: {
      clicks: s.clicks as number,
      impressions: s.impressions as number,
      ctr: s.ctr as number,
      position: s.position as number,
    },
    queries: mapRows(queryRes.data.rows),
    pages: mapRows(pageRes.data.rows),
  };
}

function saveSnapshot(snapshot: Snapshot) {
  const { mkdirSync } = require("fs");
  mkdirSync(SNAPSHOT_DIR, { recursive: true });
  const filename = `${SNAPSHOT_DIR}/${snapshot.date}.json`;
  writeFileSync(filename, JSON.stringify(snapshot, null, 2));
  console.log(`\n✅ スナップショット保存: ${filename}`);

  // latest symlink
  const latestPath = `${SNAPSHOT_DIR}/latest.json`;
  writeFileSync(latestPath, JSON.stringify(snapshot, null, 2));
}

function compare(current: Snapshot) {
  // 前回のスナップショットを探す
  const { readdirSync } = require("fs");
  if (!existsSync(SNAPSHOT_DIR)) {
    console.log("前回のスナップショットがありません。まず保存してください。");
    return;
  }

  const files = readdirSync(SNAPSHOT_DIR)
    .filter((f: string) => f.endsWith(".json") && f !== "latest.json")
    .sort()
    .reverse();

  // 今日以外の最新を探す
  const prevFile = files.find((f: string) => f !== `${current.date}.json`);
  if (!prevFile) {
    console.log("比較対象のスナップショットがありません。");
    return;
  }

  const prev: Snapshot = JSON.parse(
    readFileSync(`${SNAPSHOT_DIR}/${prevFile}`, "utf-8")
  );

  console.log(`\n📊 SEO効果測定 比較レポート`);
  console.log(`   前回: ${prev.date} (${prev.period.startDate}〜${prev.period.endDate})`);
  console.log(`   今回: ${current.date} (${current.period.startDate}〜${current.period.endDate})`);
  console.log("=".repeat(60));

  // サマリー比較
  const diff = (a: number, b: number) => {
    const d = a - b;
    return d > 0 ? `+${d.toFixed(1)}` : d.toFixed(1);
  };
  const pctDiff = (a: number, b: number) => {
    const d = (a - b) * 100;
    return d > 0 ? `+${d.toFixed(1)}%` : `${d.toFixed(1)}%`;
  };

  console.log("\n【サマリー】");
  console.log(
    `  クリック:  ${prev.summary.clicks} → ${current.summary.clicks} (${diff(current.summary.clicks, prev.summary.clicks)})`
  );
  console.log(
    `  表示回数:  ${prev.summary.impressions} → ${current.summary.impressions} (${diff(current.summary.impressions, prev.summary.impressions)})`
  );
  console.log(
    `  CTR:       ${(prev.summary.ctr * 100).toFixed(1)}% → ${(current.summary.ctr * 100).toFixed(1)}% (${pctDiff(current.summary.ctr, prev.summary.ctr)})`
  );
  console.log(
    `  順位:      ${prev.summary.position.toFixed(1)} → ${current.summary.position.toFixed(1)} (${diff(current.summary.position, prev.summary.position)})`
  );

  // 新しく登場したクエリ
  const prevQueryKeys = new Set(prev.queries.map((q) => q.key));
  const newQueries = current.queries.filter((q) => !prevQueryKeys.has(q.key) && q.clicks > 0);
  if (newQueries.length > 0) {
    console.log("\n【新規クリック獲得クエリ】");
    for (const q of newQueries.slice(0, 10)) {
      console.log(`  「${q.key}」 ${q.clicks}click / ${q.impressions}imp`);
    }
  }

  // CTR改善ページ
  console.log("\n【ページ別 CTR 変動 Top10】");
  const pageMap = new Map(prev.pages.map((p) => [p.key, p]));
  const pageDiffs = current.pages
    .map((p) => {
      const prevP = pageMap.get(p.key);
      if (!prevP) return null;
      return { key: p.key, prevCtr: prevP.ctr, newCtr: p.ctr, diff: p.ctr - prevP.ctr };
    })
    .filter(Boolean)
    .sort((a, b) => Math.abs(b!.diff) - Math.abs(a!.diff))
    .slice(0, 10);

  for (const d of pageDiffs) {
    if (!d) continue;
    const url = toSitePath(d.key);
    const arrow = d.diff > 0 ? "↑" : "↓";
    console.log(
      `  ${url.padEnd(45)} ${(d.prevCtr * 100).toFixed(1)}% → ${(d.newCtr * 100).toFixed(1)}% ${arrow}`
    );
  }

  console.log("");
}

async function run() {
  const args = process.argv.slice(2);
  const isCompare = args.includes("compare");
  const days = parseInt(args.find((a) => /^\d+$/.test(a)) || "28");

  const snapshot = await fetchData(days);

  if (isCompare) {
    compare(snapshot);
  }

  // Always save
  saveSnapshot(snapshot);

  if (!isCompare) {
    console.log(`\nクリック: ${snapshot.summary.clicks}`);
    console.log(`表示:     ${snapshot.summary.impressions}`);
    console.log(`CTR:      ${(snapshot.summary.ctr * 100).toFixed(1)}%`);
    console.log(`順位:     ${snapshot.summary.position.toFixed(1)}`);
    console.log(`\n次回「npx tsx scripts/seo-snapshot.ts compare」で比較できます。`);
  }
}

run().catch(console.error);
