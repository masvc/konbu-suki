/**
 * 楽天市場から昆布系の商品を探し、DBにまだ無いものを取り込む。
 *
 * Usage:
 *   npx tsx scripts/fetch-rakuten-kombu.ts               # 下見。DBには書かない
 *   npx tsx scripts/fetch-rakuten-kombu.ts --pages 3     # 1語あたりの取得ページ数（既定2）
 *   npx tsx scripts/fetch-rakuten-kombu.ts --min-price 800
 *   npx tsx scripts/fetch-rakuten-kombu.ts --write       # DBに入れる
 *
 * 検索語はこのサイトの分類（lib/constants.ts の CATEGORIES と ORIGINS）から
 * 組み立てる。思いつきの語を並べると、サイトの分類に載らない商品ばかり拾う。
 *
 * 埋められない項目は埋めない（CLAUDE.md: 商品データを捏造しない）。
 * - description は入れない。楽天の itemCaption は販促文であって商品説明ではない
 * - brand は商品名から既存ブランドに一致したときだけ入れる。分からないものは
 *   既存データと同じ「ノーブランド品」にする（既に15件ある）
 * - origin と weight は商品名に明記されているときだけ入れる
 * - category は検索に使った分類をそのまま使う（推測ではない）
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createPrisma } from "./lib/db";
import { CATEGORIES, ORIGINS, type CategorySlug, type OriginSlug } from "../src/lib/constants";
import { searchItems, sleep, API_INTERVAL_MS, hasCredentials, type RakutenItem } from "./lib/rakuten-ichiba";
import { containment, normalize } from "./lib/match";

const prisma = createPrisma();

const args = process.argv.slice(2);
const write = args.includes("--write");
const numberAfter = (flag: string, fallback: number) => {
  const i = args.indexOf(flag);
  if (i === -1) return fallback;
  const n = Number(args[i + 1]);
  return Number.isFinite(n) ? n : fallback;
};
const pages = numberAfter("--pages", 2);
const minPrice = numberAfter("--min-price", 300);
/** 既存商品・他候補と同じ物とみなす一致率 */
const DUPLICATE_THRESHOLD = 0.85;

const OUT_DIR = path.resolve(__dirname, "tmp");
const UNKNOWN_BRAND = "ノーブランド品";

type Search = { keyword: string; category: CategorySlug; origin: OriginSlug | null };

/** 検索語をサイトの分類から作る */
function buildSearches(): Search[] {
  const searches: Search[] = [];
  for (const [slug, cat] of Object.entries(CATEGORIES)) {
    searches.push({ keyword: cat.label, category: slug as CategorySlug, origin: null });
  }
  // 産地はだし昆布として扱う。産地名だけだと昆布以外も混ざるので「昆布」を付ける
  for (const [slug, origin] of Object.entries(ORIGINS)) {
    const label = origin.label.endsWith("昆布") ? origin.label : `${origin.label} 昆布`;
    searches.push({ keyword: label, category: "dashi", origin: slug as OriginSlug });
  }
  return searches;
}

