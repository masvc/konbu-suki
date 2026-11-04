/**
 * 週次ダッシュボード
 *
 * 朝のコーヒー1杯で全体像を把握するための1コマンド。
 * GSC + GA4 + CTA + AI流入 + DB + コンテンツ鮮度 を1画面に凝縮する。
 *
 * Usage:
 *   npx tsx scripts/weekly.ts
 *
 * Google 側の権限が無い項目は、その行だけ理由を出して飛ばす。全体を落とすと
 * DB とコンテンツの情報まで見えなくなるため。
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { GUIDES } from "../src/lib/guides";
import { CTA_EVENTS, AI_SOURCES } from "./lib/analytics-constants";
import {
  getGoogleClients,
  requireGA4PropertyId,
  SEARCH_CONSOLE_SITE,
} from "./lib/google-auth";
import { PUBLIC_SITE_URL } from "./lib/site";
import { CONTENT_PAGES, GUIDE_PAGES } from "./lib/content";

const GA4_PROPERTY = requireGA4PropertyId();

// Search Console を自サイトに絞る。正規表現は GSC 固有の指定なので、
// 組み立てはここに置く（lib/site.ts は自サイトのURLだけを持つ）。
const SITE_FILTER = {
  dimension: "page" as const,
  operator: "includingRegex" as const,
  expression: `^${PUBLIC_SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/`,
};

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

/** 取得に失敗しても全体を止めない。理由を1行だけ出して null を返す。 */
async function safe<T>(label: string, run: () => Promise<T>): Promise<T | null> {
  try {
    return await run();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.log(`  ${label}: 取得できなかった — ${msg.split("\n")[0].slice(0, 140)}`);
    return null;
  }
}

function delta(cur: string, prev: string): string {
  const c = Number(cur);
  const p = Number(prev);
  if (p === 0) return "";
  const pct = ((c - p) / p) * 100;
  return pct >= 0 ? ` (+${pct.toFixed(0)}%)` : ` (${pct.toFixed(0)}%)`;
}

