/** こんぶBOXの設定を一元管理 */
export const KOMBU_BOX = {
  name: "こんぶBOX",
  price: 4980,
  priceLabel: "4,980円（税込・送料込み）",
  worthLabel: "5,000円相当以上",
  limitLabel: "先行10名限定",
  shippingMethod: "宅急便",
  shippingDays: "ご注文から5営業日以内に発送",
  allergyNote:
    "各商品に小麦・大豆・えびなどのアレルギー物質を含む場合があります。詳細は各パッケージの表示をご確認ください。食物アレルギーがご心配な方は、ご購入前にお問い合わせください。",
  paymentLink: process.env.NEXT_PUBLIC_KOMBU_BOX_PAYMENT_LINK || "",
} as const;