/** 販促の【】囲みを落とす。商品名として読めるようにするだけで、中身は変えない。 */
function cleanName(itemName: string): string {
  return itemName
    .replace(/【[^】]*】/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** 商品名に既知のブランドが出てくればそれを使う。無ければ「ノーブランド品」。 */
function detectBrand(itemName: string, knownBrands: string[]): string {
  const normalized = normalize(itemName);
  let found = "";
  for (const brand of knownBrands) {
    if (brand === UNKNOWN_BRAND) continue;
    const nb = normalize(brand);
    if (nb.length >= 2 && normalized.includes(nb) && nb.length > normalize(found).length) {
      found = brand;
    }
  }
  return found || UNKNOWN_BRAND;
}

/** 商品名に書かれている内容量。書かれていなければ null。 */
function detectWeight(itemName: string): string | null {
  const m = itemName.match(/(\d+(?:\.\d+)?)\s*(kg|ｋｇ|g|ｇ)\b/i);
  if (!m) return null;
  const unit = /k/i.test(m[2]) ? "kg" : "g";
  return `${m[1]}${unit}`;
}

/** 商品名に明記された産地。推測はしない。 */
function detectOrigin(itemName: string): string | null {
  for (const place of ["北海道", "富山", "青森", "岩手", "宮城"]) {
    if (itemName.includes(place)) return place;
  }
  return null;
}

function detectSubcategory(itemName: string, fallback: OriginSlug | null): string | null {
  const normalized = normalize(itemName);
  for (const [slug, origin] of Object.entries(ORIGINS)) {
    if (normalized.includes(normalize(origin.label))) return slug;
  }
  return fallback;
}

type Proposal = {
  rakutenId: string;
  name: string;
  originalName: string;
  brand: string;
  brandDetected: boolean;
  category: CategorySlug;
  subcategory: string | null;
  origin: string | null;
  weight: string | null;
  price: number;
  imageUrl: string | null;
  rakutenUrl: string;
  shopName: string;
  reviewCount: number;
  foundBy: string;
};

async function main() {
  if (!hasCredentials()) {
    console.error("RAKUTEN_APP_ID と RAKUTEN_ACCESS_KEY が必要。");
    process.exit(1);
  }

  const existing = await prisma.product.findMany({
    select: { name: true, brand: true, rakutenId: true },
  });
  const knownBrands = [...new Set(existing.map((p) => p.brand))];
  const existingRakutenIds = new Set(existing.map((p) => p.rakutenId).filter(Boolean) as string[]);
  const existingNames = existing.map((p) => p.name);

  const searches = buildSearches();
  console.log(`検索語 ${searches.length}語 × ${pages}ページ / 既存 ${existing.length}件と突き合わせる`);
  console.log(`下限価格 ${minPrice}円 / 書き込み: ${write ? "する" : "しない（下見）"}`);
  console.log("=".repeat(70));

  const seen = new Set<string>();
  const collected: { item: RakutenItem; search: Search }[] = [];

  for (const [index, search] of searches.entries()) {
    for (let page = 1; page <= pages; page++) {
      if (index > 0 || page > 1) await sleep(API_INTERVAL_MS);
      let items: RakutenItem[] = [];
      try {
        items = await searchItems(search.keyword, { hits: 30, page });
      } catch (e) {
        console.log(`  "${search.keyword}" p${page} 失敗: ${e instanceof Error ? e.message : String(e)}`);
        continue;
      }
      for (const item of items) {
        if (seen.has(item.itemCode)) continue;
        seen.add(item.itemCode);
        collected.push({ item, search });
      }
    }
    console.log(`[${index + 1}/${searches.length}] "${search.keyword}" → 累計 ${collected.length}件`);
  }

  // レビュー数が多い順に見て、似た名前のものは先に出た方を残す
  collected.sort((a, b) => b.item.reviewCount - a.item.reviewCount);

  const proposals: Proposal[] = [];
  const skipped = { already: 0, sameAsExisting: 0, duplicateInBatch: 0, noImage: 0, cheap: 0 };

  for (const { item, search } of collected) {
    if (existingRakutenIds.has(item.itemCode)) { skipped.already++; continue; }
    if (!item.imageUrl) { skipped.noImage++; continue; }
    if (item.itemPrice < minPrice) { skipped.cheap++; continue; }

    const name = cleanName(item.itemName);
    if (existingNames.some((n) => containment(n, name) >= DUPLICATE_THRESHOLD)) {
      skipped.sameAsExisting++;
      continue;
    }
    if (proposals.some((p) => containment(p.name, name) >= DUPLICATE_THRESHOLD)) {
      skipped.duplicateInBatch++;
      continue;
    }

    const brand = detectBrand(item.itemName, knownBrands);
    proposals.push({
      rakutenId: item.itemCode,
      name,
      originalName: item.itemName,
      brand,
      brandDetected: brand !== UNKNOWN_BRAND,
      category: search.category,
      subcategory: detectSubcategory(item.itemName, search.origin),
      origin: detectOrigin(item.itemName),
      weight: detectWeight(item.itemName),
      price: item.itemPrice,
      imageUrl: item.imageUrl,
      rakutenUrl: item.itemUrl,
      shopName: item.shopName,
      reviewCount: item.reviewCount,
      foundBy: search.keyword,
    });
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `rakuten-new-${new Date().toLocaleDateString("sv-SE")}.json`);
  writeFileSync(outFile, JSON.stringify(proposals, null, 2));

  console.log("\n" + "=".repeat(70));
  console.log(`取得 ${collected.length}件 → 取り込み候補 ${proposals.length}件`);
  console.log(
    `  除外: 既に楽天IDあり ${skipped.already} / 既存と同じ ${skipped.sameAsExisting} / ` +
      `候補内の重複 ${skipped.duplicateInBatch} / 画像なし ${skipped.noImage} / 安すぎ ${skipped.cheap}`
  );
  const byCategory = new Map<string, number>();
  for (const p of proposals) byCategory.set(p.category, (byCategory.get(p.category) || 0) + 1);
  console.log(`  分類別: ${[...byCategory].map(([c, n]) => `${c} ${n}`).join(" / ")}`);
  console.log(`  ブランド判明 ${proposals.filter((p) => p.brandDetected).length}件 / 不明 ${proposals.filter((p) => !p.brandDetected).length}件`);
  console.log(`判定の根拠: ${outFile}`);

  if (!write) {
    console.log("\n下見のみ。入れるには --write を付ける。");
    console.log("入れる前に上のJSONで中身を確認すること。");
  } else {
    let created = 0;
    for (const p of proposals) {
      await prisma.product.create({
        data: {
          name: p.name,
          brand: p.brand,
          category: p.category,
          subcategory: p.subcategory,
          origin: p.origin,
          weight: p.weight,
          price: p.price,
          imageUrl: p.imageUrl,
          rakutenUrl: p.rakutenUrl,
          rakutenId: p.rakutenId,
          priceFetchedAt: new Date(),
        },
      });
      created++;
    }
    console.log(`\n${created}件を追加した`);
  }

  console.log(`SUMMARY: 候補 ${proposals.length} / 追加 ${write ? proposals.length : 0}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
