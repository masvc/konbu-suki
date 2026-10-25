/**
 * 商品ページSEO/AIO強化: カテゴリ・タグから用途・味わい・ペアリング情報を自動生成
 */

type ProductInfo = {
  name: string;
  brand: string;
  category: string;
  subcategory?: string | null;
  origin?: string | null;
  tags?: string | null;
  description?: string | null;
};

/** 食感・味わいタグを商品名・カテゴリから自動生成 */
export function getTextureAndFlavorTags(p: ProductInfo): string[] {
  const name = (p.name + " " + (p.description || "")).toLowerCase();
  const tags: string[] = [];

  // 食感タグ
  if (name.includes("パリパリ") || name.includes("ぱりぱり") || name.includes("カリカリ")) tags.push("パリパリ食感");
  if (name.includes("しっとり") || name.includes("ソフト") || name.includes("やわらか")) tags.push("しっとり食感");
  if (name.includes("サクサク") || name.includes("さくさく")) tags.push("サクサク食感");
  if (name.includes("とろろ") || name.includes("おぼろ") || name.includes("とろとろ")) tags.push("とろとろ食感");
  if (name.includes("肉厚") || name.includes("厚切") || name.includes("厚葉")) tags.push("肉厚");

  // 味わいタグ
  if (name.includes("梅") || name.includes("うめ")) tags.push("梅味");
  if (name.includes("酢") || name.includes("ビネガー")) tags.push("酢味");
  if (name.includes("甘辛") || name.includes("佃煮")) tags.push("甘辛");
  if (name.includes("しょうゆ") || name.includes("醤油")) tags.push("醤油味");
  if (name.includes("山椒") || name.includes("さんしょう")) tags.push("山椒");
  if (name.includes("ごま") || name.includes("胡麻")) tags.push("ごま風味");
  if (name.includes("しそ") || name.includes("紫蘇")) tags.push("しそ風味");
  if (name.includes("わさび")) tags.push("わさび味");
  if (name.includes("ピリ辛") || name.includes("唐辛子") || name.includes("激辛") || name.includes("七味")) tags.push("ピリ辛");

  // 素材・製法タグ
  if (name.includes("無添加")) tags.push("無添加");
  if (name.includes("天然")) tags.push("天然素材");
  if (name.includes("減塩")) tags.push("減塩");
  if (name.includes("有機") || name.includes("オーガニック")) tags.push("有機");
  if (name.includes("国産")) tags.push("国産");
  if (name.includes("北海道")) tags.push("北海道産");

  // 用途タグ
  if (name.includes("お茶漬け") || name.includes("茶漬")) tags.push("お茶漬けに合う");
  if (name.includes("おにぎり")) tags.push("おにぎりに合う");
  if (name.includes("お弁当") || name.includes("弁当")) tags.push("お弁当向き");
  if (name.includes("おつまみ") || name.includes("ビール") || name.includes("晩酌")) tags.push("おつまみ向き");
  if (name.includes("業務用") || name.includes("大容量")) tags.push("業務用・大容量");
  if (name.includes("ギフト") || name.includes("贈答") || name.includes("詰め合わせ")) tags.push("ギフト向き");

  // カテゴリベースのデフォルトタグ
  if (tags.length === 0) {
    switch (p.category) {
      case "dashi": tags.push("だし用"); break;
      case "shiokombu": tags.push("ごはんのお供"); break;
      case "snack": tags.push("おやつ・間食"); break;
      case "tsukudani": tags.push("ごはんのお供"); break;
      case "tororo": tags.push("とろとろ食感"); break;
      case "kombucha": tags.push("飲み物"); break;
      case "seasoning": tags.push("調味料"); break;
      case "health": tags.push("健康サポート"); break;
      case "gift": tags.push("ギフト向き"); break;
    }
  }

  return [...new Set(tags)]; // 重複除去
}