async function main() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`\n  weekly dashboard — ${today}`);
  console.log("=".repeat(60));

  const { analyticsdata: ad, searchconsole: sc } = getGoogleClients();
  const fg = [{ filters: [SITE_FILTER] }];

  // Search Console は3日前までのデータしか無い
  const end = new Date();
  end.setDate(end.getDate() - 3);
  const start7 = new Date(end);
  start7.setDate(start7.getDate() - 7);
  const gscStart = start7.toISOString().split("T")[0];
  const gscEnd = end.toISOString().split("T")[0];

  const ctaFilter = {
    orGroup: {
      expressions: CTA_EVENTS.map((e) => ({
        filter: {
          fieldName: "eventName",
          stringFilter: { value: e, matchType: "EXACT" as const },
        },
      })),
    },
  };

  const [ga4Summary, ga4Cta, ga4Ai, ga4CtaPrev, gscSummary, gscTop, dbStats] =
    await Promise.all([
      // GA4 サマリー（直近7日 + 前週）
      safe("GA4 サマリー", () =>
        ad.properties.runReport({
          property: GA4_PROPERTY,
          requestBody: {
            dateRanges: [
              { startDate: "7daysAgo", endDate: "today" },
              { startDate: "14daysAgo", endDate: "8daysAgo" },
            ],
            metrics: [
              { name: "activeUsers" },
              { name: "sessions" },
              { name: "screenPageViews" },
              { name: "averageSessionDuration" },
              { name: "bounceRate" },
            ],
          },
        })
      ),
      // CTA（直近7日）
      safe("GA4 CTA", () =>
        ad.properties.runReport({
          property: GA4_PROPERTY,
          requestBody: {
            dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
            dimensions: [{ name: "eventName" }],
            metrics: [{ name: "eventCount" }],
            dimensionFilter: ctaFilter,
            orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
          },
        })
      ),
      // AI流入（直近7日）
      safe("GA4 AI流入", () =>
        ad.properties.runReport({
          property: GA4_PROPERTY,
          requestBody: {
            dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
            dimensions: [{ name: "sessionSource" }],
            metrics: [{ name: "sessions" }],
            dimensionFilter: {
              orGroup: {
                expressions: AI_SOURCES.map((s) => ({
                  filter: {
                    fieldName: "sessionSource",
                    stringFilter: { value: s, matchType: "CONTAINS" as const },
                  },
                })),
              },
            },
          },
        })
      ),
      // CTA 前週合計
      safe("GA4 CTA(前週)", () =>
        ad.properties.runReport({
          property: GA4_PROPERTY,
          requestBody: {
            dateRanges: [{ startDate: "14daysAgo", endDate: "8daysAgo" }],
            metrics: [{ name: "eventCount" }],
            dimensionFilter: ctaFilter,
          },
        })
      ),
      // GSC サマリー
      safe("GSC サマリー", () =>
        sc.searchanalytics.query({
          siteUrl: SEARCH_CONSOLE_SITE,
          requestBody: {
            startDate: gscStart,
            endDate: gscEnd,
            type: "web",
            dimensionFilterGroups: fg,
          },
        })
      ),
      // GSC Top5 クエリ
      safe("GSC Topクエリ", () =>
        sc.searchanalytics.query({
          siteUrl: SEARCH_CONSOLE_SITE,
          requestBody: {
            startDate: gscStart,
            endDate: gscEnd,
            dimensions: ["query"],
            rowLimit: 5,
            type: "web",
            dimensionFilterGroups: fg,
          },
        })
      ),
      // DB
      safe("DB", () =>
        Promise.all([
          prisma.product.count(),
          prisma.review.count(),
          prisma.article.count(),
          prisma.subscriber.count(),
        ])
      ),
    ]);

  // ── GA4 ──
  const gaRows = ga4Summary?.data.rows || [];
  const ga = gaRows.find((r) => r.dimensionValues?.[0]?.value === "date_range_0")?.metricValues;
  const gaPrev = gaRows.find((r) => r.dimensionValues?.[0]?.value === "date_range_1")?.metricValues;

  if (ga) {
    const vs = gaPrev ? " vs 前週" : "";
    const d = (i: number) => (gaPrev ? delta(ga[i].value!, gaPrev[i].value!) : "");
    console.log(`\n  GA4 (直近7日${vs})`);
    console.log(`  Users ${ga[0].value}${d(0)} / Sessions ${ga[1].value}${d(1)} / PV ${ga[2].value}${d(2)}`);
    console.log(`  滞在 ${Math.round(Number(ga[3].value))}s / 直帰 ${(Number(ga[4].value) * 100).toFixed(1)}%`);
  }

  // ── AI流入 ──
  if (ga4Ai) {
    const aiSessions = (ga4Ai.data.rows || []).reduce(
      (s, r) => s + Number(r.metricValues![0].value),
      0
    );
    const totalSessions = Number(ga?.[1]?.value || 0);
    const share = totalSessions > 0 ? ((aiSessions / totalSessions) * 100).toFixed(1) : "0";
    console.log(`  AI流入 ${aiSessions} (${share}%)`);
  }

  // ── CTA ──
  if (ga4Cta) {
    const ctaRows = ga4Cta.data.rows || [];
    const totalCta = ctaRows.reduce((s, r) => s + Number(r.metricValues![0].value), 0);
    const totalCtaPrev = Number(ga4CtaPrev?.data.rows?.[0]?.metricValues?.[0]?.value || 0);
    const breakdown = ctaRows
      .map((r) => `${r.dimensionValues![0].value!.replace("_click", "")}:${r.metricValues![0].value}`)
      .join(" / ");
    const ctaDelta = totalCtaPrev > 0 ? delta(String(totalCta), String(totalCtaPrev)) : "";
    console.log(`\n  CTA ${totalCta}click${ctaDelta}${breakdown ? ` (${breakdown})` : ""}`);
  }

  // ── GSC ──
  const g = gscSummary?.data.rows?.[0];
  if (g) {
    console.log(`\n  GSC (${gscStart}~${gscEnd})`);
    console.log(
      `  Click ${g.clicks} / Imp ${g.impressions} / CTR ${((g.ctr || 0) * 100).toFixed(1)}% / Pos ${(g.position || 0).toFixed(1)}`
    );
  }
  const topQ = (gscTop?.data.rows || []).slice(0, 5);
  if (topQ.length > 0) {
    console.log(`  Top: ${topQ.map((r) => `${r.keys![0]}(${r.clicks})`).join(" / ")}`);
  }

  // ── DB ──
  if (dbStats) {
    const [products, reviews, articles, subscribers] = dbStats;
    console.log(
      `\n  DB: product ${products} / review ${reviews} / article ${articles} / subscriber ${subscribers}`
    );
  }
  const byKind = (kind: string) => CONTENT_PAGES.filter((p) => p.kind === kind).length;
  console.log(
    `  Content: guide ${byKind("guide")} / origin ${byKind("origin")} / category ${byKind("category")}`
  );

  // ── コンテンツ鮮度 ──
  // 内部リンクの集計は入れていない。このプロジェクトのガイド定義は
  // 本文内リンクを data として持たないため、数える対象が無い。
  const now = new Date();
  const stale = Object.entries(GUIDES)
    .map(([slug, guide]) => ({ slug, dateModified: guide.dateModified }))
    .filter((x) => {
      const days = (now.getTime() - new Date(x.dateModified).getTime()) / 86400000;
      return days > 60;
    })
    .sort((a, b) => new Date(a.dateModified).getTime() - new Date(b.dateModified).getTime());

  if (stale.length > 0) {
    console.log(`\n  Stale (60日以上未更新): ${stale.length}/${GUIDE_PAGES.length}件`);
    for (const x of stale.slice(0, 5)) {
      const days = Math.round((now.getTime() - new Date(x.dateModified).getTime()) / 86400000);
      console.log(`    ${x.slug} — ${days}日前 (${x.dateModified})`);
    }
    if (stale.length > 5) console.log(`    ... 他${stale.length - 5}件`);
  } else {
    console.log(`\n  Stale: なし (全ガイド60日以内に更新済み)`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("");

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
});
