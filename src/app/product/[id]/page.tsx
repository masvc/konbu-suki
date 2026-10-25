import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, type CategorySlug, SITE_NAME } from "@/lib/constants";
import { amazonProductUrl, amazonSearchUrl, rakutenProductUrl, rakutenSearchUrl } from "@/lib/affiliates";
import { ShopCTA } from "@/components/ShopCTA";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 21600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) return {};
  return {
    title: `${product.name} | ${SITE_NAME}`,
    description: product.description || `${product.brand}の${product.name}。${CATEGORIES[product.category as CategorySlug]?.label || "昆布"}商品。`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    include: { reviews: { orderBy: { createdAt: "desc" }, take: 10 } },
  });
  if (!product) notFound();

  const cat = CATEGORIES[product.category as CategorySlug];

  // 同カテゴリの関連商品
  const related = await prisma.product.findMany({
    where: { category: product.category, id: { not: product.id } },
    take: 4,
    orderBy: { rating: "desc" },
  });

  const amazonLink = product.amazonAsin
    ? amazonProductUrl(product.amazonAsin)
    : amazonSearchUrl(product.name);
  const rakutenLink = product.rakutenId
    ? rakutenProductUrl(product.rakutenId)
    : rakutenSearchUrl(product.name);

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        {/* パンくず */}
        <nav className="text-xs text-gray-400 mb-6">
          <Link href="/" className="hover:text-green-600">トップ</Link>
          <span className="mx-1">/</span>
          {cat && (
            <>
              <Link href={`/category/${product.category}`} className="hover:text-green-600">{cat.label}</Link>
              <span className="mx-1">/</span>
            </>
          )}
          <span className="text-gray-600">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 画像 */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" />
            ) : (
              <div className="flex items-center justify-center h-full text-6xl text-gray-300">🫒</div>
            )}
          </div>

          {/* 商品情報 */}
          <div>
            {cat && (
              <p className="text-xs text-green-600 font-medium mb-2">{cat.emoji} {cat.label}</p>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-4">{product.brand}</p>

            {product.price && (
              <p className="text-2xl font-bold text-green-700 mb-4">&yen;{product.price.toLocaleString()}</p>
            )}

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-6">{product.description}</p>
            )}

            {/* スペック */}
            <dl className="grid grid-cols-2 gap-2 mb-6">
              {product.origin && (
                <>
                  <dt className="text-xs text-gray-400">産地</dt>
                  <dd className="text-xs font-medium text-gray-700">{product.origin}</dd>
                </>
              )}
              {product.weight && (
                <>
                  <dt className="text-xs text-gray-400">内容量</dt>
                  <dd className="text-xs font-medium text-gray-700">{product.weight}</dd>
                </>
              )}
              {product.rating && (
                <>
                  <dt className="text-xs text-gray-400">評価</dt>
                  <dd className="text-xs font-medium text-amber-600">{"★".repeat(Math.round(product.rating))} {product.rating.toFixed(1)}</dd>
                </>
              )}
              {product.tags && (
                <>
                  <dt className="text-xs text-gray-400">タグ</dt>
                  <dd className="text-xs">
                    {product.tags.split(",").map((tag) => (
                      <span key={tag} className="inline-block bg-green-50 text-green-700 rounded-full px-2 py-0.5 mr-1 mb-1">{tag.trim()}</span>
                    ))}
                  </dd>
                </>
              )}
            </dl>

            {/* 購入リンク */}
            <div className="space-y-2">
              <a
                href={amazonLink}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-6 py-3 text-sm font-medium text-white hover:bg-amber-600 transition w-full"
              >
                Amazonで購入する ↗
              </a>
              <a
                href={rakutenLink}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-3 text-sm font-medium text-white hover:bg-red-600 transition w-full"
              >
                楽天で購入する ↗
              </a>
            </div>
          </div>
        </div>

        {/* レビュー */}
        {product.reviews.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">レビュー</h2>
            <div className="space-y-3">
              {product.reviews.map((r) => (
                <div key={r.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-400 text-sm">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                    <span className="text-xs text-gray-400">{r.nickname}</span>
                  </div>
                  {r.title && <p className="text-sm font-bold text-gray-900 mb-1">{r.title}</p>}
                  {r.body && <p className="text-xs text-gray-600 leading-relaxed">{r.body}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 関連商品 */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-lg font-bold text-gray-900 mb-4">関連商品</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {related.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
