/**
 * サイト品質チェックスクリプト
 *
 * SiteRover的に golf.peaky.co.jp の品質を自動チェック。
 * データ整合性・SEO・リンク切れ・画像404・コンテンツ品質を一括検査。
 *
 * Usage:
 *   npx tsx scripts/site-check.ts              # 全チェック（ライブチェック含む）
 *   npx tsx scripts/site-check.ts --offline     # ローカルデータのみ（高速）
 *   npx tsx scripts/site-check.ts --links       # リンク切れチェックのみ
 *   npx tsx scripts/site-check.ts --data        # データ品質チェックのみ
 *   npx tsx scripts/site-check.ts --seo         # SEOチェックのみ
 *   npx tsx scripts/site-check.ts --images      # 画像チェックのみ
 */

import "dotenv/config";
import { existsSync, readdirSync } from "fs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { FEATURES } from "../src/lib/features";
import { GUIDES } from "../src/lib/guides";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const BASE_URL = "https://golf.peaky.co.jp";
const args = process.argv.slice(2);
const offline = args.includes("--offline");
const filterMode = args.find((a) =>
  ["--links", "--data", "--seo", "--images"].includes(a)
);
const shouldRun = (mode: string) => !filterMode || filterMode === mode;

// ─── 結果集計 ───
type Issue = { level: "error" | "warn" | "info"; category: string; message: string };
const issues: Issue[] = [];
const add = (level: Issue["level"], category: string, message: string) =>
  issues.push({ level, category, message });

// ─── ユーティリティ ───
async function checkUrl(url: string, timeout = 8000): Promise<number | "timeout" | "error"> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "SiteCheck/1.0 (golf.peaky.co.jp quality checker)" },
    });
    clearTimeout(timer);
    return res.status;
  } catch {
    clearTimeout(timer);
    return "timeout";
  }
}

