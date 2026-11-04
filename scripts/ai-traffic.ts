/**
 * AI流入分析スクリプト
 *
 * OpenAI / ChatGPT / Copilot / Perplexity 等からの流入を
 * 日別・ページ別に分析。LLMO施策の効果測定に使う。
 *
 * Usage:
 *   npx tsx scripts/ai-traffic.ts              # 過去28日
 *   npx tsx scripts/ai-traffic.ts 7            # 過去7日
 *   npx tsx scripts/ai-traffic.ts 2026-05-01 2026-05-31
 */
import "dotenv/config";
import { AI_SOURCES, parseDateArgs } from "./lib/analytics-constants";
import { getGA4Client, requireGA4PropertyId } from "./lib/google-auth";

const PROPERTY_ID = requireGA4PropertyId();

async function main() {
  const ad = getGA4Client();
  const { startDate, endDate } = parseDateArgs();

  console.log(`\nAI流入分析 (${startDate} ~ ${endDate})`);
  console.log("=".repeat(70));

  // 1. 全セッションのソース別（AI系を識別）
  const allSources = await ad.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "sessionSource" }],
      metrics: [
        { name: "sessions" },
        { name: "activeUsers" },
        { name: "engagedSessions" },
        { name: "averageSessionDuration" },
        { name: "screenPageViews" },
      ],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "50",
    },
  });

  let totalSessions = 0;
  let aiSessions = 0;
  const aiBreakdown: { source: string; sessions: number; users: number; engaged: number; duration: number; pv: number }[] = [];

  for (const row of allSources.data.rows || []) {
    const source = row.dimensionValues![0].value!.toLowerCase();
    const sessions = Number(row.metricValues![0].value);
    totalSessions += sessions;

    if (AI_SOURCES.some((ai) => source.includes(ai))) {
      aiSessions += sessions;
      aiBreakdown.push({
        source: row.dimensionValues![0].value!,
        sessions,
        users: Number(row.metricValues![1].value),
        engaged: Number(row.metricValues![2].value),
        duration: Math.round(Number(row.metricValues![3].value)),
        pv: Number(row.metricValues![4].value),
      });
    }
  }

  console.log(`\n【AI流入サマリー】`);
  console.log(`  AI流入: ${aiSessions} sessions (全体${totalSessions}の ${(aiSessions / totalSessions * 100).toFixed(1)}%)`);

  if (aiBreakdown.length > 0) {
    console.log(`\n${"ソース".padEnd(30)} ${"Sessions".padStart(8)} ${"Users".padStart(6)} ${"Engaged".padStart(8)} ${"滞在".padStart(6)} ${"PV".padStart(5)}`);
    console.log("-".repeat(68));
    for (const a of aiBreakdown) {
      console.log(
        `${a.source.padEnd(30)} ${String(a.sessions).padStart(8)} ${String(a.users).padStart(6)} ${String(a.engaged).padStart(8)} ${(a.duration + "s").padStart(6)} ${String(a.pv).padStart(5)}`
      );
    }
  }

  // 2. AI流入のランディングページ
  const aiFilter = {
    orGroup: {
      expressions: AI_SOURCES.map((s) => ({
        filter: { fieldName: "sessionSource", stringFilter: { value: s, matchType: "CONTAINS" as const } },
      })),
    },
  };

  const aiPages = await ad.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }, { name: "activeUsers" }, { name: "engagedSessions" }],
      dimensionFilter: aiFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "20",
    },
  });

  console.log(`\n【AI流入 ランディングページ Top20】`);
  console.log(`${"ページ".padEnd(50)} ${"Sessions".padStart(8)} ${"Users".padStart(6)} ${"Engaged".padStart(8)}`);
  console.log("-".repeat(76));
  for (const row of aiPages.data.rows || []) {
    const page = row.dimensionValues![0].value!;
    console.log(
      `${page.slice(0, 49).padEnd(50)} ${row.metricValues![0].value!.padStart(8)} ${row.metricValues![1].value!.padStart(6)} ${row.metricValues![2].value!.padStart(8)}`
    );
  }

  // 3. 日別AI流入トレンド
  const dailyAi = await ad.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "sessions" }],
      dimensionFilter: aiFilter,
      orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
    },
  });

  console.log(`\n【日別AI流入トレンド】`);
  const dailyData = (dailyAi.data.rows || []).map((r) => ({
    date: r.dimensionValues![0].value!,
    sessions: Number(r.metricValues![0].value),
  }));

  // 週ごとにまとめて見やすく
  if (dailyData.length > 14) {
    console.log("  (週別集計)");
    let weekSum = 0;
    let weekStart = "";
    for (let i = 0; i < dailyData.length; i++) {
      if (i % 7 === 0) {
        if (weekStart) console.log(`  ${weekStart}~  ${String(weekSum).padStart(4)} sessions`);
        weekSum = 0;
        weekStart = `${dailyData[i].date.slice(0, 4)}-${dailyData[i].date.slice(4, 6)}-${dailyData[i].date.slice(6, 8)}`;
      }
      weekSum += dailyData[i].sessions;
    }
    if (weekStart) console.log(`  ${weekStart}~  ${String(weekSum).padStart(4)} sessions`);
  } else {
    for (const d of dailyData) {
      const formatted = `${d.date.slice(0, 4)}-${d.date.slice(4, 6)}-${d.date.slice(6, 8)}`;
      const bar = "#".repeat(Math.min(d.sessions, 30));
      console.log(`  ${formatted} ${String(d.sessions).padStart(3)} ${bar}`);
    }
  }

  // 4. AI vs 検索エンジン比較
  const searchSessions = (allSources.data.rows || [])
    .filter((r) => {
      const s = r.dimensionValues![0].value!.toLowerCase();
      return ["google", "bing", "yahoo", "duckduckgo"].some((se) => s.includes(se));
    })
    .reduce((sum, r) => sum + Number(r.metricValues![0].value), 0);

  console.log(`\n【AI vs 検索エンジン】`);
  console.log(`  検索エンジン: ${searchSessions} sessions (${(searchSessions / totalSessions * 100).toFixed(1)}%)`);
  console.log(`  AI:           ${aiSessions} sessions (${(aiSessions / totalSessions * 100).toFixed(1)}%)`);
  console.log(`  AI/検索比:    ${(aiSessions / searchSessions * 100).toFixed(1)}%`);

  console.log("\n");
}

main().catch(console.error);
