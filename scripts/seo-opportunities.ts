/**
 * SEO機会損失・改善ポイント自動検出スクリプト
 *
 * seo.mdに手書きしていた「CTR低いページ」「順位下がったクエリ」等を
 * 自動で検出してレポートする。週1実行推奨。
 *
 * Usage:
 *   npx tsx scripts/seo-opportunities.ts              # 過去28日
 *   npx tsx scripts/seo-opportunities.ts 7             # 過去7日
 *   npx tsx scripts/seo-opportunities.ts compare       # 前回スナップショットと比較
 */
import "dotenv/config";
import { readFileSync, existsSync } from "fs";
import { getSearchConsoleClient, SEARCH_CONSOLE_SITE } from "./lib/google-auth";
import { toSitePath, siteFilterGroups } from "./lib/site";
import { CONTENT_PAGES } from "./lib/content";
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

async function main() {
  const args = process.argv.slice(2);
  const days = parseInt(args.find((a) => /^\d+$/.test(a)) || "28");
  const isCompare = args.includes("compare");
  const { startDate, endDate } = getDateRange(days);

  const sc = getSearchConsoleClient();
  const fg = siteFilterGroups();

  console.log(`\nSEO機会損失レポート (${startDate} ~ ${endDate})`);
  console.log("=".repeat(70));

  // ── 1. CTR課題ページ: imp多いのにCTR低い ──
  const pageRes = await sc.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 100,
      type: "web",
      dimensionFilterGroups: fg,
    },
  });
  const pages = (pageRes.data.rows || []).map((r) => ({
    url: toSitePath(r.keys?.[0] || ""),
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));

  // imp 50以上 & CTR 5%未満 = meta改善チャンス
  const lowCtrPages = pages
    .filter((p) => p.impressions >= 50 && p.ctr < 0.05)
    .sort((a, b) => b.impressions - a.impressions);

  console.log("\n[1] CTR課題ページ (imp50+ & CTR<5%)");
  console.log("    → meta title/description改善でクリック増が期待できるページ");
  console.log(`${"URL".padEnd(50)} ${"Imp".padStart(6)} ${"Click".padStart(6)} ${"CTR".padStart(6)} ${"順位".padStart(5)}`);
  console.log("-".repeat(78));
  for (const p of lowCtrPages.slice(0, 15)) {
    const potentialClicks = Math.round(p.impressions * 0.05) - p.clicks;
    console.log(
      `${p.url.slice(0, 49).padEnd(50)} ${String(p.impressions).padStart(6)} ${String(p.clicks).padStart(6)} ${(p.ctr * 100).toFixed(1).padStart(5)}% ${p.position.toFixed(1).padStart(5)}  (+${potentialClicks}click見込)`
    );
  }

  // ── 2. 順位改善チャンス: 順位10-20位(2ページ目) ──
  const page2 = pages
    .filter((p) => p.position >= 8 && p.position <= 20 && p.impressions >= 30)
    .sort((a, b) => b.impressions - a.impressions);

  console.log("\n[2] 順位改善チャンス (8-20位 & imp30+)");
  console.log("    → 少しの改善で1ページ目に上がれるページ");
  console.log(`${"URL".padEnd(50)} ${"Imp".padStart(6)} ${"Click".padStart(6)} ${"順位".padStart(5)}`);
  console.log("-".repeat(72));
  for (const p of page2.slice(0, 10)) {
    console.log(
      `${p.url.slice(0, 49).padEnd(50)} ${String(p.impressions).padStart(6)} ${String(p.clicks).padStart(6)} ${p.position.toFixed(1).padStart(5)}`
    );
  }

  // ── 3. クエリ機会損失: imp多いのにクリック少ない ──
  const queryRes = await sc.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["query"],
      rowLimit: 200,
      type: "web",
      dimensionFilterGroups: fg,
    },
  });
  const queries = (queryRes.data.rows || []).map((r) => ({
    query: r.keys?.[0] || "",
    clicks: r.clicks || 0,
    impressions: r.impressions || 0,
    ctr: r.ctr || 0,
    position: r.position || 0,
  }));

  const missedQueries = queries
    .filter((q) => q.impressions >= 20 && q.ctr < 0.05 && q.position <= 20)
    .sort((a, b) => b.impressions - a.impressions);

  console.log("\n[3] クエリ機会損失 (imp20+ & CTR<5% & 順位20以内)");
  console.log("    → 表示されてるのにクリックされていないキーワード");
  console.log(`${"クエリ".padEnd(45)} ${"Imp".padStart(6)} ${"Click".padStart(6)} ${"CTR".padStart(6)} ${"順位".padStart(5)}`);
  console.log("-".repeat(73));
  for (const q of missedQueries.slice(0, 15)) {
    console.log(
      `${q.query.slice(0, 44).padEnd(45)} ${String(q.impressions).padStart(6)} ${String(q.clicks).padStart(6)} ${(q.ctr * 100).toFixed(1).padStart(5)}% ${q.position.toFixed(1).padStart(5)}`
    );
  }

  // ── 4. カバレッジチェック: 主要ページがGSCに出てるか ──
  // rowLimit=100だとニッチなページは漏れるので、全ページ取得して正確に判定
  const allPageRes = await sc.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: {
      startDate,
      endDate,
      dimensions: ["page"],
      rowLimit: 2000,
      type: "web",
      dimensionFilterGroups: fg,
    },
  });
  const gscPaths = new Set(
    (allPageRes.data.rows || []).map((r) =>
      toSitePath(r.keys?.[0] || "")
    )
  );
  const expectedPages = CONTENT_PAGES.map((p) => p.path);
  const notIndexed = expectedPages.filter((p) => !gscPaths.has(p));

  if (notIndexed.length > 0) {
    console.log(`\n[4] GSC未検出ページ (${notIndexed.length}/${expectedPages.length}件)`);
    console.log("    → インデックスされていないか、表示0の可能性");
    for (const p of notIndexed.slice(0, 20)) {
      console.log(`  ${p}`);
    }
    if (notIndexed.length > 20) console.log(`  ... 他${notIndexed.length - 20}件`);
  } else {
    console.log("\n[4] GSC未検出ページ: なし (全ページ表示あり)");
  }

  // ── 5. 前回比較 ──
  if (isCompare) {
    const snapshotPath = "./data/seo-snapshots/latest.json";
    if (existsSync(snapshotPath)) {
      const prev = JSON.parse(readFileSync(snapshotPath, "utf-8"));
      type PrevPage = {
        key: string;
        clicks: number;
        impressions: number;
        ctr: number;
        position: number;
      };
      const prevPages = new Map<string, PrevPage>(
        ((prev.pages || []) as PrevPage[]).map((p) => [toSitePath(p.key), p])
      );

      console.log(`\n[5] 前回比較 (${prev.date})`);

      // 順位改善ページ
      const improved = pages
        .filter((p) => {
          const old = prevPages.get(p.url);
          return old && p.position < old.position - 1;
        })
        .map((p) => ({
          ...p,
          prevPos: prevPages.get(p.url)!.position,
        }))
        .sort((a, b) => (a.prevPos - a.position) - (b.prevPos - b.position))
        .reverse();

      if (improved.length > 0) {
        console.log("\n  順位改善ページ:");
        for (const p of improved.slice(0, 10)) {
          console.log(`    ${p.url.padEnd(45)} ${p.prevPos.toFixed(1)} → ${p.position.toFixed(1)} (${(p.prevPos - p.position).toFixed(1)}位UP)`);
        }
      }

      // 順位悪化ページ
      const declined = pages
        .filter((p) => {
          const old = prevPages.get(p.url);
          return old && p.position > old.position + 1;
        })
        .map((p) => ({
          ...p,
          prevPos: prevPages.get(p.url)!.position,
        }))
        .sort((a, b) => (a.position - a.prevPos) - (b.position - b.prevPos))
        .reverse();

      if (declined.length > 0) {
        console.log("\n  順位悪化ページ:");
        for (const p of declined.slice(0, 10)) {
          console.log(`    ${p.url.padEnd(45)} ${p.prevPos.toFixed(1)} → ${p.position.toFixed(1)} (${(p.position - p.prevPos).toFixed(1)}位DOWN)`);
        }
      }
    } else {
      console.log("\n[5] 前回スナップショットなし。先に seo-snapshot.ts を実行してください。");
    }
  }

  // ── 6. コンテンツギャップ: imp多いクエリに専用ページがあるか ──
  // クエリの各単語（2文字以上）がコンテンツのtitle/searchKeywordに含まれるかチェック
  const contentTexts = CONTENT_PAGES.flatMap((p) => p.keywords).map((k) =>
    k.toLowerCase().replace(/[\s\-_　｜|【】]/g, "")
  );
  const joinedContent = contentTexts.join("|");

  const gapQueries = queries
    .filter((q) => q.impressions >= 30 && q.position >= 5)
    .filter((q) => {
      // クエリを空白で分割し、各単語（2文字以上）がコンテンツ内にあるか
      const words = q.query.toLowerCase().split(/[\s　]+/).filter((w) => w.length >= 2);
      if (words.length === 0) return false;
      // 主要な単語の過半数がコンテンツに含まれていれば既存でカバー済み
      const matchCount = words.filter((w) => joinedContent.includes(w)).length;
      return matchCount / words.length < 0.5;
    })
    .sort((a, b) => b.impressions - a.impressions);

  if (gapQueries.length > 0) {
    console.log(`\n[6] コンテンツギャップ (imp30+ & 順位5位以下 & 専用ページなし)`);
    console.log("    → 新規ガイド作成でカバーすべきキーワード");
    console.log(`${"クエリ".padEnd(45)} ${"Imp".padStart(6)} ${"Click".padStart(6)} ${"順位".padStart(5)}`);
    console.log("-".repeat(67));
    for (const q of gapQueries.slice(0, 15)) {
      console.log(
        `${q.query.slice(0, 44).padEnd(45)} ${String(q.impressions).padStart(6)} ${String(q.clicks).padStart(6)} ${q.position.toFixed(1).padStart(5)}`
      );
    }
  }

  // ── サマリー ──
  const totalPotential = lowCtrPages.reduce(
    (sum, p) => sum + Math.max(0, Math.round(p.impressions * 0.05) - p.clicks),
    0
  );
  console.log("\n" + "=".repeat(70));
  console.log("  サマリー");
  console.log(`  CTR課題ページ: ${lowCtrPages.length}件 (CTR5%改善で推定+${totalPotential}click/月)`);
  console.log(`  順位改善チャンス: ${page2.length}件 (8-20位)`);
  console.log(`  クエリ機会損失: ${missedQueries.length}件`);
  console.log(`  GSC未検出: ${notIndexed.length}/${expectedPages.length}件`);
  console.log(`  コンテンツギャップ: ${gapQueries.length}件`);
  console.log("");
}

main().catch(console.error);
