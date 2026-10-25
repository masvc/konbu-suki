import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, CATEGORY_SLUGS, ORIGINS, SITE_NAME } from "@/lib/constants";
import { ProductCard } from "@/components/ProductCard";
import { ShopCTA } from "@/components/ShopCTA";

export const revalidate = 21600; // 6h ISR

export default async function Home() {
  const [totalProducts, featuredProducts, categories, recentProducts] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({ where: { isFeatured: true }, take: 8, orderBy: { createdAt: "desc" } }),
    prisma.product.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 8 }),
  ]);

  const catCounts = Object.fromEntries(categories.map((c) => [c.category, c._count._all]));

  const FAQ_ITEMS = [
    { q: "こんぶ好きとは？", a: "日本全国の昆布商品を網羅的に集めたキュレーションサイトです。だし昆布から塩昆布、とろろ昆布まで、Amazon・楽天で買える昆布商品を比較できます。" },
    { q: "どんな昆布が買えますか？", a: "利尻昆布、羅臼昆布、日高昆布、真昆布など北海道産の高級だし昆布から、塩昆布、とろろ昆布、昆布茶、昆布のおやつまで幅広く取り扱っています。" },
    { q: "こんぶBOXとは？", a: "全国の厳選昆布商品を詰め合わせた定期便です。毎月届く昆布の宝箱。生産者こだわりの昆布を新発見できます。" },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question", name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <main className="flex-1">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-700">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <div className="py-12 sm:py-16 lg:py-24 max-w-2xl">
            <p className="text-xs sm:text-sm font-medium text-green-300 tracking-wider mb-3">
              {SITE_NAME} - 昆布専門キュレーションサイト
            </p>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              日本の昆布を、
              <br />
              もっと好きになる。
            </h1>
            <p className="mt-4 sm:mt-6 text-green-100 text-sm sm:text-base leading-relaxed max-w-lg">
              利尻・羅臼・日高・真昆布。北海道から届く旨みの宝庫。
              {totalProducts > 0 && `${totalProducts}点の昆布商品を網羅的に比較。`}
              だし昆布から塩昆布、とろろ昆布、昆布茶まで。
            </p>
            <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
              <Link
                href="#categories"
                className="inline-flex items-center rounded-lg bg-green-500 px-6 py-3 text-sm font-medium text-white hover:bg-green-400 transition"
              >
                昆布を探す
              </Link>
              <Link
                href="/kombu-box"
                className="inline-flex items-center rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition"
              >
                こんぶBOX
              </Link>
              <Link
                href="/guide"
                className="inline-flex items-center rounded-lg border border-green-400/40 bg-green-500/10 px-6 py-3 text-sm font-medium text-green-200 hover:bg-green-500/20 transition"
              >
                昆布ガイド
              </Link>
            </div>
            {totalProducts > 0 && (
              <div className="mt-8 sm:mt-12 flex gap-10 text-sm text-green-200">
                <div>
                  <span className="block text-2xl font-bold text-white">{totalProducts}</span>
                  昆布商品
                </div>
                <div>
                  <span className="block text-2xl font-bold text-white">{CATEGORY_SLUGS.length}</span>
                  カテゴリ
                </div>
                <div>
                  <span className="block text-2xl font-bold text-white">{Object.keys(ORIGINS).length}</span>
                  産地
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* おすすめ昆布 */}
      {featuredProducts.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-green-600 tracking-widest mb-2">FEATURED</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">おすすめの昆布</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* カテゴリ一覧 */}
      <section id="categories" className="bg-gray-50 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-green-600 tracking-widest mb-2">CATEGORIES</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">カテゴリから探す</h2>
            <p className="mt-2 text-sm text-gray-500">昆布の種類・用途別にカテゴリ分けしています</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {CATEGORY_SLUGS.map((slug) => {
              const meta = CATEGORIES[slug];
              const count = catCounts[slug];
              return (
                <Link
                  key={slug}
                  href={`/category/${slug}`}
                  className="group rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-md p-4 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{meta.emoji}</span>
                    {count !== undefined && (
                      <span className="text-[10px] text-gray-400 bg-gray-50 rounded-full px-2 py-0.5">{count}</span>
                    )}
                  </div>
                  <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition text-sm mb-1">
                    {meta.label}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{meta.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 産地別 */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-green-600 tracking-widest mb-2">ORIGINS</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">産地から探す</h2>
            <p className="mt-2 text-sm text-gray-500">日本各地の昆布産地と特徴</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(Object.entries(ORIGINS) as [string, { label: string; area: string; description: string }][]).map(([slug, info]) => (
              <Link
                key={slug}
                href={`/origin/${slug}`}
                className="group rounded-2xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-md p-4 transition-all"
              >
                <h3 className="font-bold text-gray-900 group-hover:text-green-700 transition text-sm mb-1">{info.label}</h3>
                <p className="text-[10px] text-green-600 mb-1">{info.area}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{info.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* こんぶBOXバナー */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <Link
            href="/kombu-box"
            className="block rounded-xl bg-gradient-to-r from-green-700 to-green-600 p-5 sm:p-6 text-white hover:from-green-800 hover:to-green-700 transition-all shadow-sm"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg sm:text-xl font-bold">こんぶBOX</p>
                <p className="text-sm text-green-100 mt-1">全国の厳選昆布を詰め合わせた、昆布のフォーチュンボックス。毎月届く昆布の宝箱。</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/20 px-4 py-2 text-sm font-bold">
                詳しく見る →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 昆布を購入する */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 sm:p-6">
            <p className="text-sm font-bold text-gray-900 mb-1">昆布を購入する</p>
            <p className="text-xs text-gray-500 mb-4">Amazon・楽天で昆布を探す</p>
            <ShopCTA keyword="昆布" amazonLabel="Amazonで昆布を探す" rakutenLabel="楽天で昆布を探す" />
          </div>
        </div>
      </section>

      {/* 最新追加商品 */}
      {recentProducts.length > 0 && (
        <section className="bg-gray-50 border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-green-600 tracking-widest mb-2">NEW</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">最近追加された昆布</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 昆布の豆知識 */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-green-600 tracking-widest mb-2">KNOWLEDGE</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">昆布の豆知識</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "昆布だしの取り方", desc: "水出し・煮出しの基本からプロの技まで。昆布だしの取り方完全ガイド。", href: "/guide/how-to-make-dashi" },
              { title: "昆布の種類と選び方", desc: "利尻・羅臼・日高・真昆布の違いと、料理別のおすすめ昆布。", href: "/guide/kombu-types" },
              { title: "昆布の栄養と健康効果", desc: "食物繊維・ミネラル・フコイダン。昆布の驚くべき栄養価と健康効果。", href: "/guide/kombu-nutrition" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group rounded-xl border border-gray-100 bg-white p-5 hover:border-green-300 hover:shadow-md transition-all"
              >
                <p className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition">{item.title}</p>
                <p className="mt-2 text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <p className="text-xs font-semibold text-green-600 tracking-widest mb-2">FAQ</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">よくある質問</h2>
          </div>
          <dl className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white overflow-hidden">
                <details className="group">
                  <summary className="w-full flex items-start justify-between gap-4 px-5 py-4 text-left hover:bg-gray-50 transition cursor-pointer list-none">
                    <span className="flex items-start gap-3">
                      <span className="text-green-600 font-bold text-sm mt-0.5">Q.</span>
                      <span className="font-semibold text-gray-900 text-sm">{item.q}</span>
                    </span>
                    <svg className="w-4 h-4 text-gray-400 shrink-0 mt-1 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <dd className="px-5 pb-5 pl-12 text-sm text-gray-600 leading-relaxed">{item.a}</dd>
                </details>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </main>
  );
}
