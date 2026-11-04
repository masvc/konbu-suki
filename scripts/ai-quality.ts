/**
 * AI流入の「質」分析スクリプト
 *
 * LANY竹内氏の示唆:「SEO=入口、AI検索=出口」
 * → AI流入のセッション数ではなく、CTA転換率・回遊率・滞在時間で
 *   AI経由ユーザーが「出口」(購買検討)に至っているかを測定。
 *
 * Google公式(2026/5/20):
 * → 「独自性のある非コモディティコンテンツ」がAI引用の鍵
 * → クエリファンアウトで比較検討が自動生成される
 * → llms.txtはGoogle AI には不要（他AIには有効な可能性）
 *
 * Usage:
 *   npx tsx scripts/ai-quality.ts              # 過去28日
 *   npx tsx scripts/ai-quality.ts 14           # 過去14日
 *   npx tsx scripts/ai-quality.ts 2026-05-01 2026-05-31
 */
import "dotenv/config";
import { getGA4Client, requireGA4PropertyId } from "./lib/google-auth";
import { AI_SOURCES, CTA_EVENTS, parseDateArgs } from "./lib/analytics-constants";

const PROPERTY_ID = requireGA4PropertyId();
const ad = getGA4Client();

const aiFilter = {
  orGroup: {
    expressions: AI_SOURCES.map((s) => ({
      filter: { fieldName: "sessionSource", stringFilter: { value: s, matchType: "CONTAINS" as const } },
    })),
  },
};

const searchFilter = {
  orGroup: {
    expressions: ["google", "bing", "yahoo"].map((s) => ({
      filter: { fieldName: "sessionSource", stringFilter: { value: s, matchType: "CONTAINS" as const } },
    })),
  },
};

