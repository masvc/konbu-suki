import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { GUIDES } from "@/lib/guides";
import { CATEGORIES, CATEGORY_SLUGS, ORIGINS } from "@/lib/constants";
import { ProductCard } from "@/components/ProductCard";
import { ShopCTA } from "@/components/ShopCTA";
import { KOMBU_BOX } from "@/lib/kombu-box";
import { CategoryIcon } from "@/lib/category-icons";
import { MapPin, Droplets } from "lucide-react";
import { FaqAccordion } from "@/components/FaqAccordion";
import { JsonLd } from "@/components/JsonLd";

// トップにも canonical を置く。layout から外したので、書かないとどのページにも
// canonical が出なくなる。
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export const revalidate = 21600;

export default async function Home() {
  // 記事はここにベタ書きしない。以前3本を手で書いていて、タイトルが古いまま
  // 残っていた。とくに「昆布の栄養成分と期待される効果」は、効能を匂わせる
  // 表現として記事側では消したのに、トップだけ残っていた。
  // トップは唯一インデックスされているページなので、そこに古い文言が出ていた。
  //
  // 件数を3→6に増やしてある。記事はトップから2階層目（/guide 経由）にしか
  // 無く、クロールされていなかった。トップから直接辿れる記事を増やす。
  const latestGuides = Object.entries(GUIDES)
    .sort(([, a], [, b]) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime())
    .slice(0, 6);
  const guideCount = Object.keys(GUIDES).length;

  const [totalProducts, featuredProducts, categories, recentProducts] = await Promise.all([
    prisma.product.count(),
    // snackカテゴリを優先表示
    prisma.product.findMany({ where: { isFeatured: true, category: "snack" }, take: 4, orderBy: { createdAt: "desc" } })
      .then(async (snacks) => {
        if (snacks.length >= 8) return snacks.slice(0, 8);
        const others = await prisma.product.findMany({
          where: { isFeatured: true, category: { not: "snack" } },
          take: 8 - snacks.length,
          orderBy: { createdAt: "desc" },
        });
        return [...snacks, ...others];
      }),
    prisma.product.groupBy({ by: ["category"], _count: { _all: true } }),
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 12 }),
  ]);

  const catCounts = Object.fromEntries(categories.map((c) => [c.category, c._count._all]));

  const FAQ_ITEMS = [
    { q: "こんぶ好きとは？", a: "日本全国の昆布商品を網羅的に集めたキュレーションサイトです。だし昆布から塩昆布、とろろ昆布まで、Amazon・楽天で買える昆布商品を比較できます。" },
    { q: "どんな昆布が買えますか？", a: "利尻昆布、羅臼昆布、日高昆布、真昆布など北海道産の高級だし昆布から、塩昆布、とろろ昆布、昆布茶、昆布のおやつまで幅広く取り扱っています。" },
    { q: "こんぶBOXとは？", a: "全国の厳選昆布商品を詰め合わせた定期便です。毎月届く昆布の宝箱。生産者こだわりの昆布を新発見できます。" },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })),
  };

  return (
    <main className="flex-1">
      <JsonLd data={faqJsonLd} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#1b4332]">
        <div className="absolute inset-0">
          <Image src="/hero-kombu-snack.webp" alt="おしゃぶり昆布と昆布おやつの詰め合わせ" fill className="object-cover opacity-40 scale-110" priority sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#1b4332]/40 to-[#2d6a4f]/50" />
        </div>
        <svg className="absolute bottom-0 left-0 right-0 text-white/5" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: "80px", width: "100%" }}>
          <path d="M0,60 C360,120 720,0 1080,60 C1260,90 1380,30 1440,60 L1440,120 L0,120 Z" fill="currentColor" />
        </svg>
        <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="py-10 sm:py-14 lg:py-16">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
              噛むほど旨い、
              <br className="sm:hidden" />
              昆布のおやつ。
            </h1>
            <p className="mt-4 text-[#b7e4c7] text-sm sm:text-base max-w-md mx-auto">
              おしゃぶり昆布・都こんぶ・酢昆布から、だし昆布・塩昆布まで。
              <br className="hidden sm:inline" />
              {totalProducts.toLocaleString()}件の昆布商品を比較できます。
            </p>

            {/* 検索バー */}
            <div className="mt-8 max-w-2xl mx-auto">
              <form action="/search" method="get" className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  name="q"
                  placeholder="昆布を検索 (例: おしゃぶり昆布、都こんぶ)"
                  className="flex-1 rounded-xl border-0 bg-white/95 px-4 py-3 sm:py-3.5 text-sm text-gray-900 shadow-lg placeholder:text-gray-400 focus:ring-2 focus:ring-[#52b788] outline-none"
                />
                <button type="submit" className="rounded-xl bg-[#52b788] px-6 py-3 sm:py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#40916c] transition">
                  検索
                </button>
              </form>
            </div>

            {/* クイックリンク */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {["おしゃぶり昆布", "都こんぶ", "酢昆布", "塩昆布", "利尻昆布", "とろろ昆布"].map((kw) => (
                <Link
                  key={kw}
                  href={`/search?q=${encodeURIComponent(kw)}`}
                  className="rounded-full bg-white/15 border border-white/20 px-3 py-1.5 text-xs text-white/90 hover:bg-white/25 transition"
                >
                  {kw}
                </Link>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-10 flex justify-center gap-10 text-sm text-[#b7e4c7]">
              <div>
                <span className="block text-2xl font-bold text-white">{totalProducts.toLocaleString()}</span>
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
          </div>
        </div>
      </section>

      {/* カテゴリ タブナビ */}
      <section className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2.5">
            {CATEGORY_SLUGS.map((slug) => {
              const meta = CATEGORIES[slug];
              const count = catCounts[slug];
              return (
                <Link
                  key={slug}
                  href={`/category/${slug}`}
                  className="shrink-0 flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3.5 py-1.5 text-xs font-medium text-gray-700 hover:border-[#52b788] hover:bg-[#d8f3dc] hover:text-[#1b4332] transition"
                >
                  <CategoryIcon slug={slug} className="w-3.5 h-3.5" />
                  <span>{meta.label}</span>
                  {count !== undefined && <span className="text-gray-400">({count})</span>}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* おすすめ昆布 - カード型グリッド */}
      {featuredProducts.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-[#52b788] tracking-widest mb-1">FEATURED</p>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">おすすめの昆布</h2>
              </div>
              <Link href="/search?sort=rating" className="text-xs text-[#40916c] font-medium hover:underline">
                もっと見る →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {featuredProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* こんぶBOX導線 */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <Link href="/kombu-box" className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
            <div>
              <p className="text-xs font-semibold text-green-300 tracking-widest">KOMBU BOX</p>
              <p className="text-lg font-bold mt-1">昆布おやつのシークレットBOX</p>
              <p className="text-sm text-green-100 mt-1">{KOMBU_BOX.worthLabel}を詰め合わせ。{KOMBU_BOX.limitLabel} {KOMBU_BOX.price.toLocaleString()}円</p>
            </div>
            <span className="shrink-0 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-green-800 hover:bg-green-50 transition">
              詳しく見る
            </span>
          </Link>
        </div>
      </section>

      {/* 産地から探す */}
      <section className="bg-[#f8faf8] border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <div className="mb-6">
            <p className="text-[10px] font-bold text-[#52b788] tracking-widest mb-1">ORIGINS</p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">産地から探す</h2>
            <p className="text-xs text-gray-500 mt-1">北海道を中心とした昆布の産地と特徴</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {(Object.entries(ORIGINS) as [string, { label: string; area: string; description: string }][]).map(([slug, info]) => (
              <Link
                key={slug}
                href={`/origin/${slug}`}
                className="group rounded-xl border border-gray-100 bg-white hover:border-[#52b788] hover:shadow-md p-4 transition-all"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-8 h-8 rounded-full bg-[#d8f3dc] flex items-center justify-center"><MapPin className="w-4 h-4 text-[#2d6a4f]" /></span>
                  <div>
                    <h3 className="font-bold text-gray-900 group-hover:text-[#2d6a4f] transition text-sm">{info.label}</h3>
                    <p className="text-[10px] text-[#52b788]">{info.area}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{info.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* こんぶBOXバナー - D2C導線 */}
      <section className="border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
          <Link
            href="/kombu-box"
            className="group block rounded-2xl overflow-hidden bg-gradient-to-r from-[#1b4332] to-[#2d6a4f] p-6 sm:p-8 text-white hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold text-[#b7e4c7] tracking-widest mb-1">D2C SUBSCRIPTION</p>
                <p className="text-lg sm:text-xl font-bold">こんぶBOX</p>
                <p className="text-sm text-[#b7e4c7] mt-1">全国の厳選昆布を毎月お届け。中身は届いてからのお楽しみ。</p>
              </div>
              <span className="shrink-0 rounded-full bg-white/20 px-5 py-2.5 text-sm font-bold group-hover:bg-white/30 transition">
                詳しく見る →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* 新着商品 */}
      {recentProducts.length > 0 && (
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold text-[#52b788] tracking-widest mb-1">NEW ARRIVALS</p>
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">新着の昆布商品</h2>
              </div>
              <Link href="/search" className="text-xs text-[#40916c] font-medium hover:underline">
                すべて見る →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 購入CTA */}
      <section className="bg-[#f8faf8] border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <div className="rounded-xl border border-[#b7e4c7] bg-white p-5 sm:p-6">
            <p className="text-sm font-bold text-gray-900 mb-1">昆布を購入する</p>
            <p className="text-xs text-gray-500 mb-4">Amazon・楽天で昆布を横断検索</p>
            <ShopCTA keyword="昆布" amazonLabel="Amazonで昆布を探す" rakutenLabel="楽天で昆布を探す" />
          </div>
        </div>
      </section>

      {/* 昆布ガイド */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <div className="mb-6">
            <p className="text-[10px] font-bold text-[#52b788] tracking-widest mb-1">GUIDE</p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">昆布ガイド</h2>
            <p className="mt-1 text-xs text-gray-500">更新の新しい順</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {latestGuides.map(([slug, g]) => (
              <Link
                key={slug}
                href={`/guide/${slug}`}
                className="group flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-4 hover:border-[#52b788] hover:shadow-md transition-all"
              >
                <span className="w-8 h-8 rounded-lg bg-[#d8f3dc] flex items-center justify-center shrink-0"><Droplets className="w-4 h-4 text-[#2d6a4f]" /></span>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 group-hover:text-[#2d6a4f] transition leading-snug">{g.title}</p>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed line-clamp-2">{g.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Link href="/guide" className="text-xs text-[#2d6a4f] underline">
              昆布ガイドをすべて見る（{guideCount}記事）
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#f8faf8] border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold text-[#52b788] tracking-widest mb-1">FAQ</p>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">よくある質問</h2>
          </div>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>
    </main>
  );
}
