/**
 * サイト品質チェックスクリプト
 *
 * 自サイトの品質を自動チェック。対象 URL は lib/site.ts 経由で .env に従う。
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
import { PrismaPg } from "@prisma/adapter-pg";
import { GUIDES } from "../src/lib/guides";
import { CATEGORY_SLUGS } from "../src/lib/constants";
import { PUBLIC_SITE_URL, PUBLIC_SITE_HOST } from "./lib/site";
import { CONTENT_PAGES, GUIDE_PAGES } from "./lib/content";
import { batchCheckUrls } from "./lib/http";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
const BASE_URL = PUBLIC_SITE_URL;
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
// ══════════════════════════════════════════
// 1. データ品質チェック
// ══════════════════════════════════════════
async function checkData() {
  console.log("\n[1/4] データ品質チェック...");

  const total = await prisma.product.count();
  if (total === 0) {
    add("error", "data", "商品が0件 — DB 接続か投入状況を確認する");
    return;
  }

  const noImage = await prisma.product.count({ where: { imageUrl: null } });
  const noPrice = await prisma.product.count({ where: { price: null } });
  const noDescription = await prisma.product.count({ where: { description: null } });
  const noBuyLink = await prisma.product.count({
    where: { amazonUrl: null, rakutenUrl: null },
  });
  const noCategory = await prisma.product.count({ where: { category: "" } });

  const pct = (n: number) => `${((n / total) * 100).toFixed(1)}%`;

  add("info", "data", `商品総数: ${total}`);
  if (noCategory > 0) add("error", "data", `category未設定: ${noCategory}件`);
  if (noImage > 0) add("warn", "data", `画像なし: ${noImage}件 (${pct(noImage)})`);
  if (noBuyLink > 0) add("warn", "data", `購入リンクなし: ${noBuyLink}件 (${pct(noBuyLink)})`);
  if (noPrice > 0) add("info", "data", `参考価格なし: ${noPrice}件 (${pct(noPrice)})`);
  if (noDescription > 0) add("info", "data", `説明文なし: ${noDescription}件 (${pct(noDescription)})`);

  // カテゴリ分布と、定義にないカテゴリの混入
  const cats = await prisma.$queryRaw<{ category: string; cnt: bigint }[]>`
    SELECT category, COUNT(*) as cnt FROM products
    GROUP BY category ORDER BY cnt DESC
  `;
  const known = new Set<string>(CATEGORY_SLUGS);
  const unknown = cats.filter((c) => !known.has(c.category));
  if (unknown.length > 0) {
    add(
      "error",
      "data",
      `定義にないカテゴリ: ${unknown.map((c) => `${c.category}(${c.cnt})`).join(", ")}`
    );
  }
  add(
    "info",
    "data",
    `カテゴリ分布Top5: ${cats.slice(0, 5).map((c) => `${c.category}(${c.cnt})`).join(", ")}`
  );

  // 重複（同名+同ブランド）
  const dupes = await prisma.$queryRaw<{ name: string; brand: string; cnt: bigint }[]>`
    SELECT name, brand, COUNT(*) as cnt FROM products
    GROUP BY name, brand HAVING COUNT(*) > 1
    ORDER BY cnt DESC LIMIT 10
  `;
  if (dupes.length > 0) {
    add("warn", "data", `重複商品(同名+同ブランド): ${dupes.length}件`);
    for (const d of dupes.slice(0, 5)) {
      add("warn", "data", `  "${d.name}" / ${d.brand} x${d.cnt}`);
    }
  }

  const reviews = await prisma.review.count();
  const articles = await prisma.article.count();
  const drafts = await prisma.article.count({ where: { published: false } });
  const ownerPicks = await prisma.product.count({ where: { isOwnerPick: true } });
  add(
    "info",
    "data",
    `レビュー: ${reviews} / 記事: ${articles}（未公開 ${drafts}） / 運営者リピート品: ${ownerPicks}`
  );
}

// ══════════════════════════════════════════
// 2. コンテンツ整合性 & SEO チェック
// ══════════════════════════════════════════
async function checkSeo() {
  console.log("\n[2/4] コンテンツ整合性 & SEO チェック...");

  // title / description の長さと重複は meta-check.ts が実際の meta 文面を
  // 見て検査する。ここで同じ判定を持つと二重管理になるので持たない。

  // ── ガイド本文の薄さ ──
  for (const [slug, guide] of Object.entries(GUIDES)) {
    const body = guide.sections.reduce((sum, s) => sum + s.body.length, 0);
    if (body < 300) {
      add("warn", "seo", `guide/${slug}: 本文が薄い (${body}字)`);
    }
  }

  // ── ガイド画像 ──
  for (const page of GUIDE_PAGES) {
    const imgPath = `public/guide/${page.slug}.webp`;
    if (!existsSync(imgPath)) {
      add("error", "seo", `ガイド画像なし: ${imgPath}`);
    }
  }

  // ── FAQ ──
  const withFaq = GUIDE_PAGES.filter((p) => p.faqCount > 0).length;
  add("info", "seo", `FAQ付きガイド: ${withFaq}/${GUIDE_PAGES.length}`);

  // ── E-E-A-T ──
  const eeatFiles = [
    { path: "src/app/about/page.tsx", label: "運営者情報ページ" },
    { path: "src/app/about/editorial-policy/page.tsx", label: "編集方針ページ" },
    { path: "src/app/about/data/page.tsx", label: "データ出典ページ" },
  ];
  for (const file of eeatFiles) {
    if (existsSync(file.path)) {
      add("info", "seo", `E-E-A-T: ${file.label} — あり`);
    } else {
      add("warn", "seo", `E-E-A-T: ${file.label} — なし（信頼性向上に効果的）`);
    }
  }

  const byKind = (kind: string) => CONTENT_PAGES.filter((p) => p.kind === kind).length;
  add(
    "info",
    "seo",
    `コンテンツ: ガイド${byKind("guide")} / 産地${byKind("origin")} / カテゴリ${byKind("category")}`
  );
}

// ══════════════════════════════════════════
// 3. リンク切れチェック（ライブ）
// ══════════════════════════════════════════
async function checkLinks() {
  if (offline) {
    console.log("\n[3/4] リンク切れチェック... SKIP (--offline)");
    return;
  }
  console.log("\n[3/4] 主要ページ & HTMLサイズチェック（ライブ）...");

  // sitemap 起点の全URL走査は check-links.ts が担当する。ここは主要ページの
  // 疎通と、Googlebot の 2MB 上限に対する HTML サイズの見張りに絞る。

  const sizeCheckPages = ["/", "/guide", "/kombu-box", "/producers", "/search"];
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
        add(
          "warn",
          "links",
          `HTML ${sizeKB}KB — 大きめ（2MB上限の${Math.round((sizeKB / 2048) * 100)}%）: ${path}`
        );
      }
    } catch { /* 疎通は下のチェックで拾う */ }
  }

  const pages = [
    "/",
    "/about",
    "/contact",
    "/guide",
    "/kombu-box",
    "/producers",
    "/search",
    ...CONTENT_PAGES.map((p) => p.path),
  ];

  const urls = pages.map((p) => `${BASE_URL}${p}`);
  const results = await batchCheckUrls(urls, { concurrency: 8, label: "ページ" });

  let ok = 0;
  let fail = 0;
  for (const [url, status] of results) {
    if (status === 200) {
      ok++;
    } else {
      fail++;
      add("error", "links", `${url.replace(BASE_URL, "")} → ${status}`);
    }
  }
  add("info", "links", `ページチェック: ${ok} OK / ${fail} NG (計${urls.length})`);
}

