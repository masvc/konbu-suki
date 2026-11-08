import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `こんぶBOX｜おしゃぶり昆布中心の昆布おやつ定期便 月額990円 | ${SITE_NAME}`,
  description: "おしゃぶり昆布を中心に、全国の昆布おやつを毎月3種お届け。月額990円・送料込み・いつでも解約OK。先行10名限定で受付中。",
  alternates: { canonical: "/kombu-box" },
};

const PAYMENT_LINK = process.env.NEXT_PUBLIC_KOMBU_BOX_PAYMENT_LINK || "";

export default function KombuBoxPage() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 text-center">
          <p className="text-xs font-semibold text-green-300 tracking-widest mb-3">KOMBU BOX</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">こんぶBOX</h1>
          <p className="text-lg sm:text-xl text-green-100 font-bold mb-2">
            月額990円（税込・送料込み）
          </p>
          <p className="text-sm sm:text-base text-green-100 max-w-xl mx-auto leading-relaxed">
            おしゃぶり昆布を中心に、全国の昆布おやつを毎月3種お届け。
            中身は届いてからのお楽しみ。いつでも解約できます。
          </p>
          <p className="mt-3 text-xs text-green-200">先行10名限定で受付中</p>
          <div className="mt-6">
            {PAYMENT_LINK ? (
              <a
                href={PAYMENT_LINK}
                className="inline-block rounded-xl bg-white px-8 py-3.5 text-base font-bold text-green-800 hover:bg-green-50 transition shadow-lg"
              >
                先行申込はこちら
              </a>
            ) : (
              <p className="text-sm text-green-200">決済リンクを準備中です</p>
            )}
          </div>
          <div className="mt-8 grid grid-cols-3 gap-6 max-w-sm mx-auto">
            <div>
              <span className="block text-2xl font-bold">3</span>
              <span className="text-xs text-green-200">種類</span>
            </div>
            <div>
              <span className="block text-2xl font-bold">990</span>
              <span className="text-xs text-green-200">円/月</span>
            </div>
            <div>
              <span className="block text-2xl font-bold">0</span>
              <span className="text-xs text-green-200">縛り</span>
            </div>
          </div>
        </div>
      </section>

      {/* 中身 */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">届く中身</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "おしゃぶり昆布", desc: "北海道産昆布を使ったおしゃぶり昆布。梅味・プレーン・無添加など、毎月異なるブランドをセレクト。" },
              { title: "昆布おやつ", desc: "都こんぶ・酢昆布・昆布チップスなど、おしゃぶり昆布以外の昆布おやつも1〜2種お届け。" },
              { title: "食べ方ガイド", desc: "届いた昆布おやつの味わい方・保存方法・アレンジレシピをまとめたカードを同梱。" },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-gray-100 p-5 text-center">
                <div className="w-12 h-12 rounded-full bg-[#d8f3dc] flex items-center justify-center mx-auto mb-3" />
                <h3 className="text-sm font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* こんな人に */}
      <section className="bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">こんな方におすすめ</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            {[
              "おしゃぶり昆布が好きで、いろんな種類を試してみたい",
              "低カロリーなおやつを探している",
              "子どものおやつに安心できるものを選びたい",
              "お酒のおつまみに昆布を楽しみたい",
            ].map((text) => (
              <div key={text} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3">
                <span className="text-green-600 shrink-0 mt-0.5">-</span>
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 定期便の詳細 */}
      <section className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">定期便の詳細</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["月額料金", "990円（税込・送料込み）"],
                  ["届く中身", "おしゃぶり昆布を中心に昆布おやつ3種"],
                  ["配送方法", "ポスト投函（不在でも届きます）"],
                  ["発送時期", "毎月中旬ごろ"],
                  ["お届け先", "日本国内"],
                  ["お支払い", "クレジットカード（Stripe）"],
                  ["解約", "いつでも解約可能。次回発送日の5日前までにご連絡ください"],
                  ["解約方法", "お問い合わせフォームまたはメールでご連絡ください"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-gray-100 last:border-b-0">
                    <th className="text-left px-4 py-3 text-gray-500 font-medium bg-gray-50 w-1/3 whitespace-nowrap">{label}</th>
                    <td className="px-4 py-3 text-gray-900">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-green-700 to-green-600 text-white">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl font-bold mb-2">先行10名限定で受付中</h2>
          <p className="text-sm text-green-100 mb-6">月額990円・送料込み・いつでも解約OK</p>
          {PAYMENT_LINK ? (
            <a
              href={PAYMENT_LINK}
              className="inline-block rounded-xl bg-white px-8 py-3.5 text-base font-bold text-green-800 hover:bg-green-50 transition shadow-lg"
            >
              申し込む
            </a>
          ) : (
            <p className="text-sm text-green-200">決済リンクを準備中です</p>
          )}
          <p className="mt-4 text-xs text-green-200">
            <Link href="/legal/tokushoho" className="underline hover:text-white">特定商取引法に基づく表記</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
