import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { GUIDES, type GuideSlug } from "@/lib/guides";
import { ShopCTA } from "@/components/ShopCTA";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES[slug as GuideSlug];
  if (!guide) return {};
  return {
    title: `${guide.title} | ${SITE_NAME}`,
    description: guide.description,
    openGraph: { title: guide.title, description: guide.description },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES[slug as GuideSlug];
  if (!guide) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "昆布ガイド", item: `${SITE_URL}/guide` },
      { "@type": "ListItem", position: 3, name: guide.title },
    ],
  };

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
            alt={guide.title}
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

        {/* 他のガイドへの導線 */}
        <section className="mt-10 pt-8 border-t border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-4">他の昆布ガイド</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(GUIDES)
              .filter(([s]) => s !== slug)
              .slice(0, 4)
              .map(([s, g]) => (
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