/** 味わいプロファイル */
export function getTasteProfile(p: ProductInfo) {
  const tags = (p.tags || "").toLowerCase();
  const name = p.name.toLowerCase();
  const cat = p.category;

  const profiles: { label: string; value: number }[] = [];

  if (cat === "dashi") {
    profiles.push({ label: "旨味", value: name.includes("羅臼") ? 5 : name.includes("利尻") ? 4 : 3 });
    profiles.push({ label: "香り", value: name.includes("利尻") ? 5 : name.includes("真昆布") ? 4 : 3 });
    profiles.push({ label: "甘み", value: name.includes("真昆布") ? 5 : name.includes("日高") ? 3 : 3 });
    profiles.push({ label: "塩味", value: 2 });
  } else if (cat === "shiokombu") {
    profiles.push({ label: "旨味", value: 4 });
    profiles.push({ label: "塩味", value: tags.includes("減塩") ? 2 : 4 });
    profiles.push({ label: "甘み", value: 2 });
    profiles.push({ label: "香り", value: 2 });
  } else if (cat === "snack") {
    profiles.push({ label: "旨味", value: 3 });
    profiles.push({ label: "酸味", value: name.includes("酢") || name.includes("梅") ? 4 : 1 });
    profiles.push({ label: "甘み", value: name.includes("おやつ") ? 3 : 1 });
    profiles.push({ label: "塩味", value: 3 });
  } else if (cat === "kombucha") {
    profiles.push({ label: "旨味", value: 4 });
    profiles.push({ label: "塩味", value: 3 });
    profiles.push({ label: "香り", value: 3 });
    profiles.push({ label: "酸味", value: name.includes("梅") ? 4 : 1 });
  } else {
    profiles.push({ label: "旨味", value: 3 });
    profiles.push({ label: "塩味", value: 3 });
    profiles.push({ label: "甘み", value: 2 });
    profiles.push({ label: "香り", value: 2 });
  }

  return profiles;
}

/** おすすめの使い方 */
export function getUsageSuggestions(p: ProductInfo): string[] {
  const cat = p.category;
  const name = p.name.toLowerCase();
  const tags = (p.tags || "").toLowerCase();

  const suggestions: string[] = [];

  switch (cat) {
    case "dashi":
      suggestions.push("お味噌汁の出汁に");
      suggestions.push("湯豆腐・鍋物のベースに");
      suggestions.push("昆布水（水出し）で毎日の料理に");
      if (name.includes("利尻")) suggestions.push("お吸い物・茶碗蒸しに（透明な出汁）");
      if (name.includes("羅臼")) suggestions.push("煮物・おでんに（濃厚な旨味）");
      if (name.includes("日高")) suggestions.push("出汁を取った後そのまま食べられる");
      if (name.includes("がごめ")) suggestions.push("納豆やサラダのトッピングに");
      break;
    case "shiokombu":
      suggestions.push("ごはんのお供に");
      suggestions.push("おにぎりの具材に");
      suggestions.push("パスタの味付けに（和風パスタ）");
      suggestions.push("サラダのトッピングに");
      suggestions.push("お茶漬けに");
      if (name.includes("梅")) suggestions.push("お弁当のおかずに（梅の殺菌効果も）");
      break;
    case "snack":
      suggestions.push("おやつ・間食に（低カロリー）");
      suggestions.push("お酒のおつまみに");
      suggestions.push("ダイエット中の置き換えおやつに");
      suggestions.push("子供のおやつに（添加物が少ない）");
      break;
    case "tsukudani":
      suggestions.push("ごはんのお供に");
      suggestions.push("お茶漬けに");
      suggestions.push("お弁当のおかずに");
      suggestions.push("日本酒のあてに");
      break;
    case "tororo":
      suggestions.push("お吸い物に浮かべて");
      suggestions.push("おにぎりに巻いて");
      suggestions.push("うどん・そばのトッピングに");
      suggestions.push("酢の物に添えて");
      break;
    case "kombucha":
      suggestions.push("お茶として（ホット/アイス）");
      suggestions.push("料理の隠し味に（パスタ、炒め物）");
      suggestions.push("おにぎりの味付けに");
      suggestions.push("浅漬けの素として");
      break;
    case "seasoning":
      suggestions.push("毎日の料理の味付けに");
      suggestions.push("煮物・汁物のベースに");
      suggestions.push("和食全般の味の決め手に");
      break;
    case "health":
      suggestions.push("毎日の健康維持に");
      suggestions.push("食物繊維の補給に");
      suggestions.push("ミネラル補給に");
      break;
    case "gift":
      suggestions.push("お中元・お歳暮に");
      suggestions.push("手土産・ご挨拶に");
      suggestions.push("昆布好きな方へのプレゼントに");
      break;
  }

  return suggestions;
}

