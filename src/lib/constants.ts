export const SITE_NAME = "コンブスキー";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://konbu-suki.vercel.app";
export const SITE_TAGLINE = "日本の昆布を、もっとスキになる。";
export const SITE_DESCRIPTION =
  "昆布専門のキュレーションサイト「コンブスキー」。利尻・羅臼・日高・真昆布など産地別の特徴から、だし昆布・塩昆布・とろろ昆布まで。Amazon・楽天の昆布商品を網羅的に比較。昆布のD2Cと昆布商社を目指すプロジェクト。";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// Amazon アソシエイトタグ
export const AMAZON_ASSOCIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "konbusuki-22";

// 楽天アフィリエイトID
export const RAKUTEN_AFFILIATE_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID || "";

// カテゴリ定義
export const CATEGORIES = {
  dashi: { label: "だし昆布", description: "出汁用の昆布。利尻・羅臼・日高・真昆布など産地別の特徴を解説。" },
  snack: { label: "食べる昆布", description: "おやつ・おつまみ昆布。酢昆布、おしゃぶり昆布など手軽に楽しめる昆布。" },
  tsukudani: { label: "佃煮・煮物", description: "昆布の佃煮、松前漬け、昆布巻きなどの加工品。" },
  shiokombu: { label: "塩昆布", description: "ごはんのお供の定番。ふじっ子、くらこん等のブランド塩昆布。" },
  tororo: { label: "とろろ昆布", description: "富山名産のとろろ昆布・おぼろ昆布。お吸い物やおにぎりに。" },
  kombucha: { label: "昆布茶", description: "昆布茶・梅昆布茶。料理の隠し味にも使える万能調味料。" },
  seasoning: { label: "昆布調味料", description: "昆布だしの素、昆布つゆ、昆布ポン酢など。" },
  health: { label: "健康食品", description: "昆布由来のフコイダン、アルギン酸サプリなど。" },
  gift: { label: "ギフト昆布", description: "贈答用の高級昆布セット。お中元・お歳暮に。" },
} as const;

export type CategorySlug = keyof typeof CATEGORIES;
export const CATEGORY_SLUGS = Object.keys(CATEGORIES) as CategorySlug[];

// 産地定義
export const ORIGINS = {
  rishiri: { label: "利尻昆布", area: "北海道 利尻・礼文", description: "透明で上品なだし。京都の高級料亭御用達。" },
  rausu: { label: "羅臼昆布", area: "北海道 羅臼", description: "昆布の王様。濃厚で旨みが強い。" },
  hidaka: { label: "日高昆布", area: "北海道 日高", description: "柔らかく煮物向き。万能型の昆布。" },
  makombu: { label: "真昆布", area: "北海道 函館", description: "上品な甘みのだし。大阪の昆布文化の主役。" },
  nagakombu: { label: "長昆布", area: "北海道 釧路", description: "昆布巻き・煮物に最適。リーズナブル。" },
  hosome: { label: "細目昆布", area: "北海道 函館", description: "粘りが強く、とろろ昆布の原料。" },
  gagome: { label: "がごめ昆布", area: "北海道 函館", description: "フコイダン豊富。健康昆布として注目。" },
} as const;

export type OriginSlug = keyof typeof ORIGINS;
