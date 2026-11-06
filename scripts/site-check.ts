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
import { existsSync, readdirSync, statSync } from "fs";
import { createPrisma } from "./lib/db";
import { GUIDES } from "../src/lib/guides";
import { CATEGORY_SLUGS, SITE_NAME } from "../src/lib/constants";
import { PUBLIC_SITE_URL, PUBLIC_SITE_HOST } from "./lib/site";
import { CONTENT_PAGES, GUIDE_PAGES } from "./lib/content";
import { batchCheckUrls } from "./lib/http";

const prisma = createPrisma();
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

  // ── 関連記事（内部リンク） ──
  // 未指定だと描画側が GUIDES の先頭から4本を埋める。記事が増えると、どの
  // 記事を開いても同じ4本が並ぶだけになり、内部リンクとして働かない。
  // 存在しない slug を指しているとリンクが1本消えるが、画面上は分からない。
  const guideSlugs = new Set(Object.keys(GUIDES));
  for (const [slug, guide] of Object.entries(GUIDES)) {
    if (!guide.related || guide.related.length === 0) {
      add("warn", "seo", `guide/${slug}: related 未指定（関連記事が先頭4本の固定になる）`);
      continue;
    }
    for (const target of guide.related) {
      if (target === slug) {
        add("warn", "seo", `guide/${slug}: related が自分自身を指している`);
      } else if (!guideSlugs.has(target)) {
        add("warn", "seo", `guide/${slug}: related に存在しない slug "${target}"`);
      }
    }
  }

  // どの記事の related にも入っていない記事は、記事末尾からたどり着けない孤立記事。
  const linkedTo = new Set(
    Object.entries(GUIDES).flatMap(([slug, g]) => (g.related ?? []).filter((t) => t !== slug)),
  );
  for (const slug of guideSlugs) {
    if (!linkedTo.has(slug)) {
      add("warn", "seo", `guide/${slug}: 孤立記事（どの記事の related にも入っていない）`);
    }
  }

  // ── ガイド画像 ──
  // 画像を宣言しているのにファイルが無いのは壊れたリンクなので error。
  // 宣言していない記事は、画像が無いだけで壊れてはいない（ページも
  // 構造化データも image を出さない）ので warn にとどめる。
  for (const [slug, guide] of Object.entries(GUIDES)) {
    const declared = guide.image;
    if (declared) {
      const imgPath = `public${declared}`;
      if (!existsSync(imgPath)) {
        add("error", "seo", `ガイド画像が見つからない: ${imgPath}（guide.image で指定）`);
      }
      continue;
    }
    const conventional = `public/guide/${slug}.webp`;
    if (existsSync(conventional)) {
      add("warn", "seo", `guide/${slug}: 画像ファイルはあるが guide.image で指定されていない`);
    } else {
      add("warn", "seo", `guide/${slug}: アイキャッチ画像なし`);
    }
  }

  // ── OGP画像 ──
  // 無いとサイト共通の画像が出る。見た目には分からず、共有されて初めて気付く。
  for (const [slug, guide] of Object.entries(GUIDES)) {
    if (!guide.image) continue;
    if (!existsSync(`public/og/${slug}.webp`)) {
      add("warn", "seo", `guide/${slug}: OGP画像が無い → npx tsx scripts/generate-og-images.ts ${slug}`);
    }
  }

  // ── 画像のファイルサイズ ──
  // CLAUDE.md の「全画像200KB以下」。生成スクリプトは収めてから保存するが、
  // その処理を入れる前に作った画像が超えたまま残る。覚えておく話にせず点検で出す。
  // 直すのは npm run images:optimize -- --write。
  const IMAGE_MAX_BYTES = 200 * 1024;
  for (const [slug, guide] of Object.entries(GUIDES)) {
    if (!guide.image) continue;
    const imgPath = `public${guide.image}`;
    if (!existsSync(imgPath)) continue;
    const size = statSync(imgPath).size;
    if (size > IMAGE_MAX_BYTES) {
      add(
        "warn",
        "seo",
        `guide/${slug}: 画像が${(size / 1024).toFixed(0)}KB（上限200KB）→ npm run images:optimize -- --write`
      );
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

  // canonical と title は、配信された HTML を見ないと確かめられない。
  // meta-check.ts は page-meta.ts の文字列を検査するので、layout 側の設定で
  // 上書き・二重付与が起きても気付けない。実際に起きた。
  //   - layout の alternates.canonical を全ページが継承し、どの記事も canonical が
  //     トップを指していた（検索側には「トップの複製」と伝わる。36/36 未検出）
  //   - layout の title.template が page-meta の title にサイト名をもう一度足し、
  //     「… | コンブスキー | コンブスキー」になっていた
  const sizeCheckPages = ["/", "/guide", "/kombu-box", "/producers", "/search"];
  const metaCheckPages = ["/", "/guide", "/about", ...CONTENT_PAGES.slice(0, 6).map((p) => p.path)];
  for (const path of metaCheckPages) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, { headers: { "User-Agent": "SiteCheck/1.0" } });
      const html = await res.text();
      const canonical = html.match(/rel="canonical"\s+href="([^"]+)"/)?.[1];
      const expected = `${BASE_URL}${path === "/" ? "" : path}`;
      if (!canonical) {
        add("error", "seo", `canonical が無い: ${path}`);
      } else if (canonical.replace(/\/$/, "") !== expected.replace(/\/$/, "")) {
        add("error", "seo", `canonical が自分を指していない: ${path} → ${canonical}`);
      }
      const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
      const occurrences = title.split(SITE_NAME).length - 1;
      if (occurrences > 1) {
        add("error", "seo", `title にサイト名が${occurrences}回出ている: ${path} → ${title}`);
      }
    } catch {
      /* 疎通は下のチェックで拾う */
    }
  }

  // サイトマップの lastmod。取得のたびに値が変わると、検索側はその値を
  // 当てにしなくなる。以前 new Date() を入れていて、2秒差で別の値が返っていた。
  // 画面には出ないので、2回取って比べないと分からない。
  try {
    const fetchLastmods = async () => {
      const res = await fetch(`${BASE_URL}/sitemap.xml`, {
        headers: { "User-Agent": "SiteCheck/1.0" },
      });
      const xml = await res.text();
      return [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]).slice(0, 20);
    };
    const first = await fetchLastmods();
    await new Promise((r) => setTimeout(r, 2000));
    const second = await fetchLastmods();
    const changed = first.filter((v, i) => second[i] && second[i] !== v).length;
    if (changed > 0) {
      add(
        "error",
        "seo",
        `sitemap の lastmod が取得のたびに変わる（${changed}件）。現在時刻を入れていないか確認する`
      );
    }
  } catch {
    /* 疎通は下のチェックで拾う */
  }

  // 構造化データ。Search Console から「offers / review / aggregateRating の
  // いずれかが必要」という重大な問題が報告された（2026-11-05）。重大な問題が付くと
  // リッチリザルトに出なくなるが、画面上は何も変わらないので気付けない。
  const productSample = await prisma.product.findMany({
    where: { NOT: { price: null } },
    select: { id: true },
    take: 3,
    orderBy: { id: "desc" },
  });
  for (const { id } of productSample) {
    try {
      const res = await fetch(`${BASE_URL}/product/${id}`, {
        headers: { "User-Agent": "SiteCheck/1.0" },
      });
      const html = await res.text();
      const blocks = [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)];
      const product = blocks
        .map((m) => {
          try {
            return JSON.parse(m[1]) as Record<string, unknown>;
          } catch {
            return null;
          }
        })
        .find((d) => d && d["@type"] === "Product");
      if (!product) {
        add("warn", "seo", `product/${id}: Product の構造化データが無い`);
      } else if (!product.offers && !product.review && !product.aggregateRating) {
        add(
          "error",
          "seo",
          `product/${id}: Product に offers / review / aggregateRating のどれも無い（リッチリザルトに出なくなる）`
        );
      }
    } catch {
      /* 疎通は下のチェックで拾う */
    }
  }

  for (const path of sizeCheckPages) {
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        headers: { "User-Agent": "SiteCheck/1.0", "Accept-Encoding": "identity" },
      });
      const html = await res.text();
      const sizeKB = Math.round(html.length / 1024);
      if (sizeKB > 1500) {
        add("error", "links", `HTML ${sizeKB}KB — Googlebot 2MB上限に接近: ${path}`);
      } else if (sizeKB > 500) {
        add(
          "warn",
          "links",
          `HTML ${sizeKB}KB — 大きめ。商品一覧は件数に比例して伸びる（docs/seo-aio.md）: ${path}`
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
