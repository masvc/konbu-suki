import "dotenv/config";
import { ApiClient, TypedDefaultApi, GetItemsRequestContent, GetItemsResource } from "amazon-creators-api";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const apiClient = new ApiClient();
apiClient.credentialId = process.env.AMAZON_CREATORS_CLIENT_ID!;
apiClient.credentialSecret = process.env.AMAZON_CREATORS_CLIENT_SECRET!;
apiClient.version = "3.3";
const api = new TypedDefaultApi(apiClient);

async function main() {
  const asin = process.argv[2];
  if (!asin) { console.log("Usage: npx tsx scripts/add-product.ts <ASIN> [category]"); return; }
  const category = process.argv[3] || "dashi";

  const req = new GetItemsRequestContent();
  req.partnerTag = process.env.AMAZON_PARTNER_TAG || "konbu-suki-22";
  req.itemIds = [asin];
  req.resources = [
    "images.primary.large", "images.primary.medium",
    "itemInfo.title", "itemInfo.byLineInfo",
    "offersV2.listings.price",
  ].map((r) => GetItemsResource.constructFromObject(r));

  const res = await api.getItems("www.amazon.co.jp", req);
  const item = (res as any)?.itemsResult?.items?.[0];
  if (!item) { console.log("Product not found on Amazon"); return; }

  const title = item.itemInfo?.title?.displayValue || "";
  const brand = item.itemInfo?.byLineInfo?.brand?.displayValue || "不明";
  const imageUrl = item.images?.primary?.large?.url || item.images?.primary?.medium?.url || null;
  const price = item.offersV2?.listings?.[0]?.price?.money?.amount;

  console.log(`Title: ${title}`);
  console.log(`Brand: ${brand}`);
  console.log(`Image: ${imageUrl}`);
  console.log(`Price: ${price}`);

  const existing = await prisma.product.findFirst({ where: { amazonAsin: asin } });
  if (existing) {
    console.log("Already in DB, updating to featured...");
    await prisma.product.update({
      where: { id: existing.id },
      data: { isFeatured: true, imageUrl: imageUrl || existing.imageUrl, price: price ? Math.round(price) : existing.price },
    });
  } else {
    await prisma.product.create({
      data: {
        name: title, brand, category, imageUrl,
        price: price ? Math.round(price) : null,
        amazonAsin: asin,
        amazonUrl: `https://www.amazon.co.jp/dp/${asin}?tag=${process.env.AMAZON_PARTNER_TAG || "konbu-suki-22"}`,
        isFeatured: true,
      },
    });
    console.log("Added to DB as featured!");
  }

  const total = await prisma.product.count();
  console.log(`DB total: ${total} products`);
  await prisma.$disconnect();
}

main().catch(console.error);
