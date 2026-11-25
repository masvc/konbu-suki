/**
 * 記事に出す商品の選び方。
 *
 * **記事のテーマと合う商品だけを出す。** 合うものが無い記事には出さない
 * （ここに書かれていない記事には商品カードが出ない）。栄養・歴史・分類の
 * 記事のように「読んで終わる」ものに商品を差し込まない。
 *
 * **並び順に意味を持たせない。** 運営が実際に買っているもの（isOwnerPick）、
 * おすすめ（isFeatured）、レビュー数の順に出しているだけで、**順位でも
 * 評価でもない**。点数やランキングは付けない（CLAUDE.md のルール）。
 *
 * 出てくる場所は2か所（src/app/guide/[slug]/page.tsx）。
 *   ・本文の途中（`afterSection` で指定した節の直後）
 *   ・記事の末尾（「関連商品を探す」の上）
 */

export type GuideProductRule = {
  /** 商品のカテゴリ。Product.category と同じ値 */
  category: string;
  /** 産地などの絞り込み。Product.subcategory と同じ値。複数可 */
  subcategory?: string[];
  /** 商品名に含まれていてほしい語（どれか1つ） */
  include?: string[];
  /** 商品名に含まれていたら外す語 */
  exclude?: string[];
  /** 本文のこの節（0始まり）の直後に出す。指定しなければ末尾だけ */
  afterSection?: number;
  /** カードの見出し。何を出しているのかを言葉で示す */
  heading: string;
  /** なぜこの商品群なのか。画面には出さない。選び方の記録 */
  why: string;
};

