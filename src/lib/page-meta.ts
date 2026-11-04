/**
 * ガイド・産地・カテゴリの meta title/description の組み立て。
 *
 * 各ページの generateMetadata と、scripts 側の点検スクリプトが同じ文面を
 * 見る必要がある。別々に組み立てると点検側が実際と違う文字列を検査して
 * しまい、産地の title に区切り文字が無いと誤検出する、といったことが起きる。
 * 組み立てはここだけに置く。
 */
import {
  CATEGORIES,
  ORIGINS,
  SITE_NAME,
  type CategorySlug,
  type OriginSlug,
} from "./constants";
import { GUIDES, type GuideSlug } from "./guides";

export type PageMeta = { title: string; description: string };

export function guideMeta(slug: GuideSlug): PageMeta | null {
  const guide = GUIDES[slug];
  if (!guide) return null;
  return { title: `${guide.title} | ${SITE_NAME}`, description: guide.description };
}

export function originMeta(slug: OriginSlug): PageMeta | null {
  const origin = ORIGINS[slug];
  if (!origin) return null;
  return {
    title: `${origin.label} | ${SITE_NAME}`,
    description: `${origin.area}産の${origin.label}。${origin.description} なぜ名産なのか、特徴と合う料理を解説。`,
  };
}

export function categoryMeta(slug: CategorySlug): PageMeta | null {
  const cat = CATEGORIES[slug];
  if (!cat) return null;
  return { title: `${cat.label} | ${SITE_NAME}`, description: cat.description };
}
