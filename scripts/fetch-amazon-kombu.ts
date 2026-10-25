/**
 * Amazon Creators API で昆布商品を検索してDBに追加
 *
 * Usage:
 *   npx tsx scripts/fetch-amazon-kombu.ts                    # 全キーワード検索
 *   npx tsx scripts/fetch-amazon-kombu.ts "利尻昆布"          # 特定キーワード
 *   npx tsx scripts/fetch-amazon-kombu.ts --dry-run           # DB保存せず確認
 */
import "dotenv/config";
import { ApiClient, TypedDefaultApi, SearchItemsRequestContent, SearchItemsResource } from "amazon-creators-api";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

// DB
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

// Amazon API
const CLIENT_ID = process.env.AMAZON_CREATORS_CLIENT_ID;
const CLIENT_SECRET = process.env.AMAZON_CREATORS_CLIENT_SECRET;
const VERSION = process.env.AMAZON_CREATORS_VERSION || "3.3";
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || "march507-22";
const MARKETPLACE = "www.amazon.co.jp";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("AMAZON_CREATORS_CLIENT_ID / AMAZON_CREATORS_CLIENT_SECRET が .env に未設定");
  process.exit(1);
}

const apiClient = new ApiClient();
apiClient.credentialId = CLIENT_ID;
apiClient.credentialSecret = CLIENT_SECRET;
apiClient.version = VERSION;
const api = new TypedDefaultApi(apiClient);

type CreatorsItem = {
  asin?: string;
  detailPageURL?: string;
  images?: {
    primary?: {
      large?: { url: string };
      medium?: { url: string };
    };
  };
  itemInfo?: {
    title?: { displayValue: string };
    byLineInfo?: { brand?: { displayValue: string } };
    classifications?: { productGroup?: { displayValue: string } };
  };
  offersV2?: {
    listings?: Array<{
      price?: { money?: { amount: number; displayAmount: string } };
    }>;
  };
};

// 検索キーワードとカテゴリのマッピング
const SEARCH_QUERIES = [
  // だし昆布・産地別
  { keyword: "昆布 だし", category: "dashi", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "利尻昆布", category: "dashi", subcategory: "rishiri", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "羅臼昆布", category: "dashi", subcategory: "rausu", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "日高昆布", category: "dashi", subcategory: "hidaka", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "真昆布", category: "dashi", subcategory: "makombu", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "がごめ昆布", category: "dashi", subcategory: "gagome", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "長昆布", category: "dashi", subcategory: "nagakombu", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "細目昆布", category: "dashi", subcategory: "hosome", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "昆布 天然 北海道", category: "dashi", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "だし昆布 業務用", category: "dashi", searchIndex: "GroceryAndGourmetFood" },

  // 塩昆布
  { keyword: "塩昆布", category: "shiokombu", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "塩こんぶ", category: "shiokombu", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "塩昆布 無添加", category: "shiokombu", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "えびすめ 昆布", category: "shiokombu", searchIndex: "GroceryAndGourmetFood" },

  // 食べる昆布・おやつ
  { keyword: "おしゃぶり昆布", category: "snack", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "酢昆布", category: "snack", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "都こんぶ", category: "snack", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "昆布 おやつ", category: "snack", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "おつまみ昆布", category: "snack", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "こんぶ おやつ", category: "snack", searchIndex: "GroceryAndGourmetFood" },

  // 佃煮
  { keyword: "昆布 佃煮", category: "tsukudani", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "松前漬け 昆布", category: "tsukudani", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "昆布巻き", category: "tsukudani", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "しそ昆布", category: "tsukudani", searchIndex: "GroceryAndGourmetFood" },

  // とろろ昆布
  { keyword: "とろろ昆布", category: "tororo", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "おぼろ昆布", category: "tororo", searchIndex: "GroceryAndGourmetFood" },

  // 昆布茶
  { keyword: "昆布茶", category: "kombucha", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "梅昆布茶", category: "kombucha", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "こんぶ茶", category: "kombucha", searchIndex: "GroceryAndGourmetFood" },

  // 調味料
  { keyword: "昆布だし 素", category: "seasoning", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "ねこぶだし", category: "seasoning", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "昆布つゆ", category: "seasoning", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "昆布 ポン酢", category: "seasoning", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "こんぶだし", category: "seasoning", searchIndex: "GroceryAndGourmetFood" },

  // 健康食品
  { keyword: "フコイダン 昆布", category: "health", searchIndex: "HealthPersonalCare" },
  { keyword: "昆布 サプリ", category: "health", searchIndex: "HealthPersonalCare" },
  { keyword: "がごめ昆布 フコイダン", category: "health", searchIndex: "HealthPersonalCare" },

  // ギフト
  { keyword: "昆布 ギフト", category: "gift", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "昆布 詰め合わせ", category: "gift", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "昆布 お歳暮", category: "gift", searchIndex: "GroceryAndGourmetFood" },

  // 汎用キーワード
  { keyword: "昆布", category: "dashi", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "こんぶ", category: "dashi", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "こぶ 昆布", category: "dashi", searchIndex: "GroceryAndGourmetFood" },
  { keyword: "昆布 人気", category: "dashi", searchIndex: "GroceryAndGourmetFood" },
];

