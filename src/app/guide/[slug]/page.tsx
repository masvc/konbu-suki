import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { GUIDES, type GuideSlug } from "@/lib/guides";
import { guideMeta } from "@/lib/page-meta";
import { KombuBoxBanner } from "@/components/kombu-box/KombuBoxBanner";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { GuideHero } from "@/components/guide/GuideHero";
import { GuideHeader } from "@/components/guide/GuideHeader";
import { GuideToc } from "@/components/guide/GuideToc";
import { GuideSections } from "@/components/guide/GuideSections";
import { GuideShopBox } from "@/components/guide/GuideShopBox";
import { GuideFaq } from "@/components/guide/GuideFaq";
import { GuideReferences } from "@/components/guide/GuideReferences";
import { GuideRelated } from "@/components/guide/GuideRelated";
import { collectReferences } from "@/lib/guide-references";
import { getRelatedGuides } from "@/lib/guide-related";
import { buildArticleJsonLd, buildFaqJsonLd, buildRecipeJsonLd } from "@/lib/guide-jsonld";

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug as GuideSlug];
  const meta = guideMeta(slug as GuideSlug);
  if (!guide || !meta) return {};
  // OGP画像は記事のアイキャッチから作った 1200x630（scripts/generate-og-images.ts）。
  // 指定しないとサイト共通の画像が出て、どの記事を共有しても同じ絵になる。
  const ogImage = `${SITE_URL}/og/${slug}.webp`;
  return {
    ...meta,
    openGraph: {
      type: "article",
      title: guide.title,
      description: guide.description,
      url: `${SITE_URL}/guide/${slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: guide.imageAlt || guide.title }],
      publishedTime: guide.datePublished,
      modifiedTime: guide.dateModified,
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
      images: [ogImage],
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES[slug as GuideSlug];
  if (!guide) notFound();

  // 参考文献は本文の「出典:」行から集める。記事ごとに一覧を別に持たせると、
  // 本文を直したときに片方だけ古くなる。
  const references = collectReferences(guide.sections);
  const faqJsonLd = buildFaqJsonLd(guide);
  const recipeJsonLd = buildRecipeJsonLd(guide);

  return (
    <main className="flex-1">
      <JsonLd data={buildArticleJsonLd(guide)} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}
      {recipeJsonLd && <JsonLd data={recipeJsonLd} />}

      <GuideHero src={guide.image} alt={guide.imageAlt || guide.title} />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "昆布ガイド", href: "/guide" }, { label: guide.title }]} />
        <GuideHeader guide={guide} />
        <GuideToc sections={guide.sections} />
        <GuideSections sections={guide.sections} />
        <GuideShopBox keyword={guide.searchKeyword} />
        <GuideFaq items={guide.faq} />
        <GuideReferences references={references} />
        <GuideRelated entries={getRelatedGuides(slug, guide)} />
      </article>

      <KombuBoxBanner />
    </main>
  );
}
