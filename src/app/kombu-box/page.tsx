import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";
import { SubscribeForm } from "@/components/SubscribeForm";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: `こんぶBOX | ${SITE_NAME}`,
  description: "全国の厳選昆布を詰め合わせた昆布のフォーチュンボックス。毎月届く昆布の宝箱。中身は届いてからのお楽しみ。",
};

export default async function KombuBoxPage() {
  const boxes = await prisma.kombuBox.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 text-center">
          <p className="text-xs font-semibold text-green-300 tracking-widest mb-3">KOMBU BOX</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">こんぶBOX</h1>
          <p className="text-sm sm:text-base text-green-100 max-w-xl mx-auto leading-relaxed">
            全国の昆布生産者がこだわり抜いた逸品を厳選して詰め合わせ。
            中身は届いてからのお楽しみ。毎月届く、昆布の宝箱。
          </p>
          <div className="mt-8 grid grid-cols-3 gap-6 max-w-md mx-auto">
            <div>
              <span className="block text-2xl font-bold">5-8</span>
              <span className="text-xs text-green-200">商品数</span>
            </div>
            <div>
              <span className="block text-2xl font-bold">全国</span>
              <span className="text-xs text-green-200">産地</span>
            </div>
            <div>
              <span className="block text-2xl font-bold">月1</span>
              <span className="text-xs text-green-200">お届け</span>
            </div>
          </div>
        </div>
      </section>

      {/* コンセプト */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
          <div className="text-center mb-8">
            <h2 className="text-xl font-bold text-gray-900">こんぶBOXとは？</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "中身はお楽しみ", desc: "届いて開けるまで中身はわからない。昆布との新しい出会いを提供します。" },
              { title: "生産者を応援", desc: "知名度は低いけど品質は確か。そんな昆布生産者の商品を全国にお届け。" },
              { title: "学べる昆布体験", desc: "各商品に生産者のストーリーと美味しい食べ方ガイドを同梱。昆布がもっと好きになる。" },
            ].map((item) => (
              <div key={item.title} className="text-center">
                <div className="w-10 h-10 rounded-full bg-[#d8f3dc] flex items-center justify-center mx-auto" />
                <h3 className="text-sm font-bold text-gray-900 mt-3 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ボックス一覧 */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6 text-center">ボックス一覧</h2>
          {boxes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {boxes.map((box) => (
                <div key={box.id} className="rounded-xl border border-gray-100 bg-white p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-gray-900">{box.name}</h3>
                    <span className={`text-[10px] rounded-full px-2 py-0.5 ${
                      box.status === "on_sale" ? "bg-green-100 text-green-700" :
                      box.status === "sold_out" ? "bg-gray-100 text-gray-500" :
                      box.status === "upcoming" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {box.status === "on_sale" ? "販売中" : box.status === "sold_out" ? "完売" : box.status === "upcoming" ? "近日発売" : "終了"}
                    </span>
                  </div>
                  {box.description && <p className="text-xs text-gray-500 leading-relaxed mb-3">{box.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-green-700">&yen;{box.price.toLocaleString()}</span>
                    <span className="text-[10px] text-gray-400">{box._count.items}商品入り</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d8f3dc]" />
              <p className="text-gray-500 text-sm mb-2">第1弾は準備中です</p>
              <p className="text-gray-400 text-xs">メルマガ登録で発売通知を受け取れます</p>
            </div>
          )}
        </div>
      </section>

      {/* メルマガ登録 */}
      <section className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">発売通知を受け取る</h2>
          <p className="text-xs text-gray-500 mb-6">こんぶBOXの最新情報をメールでお届けします</p>
          <SubscribeForm />
        </div>
      </section>
    </main>
  );
}
