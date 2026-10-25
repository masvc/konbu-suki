import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_URL, CATEGORY_SLUGS, ORIGINS } from "@/lib/constants";
import { GUIDES } from "@/lib/guides";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await prisma.product.findMany({ select: { id: true, updatedAt: true } });

  const staticPages = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${SITE_URL}/guide`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/producers`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${SITE_URL}/kombu-box`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.5 },
  ];

  const categoryPages = CATEGORY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/category/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const originPages = Object.keys(ORIGINS).map((slug) => ({
    url: `${SITE_URL}/origin/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const productPages = products.map((p) => ({
    url: `${SITE_URL}/product/${p.id}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  const guidePages = Object.entries(GUIDES).map(([slug, guide]) => ({
    url: `${SITE_URL}/guide/${slug}`,
    lastModified: new Date(guide.dateModified),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages, ...originPages, ...guidePages, ...productPages];
}