async function batchCheckUrls(
  urls: string[],
  concurrency = 5,
  label = "URL"
): Promise<Map<string, number | "timeout" | "error">> {
  const results = new Map<string, number | "timeout" | "error">();
  const queue = [...urls];
  let done = 0;

  async function worker() {
    while (queue.length > 0) {
      const url = queue.shift()!;
      results.set(url, await checkUrl(url));
      done++;
      if (done % 20 === 0) process.stdout.write(`  ${label}: ${done}/${urls.length}\r`);
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  console.log(`  ${label}: ${urls.length}件チェック完了`);
  return results;
}

// ══════════════════════════════════════════
// 1. データ品質チェック
// ══════════════════════════════════════════
async function checkData() {
  console.log("\n[1/4] データ品質チェック...");

  // シャフト基本データ
  const totalShafts = await prisma.shaft.count();
  const noAsin = await prisma.shaft.count({ where: { asin: null } });
  const noImage = await prisma.shaft.count({ where: { imageUrl: null } });
  const noWeight = await prisma.shaft.count({ where: { weight: 0 } });
  const noKickPoint = await prisma.shaft.count({ where: { kickPoint: "" } });
  const noFlex = await prisma.shaft.count({ where: { flex: "" } });
  const noCategory = await prisma.shaft.count({ where: { category: "" } });

  // OEMシャフト（クラブ付属品）は画像・ASINなしが正常なので分けて表示
  const oemMakers = [
    "TaylorMade", "Titleist", "Callaway", "Ping", "Cobra", "Mizuno",
    "HONMA", "Yamaha", "PRGR", "Bridgestone", "Dunlop", "Yonex",
    "Cleveland", "Nike", "Fourteen", "Onoff", "Kasco", "Epon", "NEXGEN",
  ];
  const noImageOem = await prisma.shaft.count({
    where: { imageUrl: null, maker: { in: oemMakers } },
  });
  const noImageAftermarket = noImage - noImageOem;

  add("info", "data", `シャフト総数: ${totalShafts}`);

  if (noAsin > 0) add("warn", "data", `ASIN未設定: ${noAsin}本 (${(noAsin / totalShafts * 100).toFixed(1)}%)`);
  if (noImage > 0) add("info", "data", `画像なし: ${noImage}本 (OEM ${noImageOem} + アフターマーケット ${noImageAftermarket})`);
  if (noWeight > 0) add("error", "data", `重量0g: ${noWeight}本 — スペック異常`);
  if (noKickPoint > 0) add("warn", "data", `調子(kickPoint)未設定: ${noKickPoint}本`);
  if (noFlex > 0) add("error", "data", `flex未設定: ${noFlex}本`);
  if (noCategory > 0) add("error", "data", `category未設定: ${noCategory}本`);

  // 重複チェック
  const dupes = await prisma.$queryRaw<{ name: string; flex: string; cnt: bigint }[]>`
    SELECT name, flex, COUNT(*) as cnt FROM shafts
    GROUP BY name, flex HAVING COUNT(*) > 1
    ORDER BY cnt DESC LIMIT 10
  `;
  if (dupes.length > 0) {
    add("warn", "data", `重複シャフト(同名+同flex): ${dupes.length}件`);
    for (const d of dupes.slice(0, 5)) {
      add("warn", "data", `  "${d.name}" flex=${d.flex} x${d.cnt}`);
    }
  }

  // メーカー分布
  const makers = await prisma.$queryRaw<{ maker: string; cnt: bigint }[]>`
    SELECT maker, COUNT(*) as cnt FROM shafts
    GROUP BY maker ORDER BY cnt DESC LIMIT 5
  `;
  add("info", "data", `メーカーTop5: ${makers.map((m) => `${m.maker}(${m.cnt})`).join(", ")}`);

  // レビュー・コミュニティ
  const reviews = await prisma.shaftReview.count();
  const posts = await prisma.forumPost.count();
  const users = await prisma.user.count();
  add("info", "data", `レビュー: ${reviews} / フォーラム投稿: ${posts} / ユーザー: ${users}`);
}

// ══════════════════════════════════════════
// 2. コンテンツ整合性 & SEO チェック
// ══════════════════════════════════════════
async function checkSeo() {
  console.log("\n[2/4] コンテンツ整合性 & SEO チェック...");

  // ── Feature slug の存在確認 ──
  const featureSlugs = new Set(FEATURES.map((f) => f.slug));
  const guideSlugs = new Set(GUIDES.map((g) => g.slug));

  // ガイド → 特集 の参照チェック
  for (const guide of GUIDES) {
    if (guide.relatedFeatures) {
      for (const slug of guide.relatedFeatures) {
        if (!featureSlugs.has(slug)) {
          add("error", "seo", `ガイド「${guide.slug}」が存在しない特集「${slug}」を参照`);
        }
      }
    }
    // sections内のリンク先チェック
    for (const section of guide.sections) {
      if (section.links) {
        for (const link of section.links) {
          const href = link.href;
          if (href.startsWith("/feature/")) {
            const slug = href.replace("/feature/", "");
            if (!featureSlugs.has(slug)) {
              add("error", "seo", `ガイド「${guide.slug}」内リンク → /feature/${slug} が存在しない`);
            }
          }
          if (href.startsWith("/guide/")) {
            const slug = href.replace("/guide/", "");
            if (!guideSlugs.has(slug)) {
              add("error", "seo", `ガイド「${guide.slug}」内リンク → /guide/${slug} が存在しない`);
            }
          }
        }
      }
    }
  }

  // ── title / description 長さチェック ──
  const titleIssues: string[] = [];
  const descIssues: string[] = [];

  for (const f of FEATURES) {
    if (f.title.length > 60) titleIssues.push(`feature/${f.slug} (${f.title.length}字)`);
    if (f.description.length > 160) descIssues.push(`feature/${f.slug} (${f.description.length}字)`);
    if (f.description.length < 50) add("warn", "seo", `feature/${f.slug}: descriptionが短い (${f.description.length}字)`);
  }
  for (const g of GUIDES) {
    if (g.title.length > 60) titleIssues.push(`guide/${g.slug} (${g.title.length}字)`);
    if (g.description.length > 160) descIssues.push(`guide/${g.slug} (${g.description.length}字)`);
    if (g.description.length < 50) add("warn", "seo", `guide/${g.slug}: descriptionが短い (${g.description.length}字)`);
  }

  if (titleIssues.length > 0) {
    add("warn", "seo", `title 60字超: ${titleIssues.length}件`);
    for (const t of titleIssues.slice(0, 5)) add("warn", "seo", `  ${t}`);
  }
  if (descIssues.length > 0) {
    add("warn", "seo", `description 160字超: ${descIssues.length}件`);
    for (const d of descIssues.slice(0, 5)) add("warn", "seo", `  ${d}`);
  }

  // ── ガイド画像チェック ──
  for (const g of GUIDES) {
    const imgPath = `public/guide/${g.slug}.webp`;
    if (!existsSync(imgPath)) {
      add("error", "seo", `ガイド画像なし: ${imgPath}`);
    }
  }

  // ── 特集ガイドセクション薄さチェック ──
  for (const f of FEATURES) {
    if (f.guide) {
      const totalWords = f.guide.sections.reduce((sum, s) => sum + s.body.length, 0);
      if (totalWords < 300) {
        add("warn", "seo", `feature/${f.slug}: ガイドセクションが薄い (${totalWords}字)`);
      }
    }
    if (!f.guide && f.type !== "curated") {
      add("info", "seo", `feature/${f.slug}: guideセクションなし`);
    }
  }

  // ── FAQ チェック ──
  const featuresWithFaq = FEATURES.filter((f) => f.faq && f.faq.length > 0).length;
  const guidesWithFaq = GUIDES.filter((g) => g.faq && g.faq.length > 0).length;
  add("info", "seo", `FAQ付き: 特集 ${featuresWithFaq}/${FEATURES.length}, ガイド ${guidesWithFaq}/${GUIDES.length}`);

  // ── E-E-A-T チェック ──
  const eeatFiles = [
    { path: "src/app/about/editorial-policy/page.tsx", label: "編集方針ページ" },
    { path: "src/app/about/page.tsx", label: "運営者情報ページ" },
    { path: "src/app/about/data/page.tsx", label: "データ出典ページ" },
  ];
  for (const f of eeatFiles) {
    if (existsSync(f.path)) {
      add("info", "seo", `E-E-A-T: ${f.label} — あり`);
    } else {
      add("warn", "seo", `E-E-A-T: ${f.label} — なし（信頼性向上に効果的）`);
    }
  }

  // ── slug重複チェック ──
  const allSlugs = [...FEATURES.map((f) => `feature/${f.slug}`), ...GUIDES.map((g) => `guide/${g.slug}`)];
  const slugSet = new Set<string>();
  for (const s of allSlugs) {
    if (slugSet.has(s)) add("error", "seo", `slug重複: ${s}`);
    slugSet.add(s);
  }

  add("info", "seo", `特集: ${FEATURES.length}件 / ガイド: ${GUIDES.length}件`);
}

// ══════════════════════════════════════════
// 3. リンク切れチェック（ライブ）
// ══════════════════════════════════════════
async function checkLinks() {
  if (offline) {
    console.log("\n[3/4] リンク切れチェック... SKIP (--offline)");
    return;
  }
  console.log("\n[3/4] リンク切れチェック（ライブ）...");

  // HTMLサイズチェック（Googlebot 2MB上限）
  const sizeCheckPages = ["/feature/tour-ad", "/feature/diamana", "/feature/speeder", "/compare", "/"];
  for (const path of sizeCheckPages) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "User-Agent": "SiteCheck/1.0", "Accept-Encoding": "identity" },
      });
      const html = await res.text();
      const sizeKB = Math.round(html.length / 1024);
      if (sizeKB > 1500) {
        add("error", "links", `HTML ${sizeKB}KB — Googlebot 2MB上限に接近: ${path}`);
      } else if (sizeKB > 800) {
        add("warn", "links", `HTML ${sizeKB}KB — 大きめ（2MB上限の${Math.round(sizeKB / 2048 * 100)}%）: ${path}`);
      }
    } catch { /* skip */ }
  }

  // 主要ページの存在確認
  const pages = [
    "/",
    "/compare",
    "/diagnose",
    "/ranking",
    "/guide",
    "/feature",
    "/community",
    "/about",
    "/about/editorial-policy",
    "/about/data",
    "/about/partners",
    "/tools/distance-calculator",
    ...FEATURES.map((f) => `/feature/${f.slug}`),
    ...GUIDES.map((g) => `/guide/${g.slug}`),
  ];

  const urls = pages.map((p) => `${BASE_URL}${p}`);
  const results = await batchCheckUrls(urls, 8, "ページ");

  let ok = 0;
  let fail = 0;
  for (const [url, status] of results) {
    if (status === 200) {
      ok++;
    } else {
      fail++;
      const path = url.replace(BASE_URL, "");
      add("error", "links", `${path} → ${status}`);
    }
  }
  add("info", "links", `ページチェック: ${ok} OK / ${fail} NG (計${urls.length})`);
}

