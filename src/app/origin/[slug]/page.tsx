import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ORIGINS, type OriginSlug, SITE_NAME } from "@/lib/constants";
import { ORIGIN_COLUMNS } from "@/lib/origin-columns";
import { ProductCard } from "@/components/ProductCard";
import { ShopCTA } from "@/components/ShopCTA";
import { Breadcrumb } from "@/components/Breadcrumb";

export const revalidate = 21600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const origin = ORIGINS[slug as OriginSlug];
  if (!origin) return {};
  return {
    title: `${origin.label} | ${SITE_NAME}`,
    description: `${origin.area}産の${origin.label}。${origin.description} なぜ名産なのか、特徴と合う料理を解説。`,
  };
}

export default async function OriginPage({ params }: Props) {
  const { slug } = await params;
  const origin = ORIGINS[slug as OriginSlug];
  if (!origin) notFound();

  const column = ORIGIN_COLUMNS[slug];

  const products = await prisma.product.findMany({
    where: { subcategory: slug },
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
  });

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-[#f8faf8] to-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          <Breadcrumb items={[{ label: origin.label }]} />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{origin.label}</h1>
          <p className="text-sm text-[#52b788] mt-1">{origin.area}</p>
          <p className="mt-2 text-sm text-gray-600">{origin.description}</p>
        </div>
      </section>

      {/* 産地コラム */}
      {column && (
        <section className="border-b border-gray-100">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
            <h2 className="text-base font-bold text-gray-900 mb-3">なぜ{origin.label}は名産なのか</h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">{column.why}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 bg-[#f8faf8] p-4">
                <h3 className="text-xs font-bold text-[#2d6a4f] mb-2">{origin.label}の特徴</h3>
                <ul className="space-y-1.5">
                  {column.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-xs text-gray-600">
                      <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-gray-100 bg-[#f8faf8] p-4">
                <h3 className="text-xs font-bold text-[#2d6a4f] mb-2">合う料理</h3>
                <div className="flex flex-wrap gap-1.5">
                  {column.bestFor.map((b) => (
                    <span key={b} className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700">{b}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* 出典 */}
            {column.sources && column.sources.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-500 mb-2">出典</h3>
                <ul className="space-y-1">
                  {column.sources.map((s) => (
                    <li key={s.url} className="text-xs text-gray-400">
                      <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-600">{s.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* 商品一覧 */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">{origin.label}の商品</h2>
          <ShopCTA keyword={origin.label} />
        </div>
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">この産地の商品は準備中です</p>
            <div className="mt-4">
              <ShopCTA keyword={origin.label} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
