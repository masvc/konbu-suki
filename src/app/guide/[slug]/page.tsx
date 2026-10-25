import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { GUIDES, type GuideSlug } from "@/lib/guides";
import { ShopCTA } from "@/components/ShopCTA";

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
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    datePublished: "2026-10-25",
    dateModified: "2026-10-25",
  };

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      <article className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <nav className="text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-[#52b788]">{SITE_NAME}</Link>
          <span className="mx-1.5">/</span>
          <Link href="/guide" className="hover:text-[#52b788]">昆布ガイド</Link>
          <span className="mx-1.5">/</span>
          <span className="text-gray-600">{guide.title}</span>
        </nav>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{guide.title}</h1>
        <p className="text-sm text-gray-500 mb-8">{guide.description}</p>

        <div className="prose prose-sm prose-gray max-w-none">
          {guide.sections.map((section, i) => (
            <section key={i} className="mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3 border-l-4 border-[#52b788] pl-3">{section.heading}</h2>
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{section.body}</div>
            </section>
          ))}
        </div>

        {guide.searchKeyword && (
          <div className="mt-8 rounded-xl border border-[#b7e4c7] bg-[#f8faf8] p-5">
            <p className="text-sm font-bold text-gray-900 mb-3">関連商品を探す</p>
            <ShopCTA keyword={guide.searchKeyword} />
          </div>
        )}

        {guide.faq && guide.faq.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-4">よくある質問</h2>
            <dl className="space-y-2">
              {guide.faq.map((item, i) => (
                <div key={i} className="rounded-lg border border-gray-100 bg-white p-4">
                  <dt className="text-sm font-bold text-gray-900 mb-1">Q. {item.q}</dt>
                  <dd className="text-xs text-gray-600 leading-relaxed">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </article>
    </main>
  );
}