// ══════════════════════════════════════════
// 4. 画像チェック
// ══════════════════════════════════════════
async function checkImages() {
  console.log("\n[4/4] 画像チェック...");

  // ローカルガイド画像
  const guideImgDir = "public/guide";
  if (existsSync(guideImgDir)) {
    const files = readdirSync(guideImgDir).filter((f: string) => f.endsWith(".webp"));
    const guideSlugs = new Set(GUIDES.map((g) => g.slug));
    const orphanImages = files.filter((f: string) => !guideSlugs.has(f.replace(".webp", "")));
    if (orphanImages.length > 0) {
      add("info", "images", `孤立ガイド画像（記事なし）: ${orphanImages.length}件`);
    }
    add("info", "images", `ガイド画像: ${files.length}件 / ガイド記事: ${GUIDES.length}件`);
  }

  if (offline) {
    console.log("  画像URLチェック... SKIP (--offline)");
    return;
  }

  // Amazon画像URLサンプリングチェック（全件は時間かかるのでランダム50件）
  const shaftsWithImage = await prisma.shaft.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, name: true, imageUrl: true },
  });

  const sampleSize = Math.min(50, shaftsWithImage.length);
  const sample = shaftsWithImage
    .sort(() => Math.random() - 0.5)
    .slice(0, sampleSize);

  add("info", "images", `Amazon画像サンプリング: ${sampleSize}/${shaftsWithImage.length}件をチェック`);

  const imageResults = await batchCheckUrls(
    sample.map((s) => s.imageUrl!),
    5,
    "画像"
  );

  let img404 = 0;
  for (const s of sample) {
    const status = imageResults.get(s.imageUrl!);
    if (status !== 200) {
      img404++;
      if (img404 <= 10) {
        add("error", "images", `画像404: shaft#${s.id} "${s.name}" → ${status}`);
      }
    }
  }

  if (img404 > 0) {
    const estimated = Math.round((img404 / sampleSize) * shaftsWithImage.length);
    add("warn", "images", `画像404率: ${img404}/${sampleSize} (${(img404 / sampleSize * 100).toFixed(1)}%) — 推定全体${estimated}件`);
  } else {
    add("info", "images", `画像404: 0件 (サンプル${sampleSize}件すべてOK)`);
  }
}

