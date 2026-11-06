import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { GUIDES, type GuideSlug } from "@/lib/guides";
import { guideMeta } from "@/lib/page-meta";
import { ShopCTA } from "@/components/ShopCTA";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";

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

  // 関連記事は guide.related から引く。未指定のときだけ先頭から埋める。
  // 全記事で先頭から埋めると、どの記事を開いても同じ4本が並ぶだけになり、
  // 記事が増えるほど内部リンクとして働かなくなる。
  const relatedEntries: [string, (typeof GUIDES)[string]][] = guide.related?.length
    ? guide.related
        .filter((s) => s !== slug && GUIDES[s as GuideSlug])
        .map((s) => [s, GUIDES[s as GuideSlug]])
    : Object.entries(GUIDES)
        .filter(([s]) => s !== slug)
        .slice(0, 4);

  // パンくずの構造化データは Breadcrumb コンポーネントが出している。
  // ここで作ると二重になるので持たない。

  const articleJsonLd = {
    "@context": "https://schema.org", "@type": "Article",
    headline: guide.title,
    description: guide.description,
    ...(guide.image ? { image: `${SITE_URL}${guide.image}` } : {}),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
  };

  // FAQ構造化データ
  const faqJsonLd = guide.faq && guide.faq.length > 0 ? {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: guide.faq.map(f => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  } : null;

  return (
    <main className="flex-1">
      <JsonLd data={articleJsonLd} />
      {faqJsonLd && <JsonLd data={faqJsonLd} />}

      {/* アイキャッチ */}
      {guide.image && (
        <div className="relative w-full h-48 sm:h-64 lg:h-80 bg-[#1b4332]">
          <Image
            src={guide.image}
            alt={guide.imageAlt || guide.title}
            fill
            className="object-cover opacity-80"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        </div>
      )}

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "昆布ガイド", href: "/guide" }, { label: guide.title }]} />

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{guide.title}</h1>
        <p className="text-sm text-gray-500 mb-6">{guide.description}</p>

        {/* 目次 */}
        {guide.sections.length > 2 && (
          <nav className="rounded-xl border border-gray-100 bg-[#f8faf8] p-4 mb-8">
            <p className="text-xs font-bold text-gray-700 mb-2">目次</p>
            <ol className="space-y-1.5">
              {guide.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#section-${i}`} className="text-xs text-[#2d6a4f] hover:underline">
                    {i + 1}. {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        {/* 本文 */}
        <div className="space-y-8">
          {guide.sections.map((section, i) => (
            <section key={i} id={`section-${i}`}>
              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 border-l-4 border-[#52b788] pl-3">{section.heading}</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{section.body}</div>
              {section.table && (
                <div className="mt-4 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    {section.table.caption && (
                      <caption className="mb-2 text-left text-xs text-gray-500">
                        {section.table.caption}
                      </caption>
                    )}
                    <thead>
                      <tr className="bg-[#f8faf8]">
                        {section.table.headers.map((h, hi) => (
                          <th
                            key={hi}
                            scope="col"
                            className="border border-[#b7e4c7] px-3 py-2 text-left font-bold text-gray-900 whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, ri) => (
                        <tr key={ri}>
                          {row.map((cell, ci) => (
                            <td key={ci} className="border border-[#d8f3dc] px-3 py-2 align-top text-gray-700">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* 関連商品CTA */}
        {guide.searchKeyword && (
          <div className="mt-10 rounded-xl border border-[#b7e4c7] bg-[#f8faf8] p-5">
            <p className="text-sm font-bold text-gray-900 mb-3">関連商品を探す</p>
            <ShopCTA keyword={guide.searchKeyword} />
          </div>
        )}

        {guide.faq && guide.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">よくある質問</h2>
            <FaqAccordion items={guide.faq} />
          </section>
        )}

        {/* 関連記事への導線 */}
        <section className="mt-10 pt-8 border-t border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">関連する昆布ガイド</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {relatedEntries.map(([s, g]) => (
                <Link key={s} href={`/guide/${s}`} className="group rounded-lg border border-gray-100 bg-white p-3 hover:border-[#52b788] transition">
                  <p className="text-xs font-bold text-gray-900 group-hover:text-[#2d6a4f] transition">{g.title}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{g.description}</p>
                </Link>
              ))}
          </div>
        </section>
      </article>
    </main>
  );
}
