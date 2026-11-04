export const SITE_NAME = "コンブスキー";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://konbu-suki.com";
export const SITE_TAGLINE = "日本の昆布を、もっとスキになる。";
export const SITE_DESCRIPTION =
  "昆布専門のキュレーションサイト「コンブスキー」。利尻・羅臼・日高・真昆布など産地別の特徴から、だし昆布・塩昆布・とろろ昆布まで。315件以上の昆布商品を網羅的に比較。まだ知らない、あなたの好きな昆布に出会えます。";

export const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "";

// Amazon アソシエイトタグ
// 既定値はスクリプト側と揃える。ハイフンが落ちていると存在しないタグになり、
// クリックが成果にならない。
export const AMAZON_ASSOCIATE_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG || "konbu-suki-22";

// 楽天アフィリエイトID（楽天直営。もしも経由なら空のままでよい）
export const RAKUTEN_AFFILIATE_ID = process.env.NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID || "";

// もしもアフィリエイト。楽天の成果をもしも経由で計測する場合に設定する。
// 4つすべて揃っているときだけ もしも のリンクを使う。
// 値はもしもの管理画面が出すリンクコードに含まれている。
export const MOSHIMO_A_ID = process.env.NEXT_PUBLIC_MOSHIMO_A_ID || "";
export const MOSHIMO_P_ID = process.env.NEXT_PUBLIC_MOSHIMO_P_ID || "";
export const MOSHIMO_PC_ID = process.env.NEXT_PUBLIC_MOSHIMO_PC_ID || "";
export const MOSHIMO_PL_ID = process.env.NEXT_PUBLIC_MOSHIMO_PL_ID || "";

// カテゴリ定義
export const CATEGORIES = {
  dashi: { label: "だし昆布", description: "出汁用の昆布を産地別に比較。利尻・羅臼・日高・真昆布それぞれの味わいの違いや、用途に合った選び方を解説します。" },
  snack: { label: "食べる昆布", description: "おやつやおつまみにぴったりの昆布を厳選。酢昆布・おしゃぶり昆布・茎わかめなど、手軽に楽しめる昆布商品を紹介します。" },
  tsukudani: { label: "佃煮・煮物", description: "昆布の佃煮・松前漬け・昆布巻きなど、ごはんのお供や常備菜になる昆布の加工品を幅広く紹介。老舗メーカーの逸品も。" },
  shiokombu: { label: "塩昆布", description: "ごはんのお供の定番、塩昆布を比較。ふじっ子・くらこん・小倉屋山本など人気ブランドの特徴や使い方を紹介します。" },
  tororo: { label: "とろろ昆布", description: "富山名産のとろろ昆布・おぼろ昆布を紹介。お吸い物やおにぎりに巻いて手軽に旨みをプラスできる昆布の薄削り商品。" },
  kombucha: { label: "昆布茶", description: "昆布茶・梅昆布茶を比較。飲むだけでなく料理の隠し味やパスタの味付けにも使える万能調味料としての活用法も紹介。" },
  seasoning: { label: "昆布調味料", description: "昆布だしの素・昆布つゆ・昆布ポン酢など、毎日の料理に昆布の旨みを手軽に加えられる調味料を比較・紹介します。" },
  health: { label: "健康食品", description: "昆布由来のフコイダンやアルギン酸を含むサプリメント・健康食品を紹介。昆布に含まれる栄養成分についても解説します。" },
  gift: { label: "ギフト昆布", description: "お中元・お歳暮・内祝いにおすすめの高級昆布ギフトセットを紹介。利尻や羅臼など産地にこだわった贈答用昆布の選び方。" },
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
  gagome: { label: "がごめ昆布", area: "北海道 函館", description: "強い粘りが特徴。とろろ昆布・松前漬けに。" },
} as const;

export type OriginSlug = keyof typeof ORIGINS;
