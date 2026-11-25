import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, SITE_URL, type CategorySlug } from "@/lib/constants";
import { categoryMeta } from "@/lib/page-meta";
import { ProductCard } from "@/components/ProductCard";
import { ShopCTA } from "@/components/ShopCTA";
import { Breadcrumb } from "@/components/Breadcrumb";
import { CategoryIcon } from "@/lib/category-icons";

export const revalidate = 21600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return categoryMeta(slug as CategorySlug) ?? {};
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = CATEGORIES[slug as CategorySlug];
  if (!cat) notFound();

  const products = await prisma.product.findMany({
    where: { category: slug },
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
  });

  // ページに並んでいる商品をそのまま ItemList にする。並び順は表示順で、
  // おすすめ順位ではないので rating や順位の意味は持たせない。
  const itemListJsonLd =
    products.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: cat.label,
          numberOfItems: products.length,
          itemListElement: products.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `${SITE_URL}/product/${p.id}`,
            name: p.name,
          })),
        }
      : null;

  return (
    <main className="flex-1">
      {itemListJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd).replace(/</g, "\\u003c") }} />
      )}
      <section className="bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          {/* 他のページ種別には入っているのに、ここだけ無かった。
              パンくずの構造化データもこのコンポーネントが出す。 */}
          <Breadcrumb items={[{ label: cat.label }]} />
          <CategoryIcon slug={slug} className="w-8 h-8 text-[#2d6a4f] mb-2" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{cat.label}</h1>
          <p className="mt-2 text-sm text-gray-600">{cat.description}</p>

          {/*
            だしのカテゴリだけ、絵を1枚添える。
            **カテゴリごとの絵は用意していない。** 中身と合わない絵を
            全カテゴリに付けると、かえって分かりにくくなるため、
            絵がある「だし」だけに出す。ファーストビューに近いが、
            見出しより下なので lazy のままでよい。
          */}
          {slug === "dashi" && (
            <Image
              src="/images/dashi.webp"
              alt="鍋に昆布を入れてだしを取っている台所の様子"
              width={1200}
              height={900}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, 640px"
              className="mt-5 h-40 w-full rounded-xl object-cover sm:h-52"
            />
          )}
          <div className="mt-4">
            <ShopCTA keyword={cat.label} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-400 text-sm">このカテゴリの商品は準備中です</p>
            <div className="mt-4">
              <ShopCTA keyword={`${cat.label} 昆布`} />
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
