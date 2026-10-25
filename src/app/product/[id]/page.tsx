import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, type CategorySlug, SITE_NAME, SITE_URL } from "@/lib/constants";
import { amazonProductUrl, amazonSearchUrl, rakutenProductUrl, rakutenSearchUrl } from "@/lib/affiliates";
import { ProductCard } from "@/components/ProductCard";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { getTasteProfile, getUsageSuggestions, getPairings, getRecommendedFor, getNutritionFacts, getTextureAndFlavorTags } from "@/lib/product-seo";

export const revalidate = 21600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id: Number(id) } });
  if (!product) return {};
  const cat = CATEGORIES[product.category as CategorySlug];
  const desc = product.description
    || `${product.brand}の${product.name}。${cat?.label || "昆布"}。${product.origin ? `産地: ${product.origin}。` : ""}味わい・使い方・合う料理を詳しく解説。`;
  return {
    title: `${product.name} | ${cat?.label || "昆布"} | ${SITE_NAME}`,
    description: desc,
    openGraph: {
      title: `${product.name} | ${SITE_NAME}`,
      description: desc,
      images: product.imageUrl ? [{ url: product.imageUrl }] : undefined,
    },
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
  const tasteProfile = getTasteProfile(product);
  const usages = getUsageSuggestions(product);
  const pairings = getPairings(product);
  const recommendedFor = getRecommendedFor(product);
  const nutrition = getNutritionFacts(product.category);
  const textureTags = getTextureAndFlavorTags(product);

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

  // Product構造化データ
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description || `${product.brand}の${product.name}`,
    image: product.imageUrl || undefined,
  };


  return (
    <main className="flex-1">
      <JsonLd data={productJsonLd} />

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Breadcrumb items={[
          ...(cat ? [{ label: cat.label, href: `/category/${product.category}` }] : []),
          { label: product.name },
        ]} />

        {/* メインコンテンツ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 画像 */}
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
            {product.imageUrl ? (
              <Image src={product.imageUrl} alt={product.name} fill className="object-contain p-4" sizes="(max-width: 768px) 100vw, 50vw" priority />
            ) : (
              <Image src="/no-image.webp" alt="画像なし" fill className="object-contain p-8" sizes="(max-width: 768px) 100vw, 50vw" />
            )}
          </div>

          {/* 商品情報 */}
          <div>
            {cat && (
              <Link href={`/category/${product.category}`} className="inline-block text-xs text-[#52b788] font-medium mb-2 hover:underline">
                {cat.label}
              </Link>
            )}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{product.name}</h1>
            <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
            {product.origin && (
              <p className="text-xs text-[#52b788] mb-3">産地: {product.origin}</p>
            )}

            {product.price && (
              <div className="mb-4">
                <p className="text-2xl font-bold text-[#2d6a4f]">&yen;{product.price.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {(product.priceFetchedAt || product.updatedAt).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}時点の価格。最新価格は販売サイトでご確認ください
                </p>
              </div>
            )}

            {product.description && (
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{product.description}</p>
            )}

            {/* スペック */}
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-xs">
              {product.origin && <><dt className="text-gray-400">産地</dt><dd className="font-medium text-gray-700">{product.origin}</dd></>}
              {product.weight && <><dt className="text-gray-400">内容量</dt><dd className="font-medium text-gray-700">{product.weight}</dd></>}
              {cat && <><dt className="text-gray-400">カテゴリ</dt><dd className="font-medium text-gray-700">{cat.label}</dd></>}
              {product.rating && <><dt className="text-gray-400">評価</dt><dd className="font-medium text-amber-600">{"★".repeat(Math.round(product.rating))} {product.rating.toFixed(1)}</dd></>}
            </dl>

            {/* タグ */}
            {product.tags && (
              <div className="flex flex-wrap gap-1 mb-5">
                {product.tags.split(",").map((tag) => (
                  <Link key={tag} href={`/search?q=${encodeURIComponent(tag.trim())}`} className="inline-block bg-[#d8f3dc] text-[#1b4332] rounded-full px-2.5 py-0.5 text-[10px] font-medium hover:bg-[#b7e4c7] transition">
                    {tag.trim()}
                  </Link>
                ))}
              </div>
            )}

            {/* 食感・味わいタグ */}
            {textureTags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {textureTags.map((tag) => (
                  <span key={tag} className="rounded-full border border-[#d4a373] bg-[#fdf8f0] px-2.5 py-1 text-[10px] font-medium text-[#8b6914]">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 購入リンク（GA4イベント計測付き） */}
            <div className="space-y-2">
              <a href={amazonLink} target="_blank" rel="noopener noreferrer nofollow"
                data-ga-event="amazon_click" data-ga-product={product.name} data-ga-product-id={String(product.id)}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#ff9900] px-6 py-3 text-sm font-medium text-white hover:bg-[#e68a00] transition w-full shadow-sm">
                Amazonで購入する
              </a>
              <a href={rakutenLink} target="_blank" rel="noopener noreferrer nofollow"
                data-ga-event="rakuten_click" data-ga-product={product.name} data-ga-product-id={String(product.id)}
                className="flex items-center justify-center gap-2 rounded-lg bg-[#bf0000] px-6 py-3 text-sm font-medium text-white hover:bg-[#a00000] transition w-full shadow-sm">
                楽天で購入する
              </a>
            </div>
          </div>
        </div>

        {/* === SEO/AIO強化セクション === */}

        {/* 味わいプロファイル */}
        <section className="mt-10 rounded-xl border border-gray-100 bg-[#f8faf8] p-5 sm:p-6">
          <h2 className="text-base font-bold text-gray-900 mb-1">味わいプロファイル</h2>
          <p className="text-[10px] text-gray-400 mb-4">※ カテゴリの一般的な傾向です。個々の商品で異なる場合があります。</p>
          <div className="space-y-2.5">
            {tasteProfile.map((t) => (
              <div key={t.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-12 shrink-0">{t.label}</span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-[#52b788] rounded-full transition-all" style={{ width: `${t.value * 20}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-6 text-right">{t.value}/5</span>
              </div>
            ))}
          </div>
        </section>

        {/* おすすめの使い方 */}
        <section className="mt-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">おすすめの使い方</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {usages.map((u) => (
              <li key={u} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
                {u}
              </li>
            ))}
          </ul>
        </section>

        {/* 合う料理・ペアリング */}
        <section className="mt-6">
          <h2 className="text-base font-bold text-gray-900 mb-3">合う料理・ペアリング</h2>
          <div className="flex flex-wrap gap-2">
            {pairings.map((p) => (
              <Link key={p} href={`/search?q=${encodeURIComponent(p)}`}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:border-[#52b788] hover:text-[#2d6a4f] transition">
                {p}
              </Link>
            ))}
          </div>
        </section>

        {/* こんな人におすすめ */}
        {recommendedFor.length > 0 && (
          <section className="mt-6">
            <h2 className="text-base font-bold text-gray-900 mb-3">こんな人におすすめ</h2>
            <ul className="space-y-1.5">
              {recommendedFor.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-[#d4a373] mt-0.5 shrink-0">&#9654;</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 栄養情報 */}
        {nutrition && (
          <section className="mt-6 rounded-xl border border-gray-100 bg-white p-5">
            <h2 className="text-base font-bold text-gray-900 mb-3">昆布の栄養成分</h2>
            <dl className="space-y-2">
              {nutrition.map((n) => (
                <div key={n.label} className="flex items-start gap-3">
                  <dt className="text-xs font-bold text-[#2d6a4f] bg-[#d8f3dc] rounded px-2 py-0.5 shrink-0">{n.label}</dt>
                  <dd className="text-xs text-gray-600">{n.desc}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {/* レビュー */}
        {product.reviews.length > 0 && (
          <section className="mt-10">
            <h2 className="text-base font-bold text-gray-900 mb-4">レビュー</h2>
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
          <section className="mt-10">
            <h2 className="text-base font-bold text-gray-900 mb-4">関連商品</h2>
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