async function main() {
  const { startDate, endDate } = parseDateArgs();

  console.log(`\nAI流入「質」分析 (${startDate} ~ ${endDate})`);
  console.log("=".repeat(70));

  // ── 1. AI vs 検索エンジン: エンゲージメント比較 ──
  const [aiEngagement, searchEngagement] = await Promise.all([
    ad.properties.runReport({
      property: PROPERTY_ID,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensionFilter: aiFilter,
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
          { name: "engagedSessions" },
        ],
      },
    }),
    ad.properties.runReport({
      property: PROPERTY_ID,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensionFilter: searchFilter,
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "averageSessionDuration" },
          { name: "bounceRate" },
          { name: "engagedSessions" },
        ],
      },
    }),
  ]);

  const aiRow = aiEngagement.data.rows?.[0]?.metricValues;
  const searchRow = searchEngagement.data.rows?.[0]?.metricValues;

  if (aiRow && searchRow) {
    const aiSessions = Number(aiRow[0].value);
    const searchSessions = Number(searchRow[0].value);
    const aiPvPerSession = Number(aiRow[2].value) / aiSessions;
    const searchPvPerSession = Number(searchRow[2].value) / searchSessions;
    const aiDuration = Math.round(Number(aiRow[3].value));
    const searchDuration = Math.round(Number(searchRow[3].value));
    const aiBounce = (Number(aiRow[4].value) * 100).toFixed(1);
    const searchBounce = (Number(searchRow[4].value) * 100).toFixed(1);
    const aiEngRate = (Number(aiRow[5].value) / aiSessions * 100).toFixed(1);
    const searchEngRate = (Number(searchRow[5].value) / searchSessions * 100).toFixed(1);

    console.log("\n[1] エンゲージメント比較: AI流入 vs 検索エンジン");
    console.log(`${"指標".padEnd(20)} ${"AI流入".padStart(12)} ${"検索エンジン".padStart(12)} ${"差".padStart(10)}`);
    console.log("-".repeat(58));
    console.log(`${"セッション".padEnd(20)} ${String(aiSessions).padStart(12)} ${String(searchSessions).padStart(12)}`);
    console.log(`${"PV/Session".padEnd(20)} ${aiPvPerSession.toFixed(2).padStart(12)} ${searchPvPerSession.toFixed(2).padStart(12)} ${(aiPvPerSession - searchPvPerSession > 0 ? "+" : "") + (aiPvPerSession - searchPvPerSession).toFixed(2).padStart(9)}`);
    console.log(`${"平均滞在(秒)".padEnd(20)} ${String(aiDuration).padStart(12)} ${String(searchDuration).padStart(12)} ${(aiDuration - searchDuration > 0 ? "+" : "") + String(aiDuration - searchDuration).padStart(9)}`);
    console.log(`${"直帰率".padEnd(20)} ${(aiBounce + "%").padStart(12)} ${(searchBounce + "%").padStart(12)}`);
    console.log(`${"エンゲージ率".padEnd(20)} ${(aiEngRate + "%").padStart(12)} ${(searchEngRate + "%").padStart(12)}`);

    // 判定
    const quality = aiPvPerSession >= searchPvPerSession ? "良好" : "改善余地あり";
    console.log(`\n  → AI流入の回遊率は検索エンジンと比較して「${quality}」`);
  }

  // ── 2. AI流入のCTAクリック率 ──
  const [aiCtaReport, searchCtaReport, totalCtaReport] = await Promise.all([
    ad.properties.runReport({
      property: PROPERTY_ID,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              aiFilter,
              {
                orGroup: {
                  expressions: CTA_EVENTS.map((e) => ({
                    filter: { fieldName: "eventName", stringFilter: { value: e, matchType: "EXACT" as const } },
                  })),
                },
              },
            ],
          },
        },
      },
    }),
    ad.properties.runReport({
      property: PROPERTY_ID,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          andGroup: {
            expressions: [
              searchFilter,
              {
                orGroup: {
                  expressions: CTA_EVENTS.map((e) => ({
                    filter: { fieldName: "eventName", stringFilter: { value: e, matchType: "EXACT" as const } },
                  })),
                },
              },
            ],
          },
        },
      },
    }),
    ad.properties.runReport({
      property: PROPERTY_ID,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          orGroup: {
            expressions: CTA_EVENTS.map((e) => ({
              filter: { fieldName: "eventName", stringFilter: { value: e, matchType: "EXACT" as const } },
            })),
          },
        },
      },
    }),
  ]);

  const sumEvents = (rows: typeof aiCtaReport.data.rows) =>
    (rows || []).reduce((sum, r) => sum + Number(r.metricValues![0].value), 0);

  const aiCta = sumEvents(aiCtaReport.data.rows);
  const searchCta = sumEvents(searchCtaReport.data.rows);
  const totalCta = sumEvents(totalCtaReport.data.rows);

  const aiSessions = Number(aiRow?.[0]?.value || 0);
  const searchSessions = Number(searchRow?.[0]?.value || 0);

  console.log("\n[2] CTA転換率: AI流入 vs 検索エンジン");
  console.log(`${"指標".padEnd(25)} ${"AI流入".padStart(10)} ${"検索エンジン".padStart(12)} ${"全体".padStart(8)}`);
  console.log("-".repeat(60));
  console.log(`${"CTAクリック数".padEnd(25)} ${String(aiCta).padStart(10)} ${String(searchCta).padStart(12)} ${String(totalCta).padStart(8)}`);
  if (aiSessions > 0 && searchSessions > 0) {
    const aiCtaRate = (aiCta / aiSessions * 100).toFixed(2);
    const searchCtaRate = (searchCta / searchSessions * 100).toFixed(2);
    console.log(`${"CTA率 (CTA/Session)".padEnd(25)} ${(aiCtaRate + "%").padStart(10)} ${(searchCtaRate + "%").padStart(12)}`);

    if (Number(aiCtaRate) > Number(searchCtaRate)) {
      console.log(`\n  → AI流入のCTA率が検索より高い → AI=出口(購買検討)の仮説を支持`);
    } else if (aiCta === 0) {
      console.log(`\n  → AI流入からのCTAクリックがゼロ → 導線改善の余地あり`);
    } else {
      console.log(`\n  → AI流入のCTA率が検索より低い → AI流入のLP改善を検討`);
    }
  }

  // ── 3. AI流入のCTAクリック内訳 ──
  if (aiCta > 0) {
    console.log("\n[3] AI流入のCTAクリック内訳");
    console.log(`${"イベント".padEnd(30)} ${"回数".padStart(6)}`);
    console.log("-".repeat(40));
    for (const row of aiCtaReport.data.rows || []) {
      console.log(`${row.dimensionValues![0].value!.padEnd(30)} ${row.metricValues![0].value!.padStart(6)}`);
    }
  }

  // ── 4. AI流入ページ別 回遊・滞在分析 ──
  const aiPageDetail = await ad.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: "landingPage" }],
      metrics: [
        { name: "sessions" },
        { name: "screenPageViews" },
        { name: "averageSessionDuration" },
        { name: "bounceRate" },
      ],
      dimensionFilter: aiFilter,
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: "15",
    },
  });

  console.log("\n[4] AI流入 LP別エンゲージメント Top15");
  console.log(`${"ランディングページ".padEnd(45)} ${"Sess".padStart(5)} ${"PV/S".padStart(6)} ${"滞在".padStart(6)} ${"直帰".padStart(5)}`);
  console.log("-".repeat(72));
  for (const row of aiPageDetail.data.rows || []) {
    const page = row.dimensionValues![0].value!;
    const sess = Number(row.metricValues![0].value);
    const pvPerSess = (Number(row.metricValues![1].value) / sess).toFixed(1);
    const duration = Math.round(Number(row.metricValues![2].value));
    const bounce = (Number(row.metricValues![3].value) * 100).toFixed(0);
    console.log(
      `${page.slice(0, 44).padEnd(45)} ${String(sess).padStart(5)} ${pvPerSess.padStart(6)} ${(duration + "s").padStart(6)} ${(bounce + "%").padStart(5)}`
    );
  }

  // ── 5. 戦略サマリー ──
  console.log("\n" + "=".repeat(70));
  console.log("  戦略サマリー");
  console.log("-".repeat(70));
  console.log(`  AI流入シェア: ${aiSessions}/${aiSessions + searchSessions} (${(aiSessions / (aiSessions + searchSessions) * 100).toFixed(1)}%)`);
  console.log(`  AI流入CTA: ${aiCta}click (率${aiSessions > 0 ? (aiCta / aiSessions * 100).toFixed(1) : 0}%)`);

  if (aiSessions > 0) {
    const aiPv = Number(aiRow?.[2]?.value || 0);
    console.log(`  AI回遊率: PV/Session ${(aiPv / aiSessions).toFixed(2)}`);
  }

  console.log(`\n  [Google公式 2026/5/20の示唆]`);
  console.log(`  ・llms.txtはGoogle AI検索には不要（ChatGPT/Copilotには有効）`);
  console.log(`  ・「独自性のある非コモディティコンテンツ」がAI引用の鍵`);
  console.log(`  ・クエリファンアウトで比較検討が自動生成される → 比較コンテンツ重要`);
  console.log(`\n  [LANY竹内氏の示唆]`);
  console.log(`  ・SEO=入口(TOFU) / AI検索=出口(BOFU) → CTA転換率が本質的KPI`);
  console.log(`  ・LLMOはブランドマーケティング → "AIにどう語られるか"の資産蓄積`);
  console.log("");
}

main().catch(console.error);