export const GUIDE_PRODUCTS: Record<string, GuideProductRule> = {
  /* だしを取る記事 → だし用の乾燥昆布 */
  "how-to-make-dashi": {
    category: "dashi",
    afterSection: 1,
    heading: "だしを取るための昆布",
    why: "記事が扱うのは乾燥昆布でだしを取る手順。だし用の昆布が直接の受け皿になる",
  },
  "kombu-katsuo-dashi": {
    category: "dashi",
    afterSection: 1,
    heading: "だし用の昆布",
    why: "昆布だしと鰹だしの比較。昆布側の商品を出す",
  },
  "kombu-water": {
    category: "dashi",
    afterSection: 1,
    heading: "昆布水に使う昆布",
    why: "水に浸けるだけの作り方。だし用の昆布をそのまま使う",
  },
  "yudofu-kombu": {
    category: "dashi",
    subcategory: ["rishiri", "makombu"],
    afterSection: 1,
    heading: "湯豆腐に向く昆布",
    why: "記事が挙げているのは澄んだだしが出る利尻・真昆布",
  },
  "toshikoshi-soba-dashi": {
    category: "dashi",
    afterSection: 1,
    heading: "そばつゆのだしに使う昆布",
    why: "つゆのだしを取る記事。だし用の昆布",
  },
  "nanakusa-gayu-dashi": {
    category: "dashi",
    afterSection: 1,
    heading: "七草がゆのだしに使う昆布",
    why: "昆布とかつおで炊く記事。だし用の昆布",
  },
  "how-to-choose-kombu": {
    category: "dashi",
    afterSection: 1,
    heading: "だし用の昆布",
    why: "選び方の記事。実際に選べる商品を並べる",
  },
  "kombu-comparison": {
    category: "dashi",
    subcategory: ["rishiri", "rausu", "hidaka", "makombu"],
    afterSection: 1,
    heading: "記事で比べた4種の昆布",
    why: "利尻・羅臼・日高・真昆布を比べる記事。その4種に絞る",
  },
  "kombu-types": {
    category: "dashi",
    afterSection: 1,
    heading: "種類ごとの昆布",
    why: "種類と用途の記事。だし用の昆布を産地違いで並べる",
  },
  "kombu-storage": {
    category: "dashi",
    afterSection: 1,
    heading: "保存して使う乾燥昆布",
    why: "乾燥昆布の保存の記事。対象そのものが乾燥昆布",
  },
  "kombu-production": {
    category: "dashi",
    afterSection: 1,
    heading: "産地別の昆布",
    why: "産地の記事。産地が分かる乾燥昆布",
  },
  "ma-kombu": {
    category: "dashi",
    subcategory: ["makombu"],
    afterSection: 1,
    heading: "真昆布",
    why: "真昆布の記事",
  },
  "rausu-kombu": {
    category: "dashi",
    subcategory: ["rausu"],
    afterSection: 1,
    heading: "羅臼昆布",
    why: "羅臼昆布の記事",
  },
  "gagome-kombu": {
    category: "dashi",
    subcategory: ["gagome"],
    afterSection: 1,
    heading: "がごめ昆布",
    why: "がごめ昆布の記事",
  },

  /* 昆布締め → 昆布締めに使う乾燥昆布 */
  kobujime: {
    category: "dashi",
    subcategory: ["makombu", "rausu", "rishiri"],
    afterSection: 1,
    heading: "昆布締めに使う昆布",
    why: "記事が挙げているのは幅のある真昆布・羅臼・利尻",
  },
  "kobujime-tips": {
    category: "dashi",
    subcategory: ["makombu", "rausu", "rishiri"],
    afterSection: 1,
    heading: "昆布締めに使う昆布",
    why: "同上。失敗とコツの記事",
  },
  "kobujime-tai": { category: "dashi", subcategory: ["makombu", "rausu"], afterSection: 1, heading: "昆布締めに使う昆布", why: "鯛の昆布締め" },
  "kobujime-hirame": { category: "dashi", subcategory: ["rausu", "makombu"], afterSection: 1, heading: "昆布締めに使う昆布", why: "ヒラメ・白身魚の昆布締め" },
  "kobujime-salmon": { category: "dashi", subcategory: ["makombu", "rausu"], afterSection: 1, heading: "昆布締めに使う昆布", why: "サーモンの昆布締め" },
  "kobujime-beef": { category: "dashi", subcategory: ["makombu"], afterSection: 1, heading: "昆布締めに使う昆布", why: "牛肉の昆布締め" },
  "kobujime-chicken": { category: "dashi", subcategory: ["makombu"], afterSection: 1, heading: "昆布締めに使う昆布", why: "鶏むね肉の昆布締め" },
  "kobujime-vegetables": { category: "dashi", subcategory: ["makombu", "rishiri"], afterSection: 1, heading: "昆布締めに使う昆布", why: "野菜の昆布締め" },
  "kobujime-iwashi-katsuo": { category: "dashi", subcategory: ["makombu", "rausu"], afterSection: 1, heading: "昆布締めに使う昆布", why: "イワシとカツオの昆布締め" },
  "kobujime-hare": { category: "dashi", subcategory: ["rausu", "makombu"], afterSection: 1, heading: "昆布締めに使う昆布", why: "正月・お祝いの昆布締め" },
  "kobujime-arrange": { category: "dashi", subcategory: ["makombu", "rausu"], afterSection: 1, heading: "昆布締めに使う昆布", why: "昆布締めの食べ方とアレンジ" },

  /* 料理の記事 → その料理に使う昆布・加工品 */
  "oden-kombu": {
    category: "dashi",
    subcategory: ["hidaka", "nagakombu"],
    afterSection: 1,
    heading: "おでんに向く昆布",
    why: "記事が挙げているのは煮えやすい日高昆布・長昆布",
  },
  kombumaki: {
    category: "dashi",
    subcategory: ["hidaka", "nagakombu"],
    afterSection: 1,
    heading: "昆布巻きに使う昆布",
    why: "巻いて煮るので、やわらかく煮える日高・長昆布",
  },
  matsumaezuke: {
    category: "dashi",
    subcategory: ["gagome"],
    afterSection: 4,
    heading: "松前漬けの原料に挙がるがごめ昆布",
    why: "北海道・協会が松前漬けの原料に挙げるのはがごめ昆布。節4（どの昆布を使うか）の直後",
  },
  "kombu-tsukudani": {
    category: "tsukudani",
    afterSection: 1,
    heading: "昆布の佃煮",
    why: "佃煮の記事。作るだけでなく買う人もいる",
  },
  "kombu-recipes": {
    category: "dashi",
    afterSection: 1,
    heading: "料理に使う昆布",
    why: "レシピ集。材料になる乾燥昆布",
  },

  /* 加工品の記事 → その加工品 */
  "shiokombu-guide": {
    category: "shiokombu",
    afterSection: 1,
    heading: "塩昆布",
    why: "塩分量と使い方の記事。商品そのものが塩昆布",
  },
  "kombu-cha-uses": {
    category: "kombucha",
    afterSection: 1,
    heading: "昆布茶",
    why: "昆布茶の使い方の記事",
  },
  "tororo-oboro": {
    category: "tororo",
    afterSection: 1,
    heading: "とろろ昆布・おぼろ昆布",
    why: "製法の違いの記事。どちらも商品がある",
  },
  "kombu-processed-foods": {
    category: "shiokombu",
    afterSection: 1,
    heading: "加工品の例（塩昆布）",
    why: "加工品26種の一覧。代表として塩昆布を出す",
  },

  /* おやつ・おつまみ */
  "kombu-oyatsu-guide": { category: "snack", afterSection: 1, heading: "昆布のおやつ", why: "おやつの総合ガイド" },
  "oshaburi-kombu": { category: "snack", include: ["おしゃぶり"], afterSection: 1, heading: "おしゃぶり昆布", why: "おしゃぶり昆布の記事。名前で絞る" },
  "otsumami-kombu": { category: "snack", afterSection: 1, heading: "おつまみ昆布", why: "おつまみ昆布の記事" },
  "miyako-kombu": { category: "snack", include: ["都こんぶ", "都昆布"], afterSection: 1, heading: "都こんぶ", why: "製造元の商品に絞る。「中野」で絞ると同じ会社のおしゃぶり昆布まで入ってしまうので名前で絞る" },
  "kombu-diet-oyatsu": { category: "snack", afterSection: 2, heading: "昆布のおやつ", why: "ダイエットの記事。効果は書かず、商品だけ出す" },
};