async function searchAmazon(keyword: string, searchIndex: string): Promise<CreatorsItem[] | null> {
  try {
    const req = new SearchItemsRequestContent();
    req.partnerTag = PARTNER_TAG;
    req.keywords = keyword;
    req.searchIndex = searchIndex;
    req.itemCount = 10; // max per request
    req.resources = [
      "images.primary.large",
      "images.primary.medium",
      "itemInfo.title",
      "itemInfo.byLineInfo",
      "offersV2.listings.price",
    ].map((r) => SearchItemsResource.constructFromObject(r));

    const response = await api.searchItems(MARKETPLACE, req);
    return (response?.searchResult?.items as CreatorsItem[]) || [];
  } catch (err: unknown) {
    const errStr = JSON.stringify(err, null, 2).substring(0, 400);
    if (errStr.includes("TooManyRequests") || errStr.includes("429")) {
      console.log("  Rate limited, waiting 5s...");
      await new Promise((r) => setTimeout(r, 5000));
      return null;
    }
    if (errStr.includes("NoResults") || errStr.includes("no results")) return [];
    console.error(`  API error: ${errStr}`);
    return null;
  }
}

function categorizeByTitle(title: string, defaultCategory: string, defaultSubcategory?: string) {
  const t = title.toLowerCase();
  let category = defaultCategory;
  let subcategory = defaultSubcategory;

  // Auto-detect category from title
  if (t.includes("塩昆布") || t.includes("塩こんぶ") || t.includes("えびすめ")) category = "shiokombu";
  else if (t.includes("佃煮") || t.includes("松前漬") || t.includes("昆布巻")) category = "tsukudani";
  else if (t.includes("とろろ") || t.includes("おぼろ")) category = "tororo";
  else if (t.includes("昆布茶") || t.includes("こんぶ茶") || t.includes("こぶ茶")) category = "kombucha";
  else if (t.includes("おしゃぶり") || t.includes("酢昆布") || t.includes("おやつ") || t.includes("都こんぶ")) category = "snack";
  else if (t.includes("だしの素") || t.includes("ねこぶだし") || t.includes("つゆ") || t.includes("ポン酢") || t.includes("顆粒")) category = "seasoning";
  else if (t.includes("フコイダン") || t.includes("サプリ")) category = "health";
  else if (t.includes("ギフト") || t.includes("詰め合わせ") || t.includes("お歳暮") || t.includes("お中元")) category = "gift";

  // Auto-detect origin/subcategory
  if (!subcategory) {
    if (t.includes("利尻")) subcategory = "rishiri";
    else if (t.includes("羅臼")) subcategory = "rausu";
    else if (t.includes("日高")) subcategory = "hidaka";
    else if (t.includes("真昆布")) subcategory = "makombu";
    else if (t.includes("がごめ")) subcategory = "gagome";
    else if (t.includes("長昆布")) subcategory = "nagakombu";
  }

  // Detect origin
  let origin: string | undefined;
  if (t.includes("北海道")) origin = "北海道";
  if (t.includes("利尻")) origin = "北海道 利尻";
  if (t.includes("羅臼")) origin = "北海道 羅臼";
  if (t.includes("日高")) origin = "北海道 日高";
  if (t.includes("函館")) origin = "北海道 函館";
  if (t.includes("富山")) origin = "富山";
  if (t.includes("大阪")) origin = "大阪";

  return { category, subcategory, origin };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const specificQuery = args.find((a) => !a.startsWith("--"));

  const queries = specificQuery
    ? [{ keyword: specificQuery, category: "dashi", searchIndex: "GroceryAndGourmetFood" }]
    : SEARCH_QUERIES;

  console.log(`\n🫒 ${queries.length}キーワードでAmazon昆布商品を検索\n`);
  if (dryRun) console.log("   [DRY RUN]\n");

  const seenAsins = new Set<string>();
  // Existing ASINs in DB
  const existing = await prisma.product.findMany({ select: { amazonAsin: true }, where: { amazonAsin: { not: null } } });
  for (const e of existing) if (e.amazonAsin) seenAsins.add(e.amazonAsin);

  let added = 0;
  let skipped = 0;

  for (const q of queries) {
    console.log(`\n── "${q.keyword}" (${q.category}) ──`);

    const items = await searchAmazon(q.keyword, q.searchIndex);
    if (items === null) {
      // Rate limited, retry once
      const retry = await searchAmazon(q.keyword, q.searchIndex);
      if (!retry) { console.log("  skipped (rate limit)"); continue; }
    }
    if (!items || items.length === 0) {
      console.log("  no results");
      continue;
    }

    for (const item of items) {
      const asin = item.asin;
      if (!asin || seenAsins.has(asin)) {
        skipped++;
        continue;
      }
      seenAsins.add(asin);

      const title = item.itemInfo?.title?.displayValue || "";
      const brand = item.itemInfo?.byLineInfo?.brand?.displayValue || "";
      const imageUrl = item.images?.primary?.large?.url || item.images?.primary?.medium?.url || null;
      const price = item.offersV2?.listings?.[0]?.price?.money?.amount;
      const priceInt = price ? Math.round(price) : null;
      const amazonUrl = `https://www.amazon.co.jp/dp/${asin}?tag=${PARTNER_TAG}`;

      const { category, subcategory, origin } = categorizeByTitle(title, q.category, q.subcategory);

      console.log(`  + ${title.substring(0, 60)} [${asin}] ¥${priceInt || "?"} (${category})`);

      if (!dryRun) {
        await prisma.product.create({
          data: {
            name: title,
            brand: brand || "不明",
            category,
            subcategory: subcategory || null,
            imageUrl,
            price: priceInt,
            origin: origin || null,
            amazonAsin: asin,
            amazonUrl,
            isFeatured: false,
          },
        });
      }
      added++;
    }

    // Rate limit: 1 req/sec
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n✅ 追加: ${added}件 / スキップ(重複): ${skipped}件`);
  const total = await prisma.product.count();
  console.log(`   DB内 合計: ${total}商品\n`);

  await prisma.$disconnect();
}

main().catch(console.error);
