import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ORIGINS, type OriginSlug, SITE_NAME } from "@/lib/constants";
import { ProductCard } from "@/components/ProductCard";
import { ShopCTA } from "@/components/ShopCTA";

export const revalidate = 21600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const origin = ORIGINS[slug as OriginSlug];
  if (!origin) return {};
  return {
    title: `${origin.label} | ${SITE_NAME}`,
    description: `${origin.area}産の${origin.label}。${origin.description}`,
  };
}

export default async function OriginPage({ params }: Props) {
  const { slug } = await params;
  const origin = ORIGINS[slug as OriginSlug];
  if (!origin) notFound();

  const products = await prisma.product.findMany({
    where: { subcategory: slug },
    orderBy: [{ isFeatured: "desc" }, { rating: "desc" }],
  });

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{origin.label}</h1>
          <p className="text-sm text-green-600 mt-1">{origin.area}</p>
          <p className="mt-2 text-sm text-gray-600">{origin.description}</p>
          <div className="mt-4">
            <ShopCTA keyword={origin.label} />
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
