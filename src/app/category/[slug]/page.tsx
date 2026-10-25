import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, type CategorySlug, SITE_NAME } from "@/lib/constants";
import { ProductCard } from "@/components/ProductCard";
import { ShopCTA } from "@/components/ShopCTA";
import { CategoryIcon } from "@/lib/category-icons";

export const revalidate = 21600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES[slug as CategorySlug];
  if (!cat) return {};
  return {
    title: `${cat.label} | ${SITE_NAME}`,
    description: cat.description,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const cat = CATEGORIES[slug as CategorySlug];
  if (!cat) notFound();

  const products = await prisma.product.findMany({
    where: { category: slug },
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <CategoryIcon slug={slug} className="w-8 h-8 text-[#2d6a4f] mb-2" />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{cat.label}</h1>
          <p className="mt-2 text-sm text-gray-600">{cat.description}</p>
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
