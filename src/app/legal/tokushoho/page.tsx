import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `特定商取引法に基づく表記 | ${SITE_NAME}`,
  description: "コンブスキー（ピーキー株式会社）の特定商取引法に基づく表記です。",
  alternates: { canonical: "/legal/tokushoho" },
  robots: { index: false },
};

export default function TokushohoPage() {
  const rows: [string, string][] = [
    ["販売業者", "ピーキー株式会社"],
    ["代表者", "吉田将大"],
    ["所在地", "埼玉県熊谷市筑波二丁目48番地1 中央ビル6F"],
    ["電話番号", "TODO: 記載する（請求があった場合に遅滞なく開示）"],
    ["メールアドレス", "yoshida@peaky.co.jp"],
    ["販売URL", "https://konbu-suki.com/kombu-box"],
    ["商品名", "こんぶBOX（昆布おやつ定期便）"],
    ["販売価格", "月額990円（税込）"],
    ["送料", "販売価格に含む"],
    ["お支払い方法", "クレジットカード（Stripe経由）"],
    ["お届け時期", "毎月中旬ごろ（お届け先の地域により前後する場合があります）"],
    ["返品・交換", "商品に破損・汚損があった場合は到着後7日以内にご連絡ください。交換いたします。お客様都合による返品はお受けしておりません。"],
    ["定期購入の解約", "いつでも解約可能です。次回発送日の5日前までに、お問い合わせフォームまたはメールでご連絡ください。"],
    ["引き渡し時期", "お申し込み後、翌月の発送分からお届けします。"],
  ];

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="text-xl font-bold text-gray-900 mb-8">特定商取引法に基づく表記</h1>
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {rows.map(([label, value]) => (
                <tr key={label} className="border-b border-gray-100 last:border-b-0">
                  <th className="text-left px-4 py-3.5 text-gray-500 font-medium bg-gray-50 w-1/3 align-top whitespace-nowrap">{label}</th>
                  <td className={`px-4 py-3.5 ${value.startsWith("TODO") ? "text-amber-600 font-medium" : "text-gray-900"}`}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-6 text-xs text-gray-400">
          最終更新: 2026年11月8日
        </p>
      </div>
    </main>
  );
}
