/**
 * imageUrlがない商品のAmazon画像を一括取得
 * ASINがある商品 → GetItems API で画像取得
 * ASINがない商品 → 商品名で SearchItems して画像+ASIN取得
 *
 * Usage:
 *   npx tsx scripts/fetch-missing-images.ts
 *   npx tsx scripts/fetch-missing-images.ts --dry-run
 */
import "dotenv/config";
import { ApiClient, TypedDefaultApi, GetItemsRequestContent, GetItemsResource, SearchItemsRequestContent, SearchItemsResource } from "amazon-creators-api";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const apiClient = new ApiClient();
apiClient.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID!;
apiClient.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET!;
apiClient.version = "3.3";
const api = new TypedDefaultApi(apiClient);
const TAG = process.env.AMAZON_PARTNER_TAG || "konbu-suki-22";
const MKT = "www.amazon.co.jp";

type Item = {
  asin?: string;
  images?: { primary?: { large?: { url: string }; medium?: { url: string } } };
  itemInfo?: { title?: { displayValue: string }; byLineInfo?: { brand?: { displayValue: string } } };
  offersV2?: { listings?: Array<{ price?: { money?: { amount: number } } }> };
};

async function getItemsByAsins(asins: string[]): Promise<Item[]> {
  try {
    const req = new GetItemsRequestContent();
    req.partnerTag = TAG;
    req.itemIds = asins;
    req.resources = [
      "images.primary.large", "images.primary.medium",
      "itemInfo.title", "itemInfo.byLineInfo",
      "offersV2.listings.price",
    ].map(r => GetItemsResource.constructFromObject(r));
    const res = await api.getItems(MKT, req);
    return ((res as any)?.itemsResult?.items as Item[]) || [];
  } catch (err: unknown) {
    const s = JSON.stringify(err).substring(0, 200);
    if (s.includes("TooManyRequests") || s.includes("429")) {
      console.log("  rate limited, waiting 5s...");
      await new Promise(r => setTimeout(r, 5000));
    } else {
      console.log(`  GetItems error: ${s}`);
    }
    return [];
  }
}

async function searchItem(keyword: string): Promise<Item | null> {
  try {
    const req = new SearchItemsRequestContent();
    req.partnerTag = TAG;
    req.keywords = keyword;
    req.searchIndex = "GroceryAndGourmetFood";
    req.itemCount = 1;
    req.resources = [
      "images.primary.large", "images.primary.medium",
      "itemInfo.title",
      "offersV2.listings.price",
    ].map(r => SearchItemsResource.constructFromObject(r));
    const res = await api.searchItems(MKT, req);
    const items = (res as any)?.searchResult?.items as Item[];
    return items?.[0] || null;
  } catch {
    return null;
  }
}

async function main() {
  const dryRun = process.argv.includes("--dry-run");

  // Phase 1: ASINがあるけど画像がない商品
  const withAsin = await prisma.product.findMany({
    where: { amazonAsin: { not: null }, imageUrl: null },
    select: { id: true, name: true, amazonAsin: true },
  });
  console.log(`\nPhase 1: ASIN有り画像なし ${withAsin.length}件`);

  // 10件ずつバッチ処理（GetItems APIは最大10件）
  let updated = 0;
  for (let i = 0; i < withAsin.length; i += 10) {
    const batch = withAsin.slice(i, i + 10);
    const asins = batch.map(p => p.amazonAsin!).filter(Boolean);
    if (asins.length === 0) continue;

    console.log(`  batch ${Math.floor(i / 10) + 1}: ${asins.length} ASINs`);
    const items = await getItemsByAsins(asins);

    for (const item of items) {
      const img = item.images?.primary?.large?.url || item.images?.primary?.medium?.url;
      if (!img || !item.asin) continue;

      const product = batch.find(p => p.amazonAsin === item.asin);
      if (!product) continue;

      const price = item.offersV2?.listings?.[0]?.price?.money?.amount;

      if (!dryRun) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            imageUrl: img,
            ...(price ? { price: Math.round(price) } : {}),
          },
        });
      }
      console.log(`    + [${item.asin}] ${product.name.substring(0, 40)}...`);
      updated++;
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  // Phase 2: ASINもなく画像もない商品 → 検索で取得
  const noAsin = await prisma.product.findMany({
    where: { amazonAsin: null, imageUrl: null },
    select: { id: true, name: true, brand: true },
  });
  console.log(`\nPhase 2: ASIN無し画像なし ${noAsin.length}件`);

  for (const product of noAsin) {
    const keyword = `${product.name} ${product.brand}`.substring(0, 60);
    console.log(`  searching: ${keyword.substring(0, 50)}...`);

    const item = await searchItem(keyword);
    if (!item) {
      await new Promise(r => setTimeout(r, 1500));
      continue;
    }

    const img = item.images?.primary?.large?.url || item.images?.primary?.medium?.url;
    const asin = item.asin;
    const price = item.offersV2?.listings?.[0]?.price?.money?.amount;

    if (img || asin) {
      if (!dryRun) {
        await prisma.product.update({
          where: { id: product.id },
          data: {
            ...(img ? { imageUrl: img } : {}),
            ...(asin ? { amazonAsin: asin, amazonUrl: `https://www.amazon.co.jp/dp/${asin}?tag=${TAG}` } : {}),
            ...(price ? { price: Math.round(price) } : {}),
          },
        });
      }
      console.log(`    + ${img ? "img" : ""}${asin ? " asin" : ""} -> ${product.name.substring(0, 40)}`);
      updated++;
    }

    await new Promise(r => setTimeout(r, 1500));
  }

  // Stats
  const total = await prisma.product.count();
  const withImage = await prisma.product.count({ where: { imageUrl: { not: null } } });
  console.log(`\n updated: ${updated}`);
  console.log(` image coverage: ${withImage}/${total} (${Math.round(withImage / total * 100)}%)\n`);

  await prisma.$disconnect();
}

main().catch(console.error);