/** 合う料理・ペアリング */
export function getPairings(p: ProductInfo): string[] {
  const cat = p.category;
  const name = p.name.toLowerCase();

  switch (cat) {
    case "dashi":
      return ["味噌汁", "お吸い物", "湯豆腐", "鍋料理", "煮物", "茶碗蒸し", "炊き込みご飯", "おでん"];
    case "shiokombu":
      return ["白ごはん", "おにぎり", "お茶漬け", "和風パスタ", "サラダ", "冷奴", "卵焼き", "チャーハン"];
    case "snack":
      return ["ビール", "日本酒", "お茶", "そのままおやつ"];
    case "tsukudani":
      return ["白ごはん", "お茶漬け", "お弁当", "日本酒", "お酒のあて"];
    case "tororo":
      return ["お吸い物", "おにぎり", "うどん", "そば", "酢の物", "味噌汁"];
    case "kombucha":
      return ["和菓子", "おにぎり", "パスタ（隠し味）", "浅漬け"];
    case "seasoning":
      return ["味噌汁", "煮物", "炊き込みご飯", "鍋料理", "うどん"];
    default:
      return ["和食全般"];
  }
}

/** こんな人におすすめ */
export function getRecommendedFor(p: ProductInfo): string[] {
  const cat = p.category;
  const tags = (p.tags || "").toLowerCase();

  const recs: string[] = [];

  if (tags.includes("無添加") || tags.includes("天然")) recs.push("添加物が気になる方");
  if (tags.includes("業務用")) recs.push("大量に使いたい方・飲食店の方");
  if (tags.includes("高級") || tags.includes("料亭")) recs.push("本格的な味を求める方");
  if (tags.includes("減塩")) recs.push("塩分を控えたい方");
  if (tags.includes("贈答") || cat === "gift") recs.push("贈り物をお探しの方");

  switch (cat) {
    case "dashi":
      recs.push("自宅で本格的なだしを取りたい方");
      recs.push("和食の味をワンランク上げたい方");
      break;
    case "shiokombu":
      recs.push("手軽にごはんのお供が欲しい方");
      recs.push("料理の時短をしたい方");
      break;
    case "snack":
      recs.push("ヘルシーなおやつを探している方");
      recs.push("ダイエット中の方");
      break;
    case "health":
      recs.push("健康維持に関心がある方");
      recs.push("食物繊維・ミネラルを補給したい方");
      break;
  }

  return recs.slice(0, 5);
}

/** 昆布の栄養情報（カテゴリ共通） */
export function getNutritionFacts(cat: string) {
  if (cat === "dashi" || cat === "tororo") {
    return [
      { label: "食物繊維", desc: "水溶性食物繊維（アルギン酸）が豊富。腸内環境を整える。" },
      { label: "ミネラル", desc: "カルシウム・マグネシウム・鉄分・ヨウ素を含む。" },
      { label: "グルタミン酸", desc: "旨味成分。昆布だしの旨味の正体。" },
      { label: "フコイダン", desc: "昆布に含まれる多糖類の一種。" },
    ];
  }
  return null;
}
