/**
 * 週次ダッシュボード
 *
 * 朝のコーヒー1杯で全体像を把握するための1コマンド。
 * GSC + GA4 + CTA + AI流入 + コンテンツ鮮度 を1画面に凝縮。
 *
 * Usage:
 *   npx tsx scripts/weekly.ts
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { FEATURES } from "../src/lib/features";
import { GUIDES } from "../src/lib/guides";
import { FEATURE_GUIDE_MAP, DEFAULT_GUIDE_SLUGS } from "../src/lib/brand-guides";
import { ONSEN_AREAS } from "../src/lib/onsen-areas";
import { CTA_EVENTS, AI_SOURCES } from "./lib/analytics-constants";
import { getGoogleClients, requireGA4PropertyId, SITE_URL } from "./lib/google-auth";

const GA4_PROPERTY = requireGA4PropertyId();
const GOLF_FILTER = { dimension: "page" as const, operator: "includingRegex" as const, expression: "^https://golf\\.peaky\\.co\\.jp/" };

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const today = new Date().toISOString().split("T")[0];
  console.log(`\n  weekly dashboard — ${today}`);
  console.log("=".repeat(60));

  // ── 並列取得 ──
  const { analyticsdata: ad, searchconsole: sc } = getGoogleClients();
  const fg = [{ filters: [GOLF_FILTER] }];
  const end = new Date(); end.setDate(end.getDate() - 3);
  const start7 = new Date(end); start7.setDate(start7.getDate() - 7);
  const gscStart = start7.toISOString().split("T")[0];
  const gscEnd = end.toISOString().split("T")[0];

  const [ga4Summary, ga4Cta, ga4Ai, ga4CtaPrev, gscSummary, gscTop, dbStats] = await Promise.all([
    // GA4 サマリー (7日 + 前週比較)
    ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [
          { startDate: "7daysAgo", endDate: "today" },
          { startDate: "14daysAgo", endDate: "8daysAgo" },
        ],
        metrics: [
          { name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" },
          { name: "averageSessionDuration" }, { name: "bounceRate" },
        ],
      },
    }),
    // CTA (7日)
    ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "eventName" }],
        metrics: [{ name: "eventCount" }],
        dimensionFilter: {
          orGroup: {
            expressions: CTA_EVENTS.map((e) => ({
              filter: { fieldName: "eventName", stringFilter: { value: e, matchType: "EXACT" as const } },
            })),
          },
        },
        orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
      },
    }),
    // AI流入 (7日)
    ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
        dimensions: [{ name: "sessionSource" }],
        metrics: [{ name: "sessions" }],
        dimensionFilter: {
          orGroup: {
            expressions: AI_SOURCES.map((s) => ({
              filter: { fieldName: "sessionSource", stringFilter: { value: s, matchType: "CONTAINS" as const } },
            })),
          },
        },
      },
    }),
    // CTA前週合計 (前週のみ、dimensionなし)
    ad.properties.runReport({
      property: GA4_PROPERTY,
      requestBody: {
        dateRanges: [{ startDate: "14daysAgo", endDate: "8daysAgo" }],
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
    // GSC サマリー (7日)
    sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: { startDate: gscStart, endDate: gscEnd, type: "web", dimensionFilterGroups: fg },
    }),
    // GSC Top5クエリ (7日)
    sc.searchanalytics.query({
      siteUrl: SITE_URL,
      requestBody: {
        startDate: gscStart, endDate: gscEnd, dimensions: ["query"],
        rowLimit: 5, type: "web", dimensionFilterGroups: fg,
      },
    }),
    // DB
    Promise.all([
      prisma.shaft.count(),
      prisma.shaftReview.count(),
      prisma.forumPost.count(),
      prisma.user.count(),
    ]),
  ]);

  // ── GA4 ──
  // 複数dateRangesの場合、date_range_0 / date_range_1 として2行に分かれる
  const gaRows = ga4Summary.data.rows || [];
  const gaCur = gaRows.find((r) => r.dimensionValues?.[0]?.value === "date_range_0")?.metricValues;
  const gaPrev = gaRows.find((r) => r.dimensionValues?.[0]?.value === "date_range_1")?.metricValues;
  const ga = gaCur;

  function delta(cur: string, prev: string): string {
    const c = Number(cur);
    const p = Number(prev);
    if (p === 0) return "";
    const pct = ((c - p) / p) * 100;
    return pct >= 0 ? ` (+${pct.toFixed(0)}%)` : ` (${pct.toFixed(0)}%)`;
  }

  if (ga) {
    const vs = gaPrev ? " vs 前週" : "";
    const d = (i: number) => gaPrev ? delta(ga[i].value!, gaPrev[i].value!) : "";
    console.log(`\n  GA4 (直近7日${vs})`);
    console.log(`  Users ${ga[0].value}${d(0)} / Sessions ${ga[1].value}${d(1)} / PV ${ga[2].value}${d(2)}`);
    console.log(`  滞在 ${Math.round(Number(ga[3].value))}s / 直帰 ${(Number(ga[4].value) * 100).toFixed(1)}%`);
  }

  // ── AI流入 ──
  const aiSessions = (ga4Ai.data.rows || []).reduce((s, r) => s + Number(r.metricValues![0].value), 0);
  const totalSessions = Number(ga?.[1]?.value || 0);
  console.log(`  AI流入 ${aiSessions} (${totalSessions > 0 ? (aiSessions / totalSessions * 100).toFixed(1) : 0}%)`);

  // ── CTA ──
  const ctaRows = ga4Cta.data.rows || [];
  const totalCta = ctaRows.reduce((s, r) => s + Number(r.metricValues![0].value), 0);
  const totalCtaPrev = Number(ga4CtaPrev.data.rows?.[0]?.metricValues?.[0]?.value || 0);
  const ctaBreakdown = ctaRows.map((r) => `${r.dimensionValues![0].value!.replace("_click", "")}:${r.metricValues![0].value}`).join(" / ");
  const ctaDelta = totalCtaPrev > 0 ? delta(String(totalCta), String(totalCtaPrev)) : "";
  console.log(`\n  CTA ${totalCta}click${ctaDelta} (${ctaBreakdown})`);

  // ── GSC ──
  const g = gscSummary.data.rows?.[0];
  if (g) {
    console.log(`\n  GSC (${gscStart}~${gscEnd})`);
    console.log(`  Click ${g.clicks} / Imp ${g.impressions} / CTR ${((g.ctr || 0) * 100).toFixed(1)}% / Pos ${(g.position || 0).toFixed(1)}`);
  }
  const topQ = (gscTop.data.rows || []).slice(0, 5);
  if (topQ.length > 0) {
    console.log(`  Top: ${topQ.map((r) => `${r.keys![0]}(${r.clicks})`).join(" / ")}`);
  }

  // ── DB ──
  console.log(`\n  DB: shaft ${dbStats[0]} / review ${dbStats[1]} / post ${dbStats[2]} / user ${dbStats[3]}`);
  console.log(`  Content: feature ${FEATURES.length} / guide ${GUIDES.length}`);

  // ── コンテンツ鮮度 ──
  const now = new Date();
  const staleGuides = GUIDES.filter((g) => {
    const updated = new Date(g.updatedAt);
    const daysSince = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    return daysSince > 60;
  }).sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());

  if (staleGuides.length > 0) {
    console.log(`\n  Stale (60日以上未更新): ${staleGuides.length}件`);
    for (const g of staleGuides.slice(0, 5)) {
      const days = Math.round((now.getTime() - new Date(g.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      console.log(`    ${g.slug} — ${days}日前 (${g.updatedAt})`);
    }
    if (staleGuides.length > 5) console.log(`    ... 他${staleGuides.length - 5}件`);
  } else {
    console.log(`\n  Stale: なし (全記事60日以内に更新済み)`);
  }

  // ── 内部リンク要約 ──
  const pages = new Map<string, { linkedFrom: number; linksTo: number }>();
  for (const f of FEATURES) pages.set(`/feature/${f.slug}`, { linkedFrom: 0, linksTo: 0 });
  for (const g of GUIDES) pages.set(`/guide/${g.slug}`, { linkedFrom: 0, linksTo: 0 });

  for (const g of GUIDES) {
    const from = `/guide/${g.slug}`;
    for (const s of g.sections) {
      for (const l of s.links || []) {
        if (pages.has(l.href)) {
          pages.get(from)!.linksTo++;
          pages.get(l.href)!.linkedFrom++;
        }
      }
    }
    for (const rf of g.relatedFeatures || []) {
      const to = `/feature/${rf}`;
      if (pages.has(to)) { pages.get(from)!.linksTo++; pages.get(to)!.linkedFrom++; }
    }
  }
  for (const f of FEATURES) {
    const from = `/feature/${f.slug}`;
    if (f.guide) {
      for (const s of f.guide.sections) {
        for (const l of s.links || []) {
          if (pages.has(l.href)) { pages.get(from)!.linksTo++; pages.get(l.href)!.linkedFrom++; }
        }
      }
    }
  }

  // FEATURE_GUIDE_MAP による自動リンク（ページ下部の関連ガイド）
  for (const f of FEATURES) {
    const from = `/feature/${f.slug}`;
    const guideSlugs = FEATURE_GUIDE_MAP[f.slug] || DEFAULT_GUIDE_SLUGS;
    const allSlugs = guideSlugs.includes("how-to-choose-shaft")
      ? guideSlugs
      : [...guideSlugs, "how-to-choose-shaft"];
    for (const gs of allSlugs.slice(0, 4)) {
      const to = `/guide/${gs}`;
      if (pages.has(to) && pages.has(from)) {
        pages.get(from)!.linksTo++;
        pages.get(to)!.linkedFrom++;
      }
    }
  }

  // /onsen ハブページからの温泉ガイドリンク
  for (const area of ONSEN_AREAS) {
    const to = `/guide/${area.guideSlug}`;
    if (pages.has(to)) pages.get(to)!.linkedFrom++;
  }

  const orphans = [...pages.entries()].filter(([, v]) => v.linkedFrom === 0).length;
  const noOut = [...pages.entries()].filter(([, v]) => v.linksTo === 0).length;
  console.log(`\n  Links: ${pages.size}p / orphan ${orphans} / no-outlink ${noOut}`);

  // ── afb 成果 ──
  const afb = await fetchAfbWeeklySummary();
  if (afb) {
    console.log(`\n  afb (直近7日): ${afb.count}件 / ¥${afb.total.toLocaleString()} (承認¥${afb.approved.toLocaleString()} / 待ち¥${afb.pending.toLocaleString()})`);
  } else {
    console.log(`\n  afb: データなし or AFB_API_KEY未設定`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("");

  await prisma.$disconnect();
}

/** afb 成果データAPIから直近7日の集計を取得 */
async function fetchAfbWeeklySummary(): Promise<{ count: number; total: number; approved: number; pending: number } | null> {
  const apiKey = process.env.AFB_API_KEY;
  if (!apiKey) return null;

  const end = new Date().toISOString().split("T")[0];
  const start = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

  try {
    const params = new URLSearchParams({ start_date: start, end_date: end, conversion_date_type: "2" });
    const res = await fetch(`https://api.afi-b.com/partners/475880/conversion?${params}`, {
      headers: { "Content-Type": "application/json", authorizationtoken: apiKey },
    });
    if (!res.ok) return null;
    const data = await res.json();
    const items: { margin: number; commit_flg: number }[] = data.response ?? [];
    if (items.length === 0) return { count: 0, total: 0, approved: 0, pending: 0 };
    return {
      count: items.length,
      total: items.reduce((s, r) => s + r.margin, 0),
      approved: items.filter(r => r.commit_flg === 1).reduce((s, r) => s + r.margin, 0),
      pending: items.filter(r => r.commit_flg === 0).reduce((s, r) => s + r.margin, 0),
    };
  } catch { return null; }
}

main().catch((e) => { console.error(e); prisma.$disconnect(); });
