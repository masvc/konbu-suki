import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, CATEGORY_SLUGS, ORIGINS } from "@/lib/constants";
import { GUIDES } from "@/lib/guides";

export const dynamic = "force-dynamic";

/**
 * lastmod には実際の更新日を入れる。
 *
 * 以前は固定ページ・カテゴリ・産地の lastModified に `new Date()` を入れていた。
 * サイトマップは毎回その場で組み立てるので、取得のたびに「たった今更新された」と
 * 伝わる。実測すると2秒差で別の値が返っていた。lastmod が常に現在時刻だと、
 * 検索側はその値を当てにしなくなる。
 *
 * 中身が分かるものは実データから出す（記事は dateModified、商品一覧は商品の
 * updatedAt の最大値）。分からないものは lastModified を入れない。
 * lastmod は任意の項目なので、嘘の日付を入れるより省くほうがよい。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: { id: number; updatedAt: Date; category: string; subcategory: string | null }[] = [];
  try {
    products = await prisma.product.findMany({
      select: { id: true, updatedAt: true, category: true, subcategory: true },
    });
  } catch {
    // ビルド時にDBへ繋がらないことがある。商品ページは実行時に足される。
  }

  const newest = (list: { updatedAt: Date }[]): Date | undefined =>
    list.length === 0 ? undefined : new Date(Math.max(...list.map((p) => p.updatedAt.getTime())));

  const guideDates = Object.values(GUIDES).map((g) => new Date(g.dateModified));
  const newestGuide =
    guideDates.length > 0 ? new Date(Math.max(...guideDates.map((d) => d.getTime()))) : undefined;
  const newestProduct = newest(products);
  /** トップは記事と商品のどちらが動いても変わる */
  const newestAny = [newestGuide, newestProduct].filter(Boolean).length
    ? new Date(
        Math.max(...[newestGuide, newestProduct].filter(Boolean).map((d) => (d as Date).getTime()))
      )
    : undefined;

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: newestAny, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/guide`, lastModified: newestGuide, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/producers`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/kombu-box`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/about/editorial-policy`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/about/data`, changeFrequency: "monthly", priority: 0.4 },
  ];

  const categoryPages: MetadataRoute.Sitemap = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: newest(products.filter((p) => p.category === slug)),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const originPages: MetadataRoute.Sitemap = Object.keys(ORIGINS).map((slug) => ({
    url: `${SITE_URL}/origin/${slug}`,
    lastModified: newest(products.filter((p) => p.subcategory === slug)),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const productPages: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const guidePages: MetadataRoute.Sitemap = Object.entries(GUIDES).map(([slug, guide]) => ({
    url: `${SITE_URL}/guide/${slug}`,
    lastModified: new Date(guide.dateModified),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...originPages, ...guidePages, ...productPages];
}