// ══════════════════════════════════════════
// 4. 画像チェック
// ══════════════════════════════════════════
async function checkImages() {
  console.log("\n[4/4] 画像チェック...");

  const guideImgDir = "public/guide";
  if (existsSync(guideImgDir)) {
    const files = readdirSync(guideImgDir).filter((f: string) => f.endsWith(".webp"));
    const guideSlugs = new Set(GUIDE_PAGES.map((p) => p.slug));
    const orphanImages = files.filter((f: string) => !guideSlugs.has(f.replace(".webp", "")));
    if (orphanImages.length > 0) {
      add("info", "images", `孤立ガイド画像（記事なし）: ${orphanImages.length}件`);
    }
    add("info", "images", `ガイド画像: ${files.length}件 / ガイド記事: ${GUIDE_PAGES.length}件`);
  }

  if (offline) {
    console.log("  画像URLチェック... SKIP (--offline)");
    return;
  }

  // 全件は時間がかかるのでランダム50件のサンプリング
  const withImage = await prisma.product.findMany({
    where: { imageUrl: { not: null } },
    select: { id: true, name: true, imageUrl: true },
  });

  const sampleSize = Math.min(50, withImage.length);
  const sample = withImage.sort(() => Math.random() - 0.5).slice(0, sampleSize);

  add("info", "images", `商品画像サンプリング: ${sampleSize}/${withImage.length}件をチェック`);

  const imageResults = await batchCheckUrls(sample.map((p) => p.imageUrl!), {
    concurrency: 5,
    label: "画像",
  });

  let img404 = 0;
  for (const p of sample) {
    const status = imageResults.get(p.imageUrl!);
    if (status !== 200) {
      img404++;
      if (img404 <= 10) {
        add("error", "images", `画像404: 商品#${p.id} "${p.name}" → ${status}`);
      }
    }
  }

  if (img404 > 0) {
    const estimated = Math.round((img404 / sampleSize) * withImage.length);
    add(
      "warn",
      "images",
      `画像404率: ${img404}/${sampleSize} (${((img404 / sampleSize) * 100).toFixed(1)}%) — 推定全体${estimated}件`
    );
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
  // health-report.ts が拾う要約行
  console.log(`SUMMARY: ERROR ${errors.length} / WARN ${warns.length} / INFO ${infos.length}`);
}

// ── main ──
async function main() {
  console.log(`Site Quality Check — ${PUBLIC_SITE_HOST}`);
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