// ══════════════════════════════════════════
// レポート出力
// ══════════════════════════════════════════
function printReport() {
  console.log("\n" + "=".repeat(70));
  console.log("  サイト品質チェック レポート");
  console.log("  " + new Date().toISOString().split("T")[0]);
  console.log("=".repeat(70));

  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warn");
  const infos = issues.filter((i) => i.level === "info");

  // カテゴリ別集計
  const categories = [...new Set(issues.map((i) => i.category))];
  for (const cat of categories) {
    const catIssues = issues.filter((i) => i.category === cat);
    const catLabel = { data: "データ品質", seo: "SEO/コンテンツ", links: "リンク", images: "画像" }[cat] || cat;
    console.log(`\n--- ${catLabel} ---`);
    for (const issue of catIssues) {
      const icon = issue.level === "error" ? "NG" : issue.level === "warn" ? "!!" : "  ";
      console.log(`  [${icon}] ${issue.message}`);
    }
  }

  // サマリー
  console.log("\n" + "-".repeat(70));
  console.log(`  ERROR: ${errors.length} / WARN: ${warns.length} / INFO: ${infos.length}`);
  if (errors.length === 0 && warns.length === 0) {
    console.log("  All clear!");
  }
  console.log("");
}

// ── main ──
async function main() {
  console.log("Site Quality Check — golf.peaky.co.jp");
  console.log(`mode: ${offline ? "offline" : "live"} ${filterMode || "all"}`);

  try {
    if (shouldRun("--data")) await checkData();
    if (shouldRun("--seo")) await checkSeo();
    if (shouldRun("--links")) await checkLinks();
    if (shouldRun("--images")) await checkImages();
    printReport();
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