/**
 * 商品を出さない記事。
 *
 * **読んで終わる記事に商品を差し込まない。** 栄養の数値・歴史・分類の記事は、
 * 買う行動につながらないうえ、広告色が強く見えて信頼を下げる。
 * （`GUIDE_PRODUCTS` に無いものは自動的に出ないが、意図して出していないことを
 * 残すためにここに書く）
 */
export const NO_PRODUCTS = [
  "kombu-nutrition",
  "kombu-seaweed-types",
  "kombu-life-cycle",
  "kombu-history",
] as const;

/**
 * 記事に合う商品を取り出す。
 *
 * **並びは「運営が買っているもの → おすすめ → レビューが多いもの」。**
 * 点数での順位付けではない。合うものが無ければ空で返す（カードを出さない）。
 *
 * **呼ぶのはサーバー側だけ**（記事ページ）。Prisma は中で読み込む。
 */
export async function productsForGuide(slug: string, limit = 3) {
  const rule = GUIDE_PRODUCTS[slug];
  if (!rule) return { rule: null, products: [] as ArticleProductRow[] };

  const { prisma } = await import("@/lib/prisma");

  const where: Record<string, unknown> = { category: rule.category };
  if (rule.subcategory) where.subcategory = { in: rule.subcategory };
  if (rule.include) where.OR = rule.include.map((w) => ({ name: { contains: w } }));
  if (rule.exclude) where.NOT = rule.exclude.map((w) => ({ name: { contains: w } }));

  const products = await prisma.product.findMany({
    where,
    select: {
      id: true,
      name: true,
      brand: true,
      price: true,
      imageUrl: true,
      weight: true,
      amazonAsin: true,
      rakutenUrl: true,
      rakutenId: true,
    },
    orderBy: [
      { isOwnerPick: "desc" },
      { isFeatured: "desc" },
      { reviewCount: "desc" },
      { id: "asc" },
    ],
    take: limit,
  });

  return { rule, products };
}

export type ArticleProductRow = {
  id: number;
  name: string;
  brand: string;
  price: number | null;
  imageUrl: string | null;
  weight: string | null;
  amazonAsin: string | null;
  rakutenUrl: string | null;
  rakutenId: string | null;
};
