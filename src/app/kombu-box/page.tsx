import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { SITE_NAME } from "@/lib/constants";
import { KOMBU_BOX } from "@/lib/kombu-box";

export const metadata: Metadata = {
  title: `${KOMBU_BOX.name}｜中身はシークレット 昆布おやつの詰め合わせギフト ${KOMBU_BOX.priceLabel.replace("（税込・送料込み）", "")} | ${SITE_NAME}`,
  description: `おしゃぶり昆布を中心に、${KOMBU_BOX.worthLabel}の昆布おやつを厳選詰め合わせ。${KOMBU_BOX.priceLabel}。${KOMBU_BOX.limitLabel}。`,
  alternates: { canonical: "/kombu-box" },
};

export default function KombuBoxPage() {
  return (
    <main className="flex-1">
      {/* Hero: 左テキスト・右イラスト */}
      <section className="bg-gradient-to-br from-green-800 to-green-600 text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 sm:py-16 flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <div className="flex-1 text-center md:text-left">
            <p className="text-xs font-semibold text-green-300 tracking-widest mb-3">KOMBU BOX</p>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{KOMBU_BOX.name}</h1>
            <p className="text-lg sm:text-xl text-green-100 font-bold mb-2">
              {KOMBU_BOX.priceLabel}
            </p>
            <p className="text-sm sm:text-base text-green-100 leading-relaxed">
              {KOMBU_BOX.worthLabel}の昆布おやつを、おしゃぶり昆布中心に厳選して詰め合わせ。
              <br />
              中身は届いてからのお楽しみ。何が入っているかは、開けてみてください。
            </p>
            <p className="mt-3 text-xs text-green-200">{KOMBU_BOX.limitLabel}で受付中</p>
            <div className="mt-6">
              {KOMBU_BOX.paymentLink ? (
                <a
                  href={KOMBU_BOX.paymentLink}
                  className="inline-block rounded-xl bg-white px-8 py-3.5 text-base font-bold text-green-800 hover:bg-green-50 transition shadow-lg"
                >
                  購入する
                </a>
              ) : (
                <p className="text-sm text-green-200">決済リンクを準備中です</p>
              )}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-6 max-w-xs mx-auto md:mx-0">
              <div>
                <span className="block text-2xl font-bold">?</span>
                <span className="text-xs text-green-200">種類</span>
              </div>
              <div>
                <span className="block text-2xl font-bold">{KOMBU_BOX.price.toLocaleString()}</span>
                <span className="text-xs text-green-200">円（税込）</span>
              </div>
              <div>
                <span className="block text-2xl font-bold">0</span>
                <span className="text-xs text-green-200">送料</span>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Image src="/kombu-box-illustration.webp" alt="こんぶBOXのイラスト：おしゃぶり昆布や都こんぶなどが入った箱" width={400} height={400} className="w-full drop-shadow-xl" />
          </div>
        </div>
      </section>

      {/* シークレットの魅力 */}
      <section className="bg-white border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">開けるまで中身はシークレット</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { title: "おしゃぶり昆布が主役", desc: "梅味・プレーン・無添加など、スーパーでは見かけないブランドも含めて厳選。" },
              { title: "昆布おやついろいろ", desc: "都こんぶ・酢昆布・昆布チップスなど、開けるまでわからない組み合わせ。" },
              { title: "食べ方ガイド付き", desc: "届いた昆布おやつの味わい方やアレンジレシピをまとめたカードを同梱。" },
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
              "お歳暮や手土産にちょっと変わったギフトを贈りたい",
              "子どものおやつに安心できるものを選びたい",
            ].map((text) => (
              <div key={text} className="flex items-start gap-2 rounded-lg border border-gray-100 bg-white px-4 py-3">
                <span className="text-green-600 shrink-0 mt-0.5">-</span>
                <span className="text-sm text-gray-700">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 購入の詳細 */}
      <section className="bg-white border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-6">ご購入について</h2>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["価格", KOMBU_BOX.priceLabel],
                  ["届く中身", `おしゃぶり昆布を中心に${KOMBU_BOX.worthLabel}の昆布おやつを詰め合わせ（種類・個数はシークレット）`],
                  ["配送方法", KOMBU_BOX.shippingMethod],
                  ["発送時期", KOMBU_BOX.shippingDays],
                  ["お届け先", "日本国内"],
                  ["お支払い", "クレジットカード（Stripe）"],
                  ["返品・交換", "商品に破損・汚損があった場合は到着後7日以内にご連絡ください"],
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

      {/* アレルギー表記 */}
      <section className="bg-gray-50 border-t border-gray-100">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6">
          <p className="text-xs text-gray-500 leading-relaxed">
            {KOMBU_BOX.allergyNote.replace("お問い合わせください", "")}<Link href="/contact" className="text-green-700 underline">お問い合わせ</Link>ください。
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-green-700 to-green-600 text-white">
        <div className="mx-auto max-w-xl px-4 sm:px-6 py-12 text-center">
          <h2 className="text-xl font-bold mb-2">{KOMBU_BOX.limitLabel}で受付中</h2>
          <p className="text-sm text-green-100 mb-6">{KOMBU_BOX.priceLabel}・中身はシークレット</p>
          {KOMBU_BOX.paymentLink ? (
            <a
              href={KOMBU_BOX.paymentLink}
              className="inline-block rounded-xl bg-white px-8 py-3.5 text-base font-bold text-green-800 hover:bg-green-50 transition shadow-lg"
            >
              購入する
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
