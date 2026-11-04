/**
 * サイト内のコンテンツページ一覧。
 *
 * 別プロジェクト由来のスクリプトは「特集(FEATURES)」という、このサイトに
 * 存在しない概念を参照していた。このサイトのコンテンツページは
 * ガイド・産地・カテゴリの3種類。
 *
 * title / description は src/lib/page-meta.ts から取る。ページの
 * generateMetadata と同じ関数なので、点検スクリプトは実際に配信される
 * 文面をそのまま検査できる（別々に組み立てると誤検出する）。
 *
 * src/lib 側の定義は Record（キーが slug）で、そのまま for...of できない。
 * 配列への変換はここだけに置く。
 */
import { GUIDES, type GuideSlug } from "../../src/lib/guides";
import {
  CATEGORIES,
  ORIGINS,
  type CategorySlug,
  type OriginSlug,
} from "../../src/lib/constants";
import { guideMeta, originMeta, categoryMeta } from "../../src/lib/page-meta";

export type ContentKind = "guide" | "origin" | "category";

export type ContentPage = {
  kind: ContentKind;
  slug: string;
  /** サイト内パス（先頭スラッシュ付き） */
  path: string;
  /** 実際に配信される meta title */
  title: string;
  /** 実際に配信される meta description */
  description: string;
  /** FAQ の件数。持たないページは 0 */
  faqCount: number;
};

export const GUIDE_PAGES: ContentPage[] = Object.entries(GUIDES).map(([slug, guide]) => {
  const meta = guideMeta(slug as GuideSlug);
  return {
    kind: "guide",
    slug,
    path: `/guide/${slug}`,
    title: meta?.title ?? "",
    description: meta?.description ?? "",
    faqCount: guide.faq?.length ?? 0,
  };
});

export const ORIGIN_PAGES: ContentPage[] = Object.keys(ORIGINS).map((slug) => {
  const meta = originMeta(slug as OriginSlug);
  return {
    kind: "origin",
    slug,
    path: `/origin/${slug}`,
    title: meta?.title ?? "",
    description: meta?.description ?? "",
    faqCount: 0,
  };
});

export const CATEGORY_PAGES: ContentPage[] = Object.keys(CATEGORIES).map((slug) => {
  const meta = categoryMeta(slug as CategorySlug);
  return {
    kind: "category",
    slug,
    path: `/category/${slug}`,
    title: meta?.title ?? "",
    description: meta?.description ?? "",
    faqCount: 0,
  };
});

/** ガイド・産地・カテゴリの全ページ */
export const CONTENT_PAGES: ContentPage[] = [
  ...GUIDE_PAGES,
  ...ORIGIN_PAGES,
  ...CATEGORY_PAGES,
];
