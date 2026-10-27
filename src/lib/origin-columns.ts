/**
 * 産地コラム: なぜこの地域の昆布が名産なのか
 *
 * 確認済み出典:
 * - 北海道ぎょれん「北海道のこんぶ」 https://www.gyoren.or.jp/konbu/
 *   ※ 長昆布・細目昆布の用途について記載を確認
 * - 農林水産省「特集2 についてのこんぶ」 https://www.maff.go.jp/j/pr/aff/2203/spe2_01.html
 *   ※ 昆布の種類・産地・用途の概要
 * - 水産庁「水産物についての知識 昆布」 https://www.jfa.maff.go.jp/
 *   ※ 昆布漁業・生産地に関する情報
 * - 北海道庁「北海道の水産業 こんぶ」 https://www.pref.hokkaido.lg.jp/sr/ske/
 *   ※ 北海道各地域の昆布生産概況
 * - 北海道水産林務部「北海道お魚図鑑 こんぶ」 https://www.pref.hokkaido.lg.jp/sr/ske/osazu/oz01fis/oz010fi.html
 *   ※ 北海道の昆布の種類・分布
 *
 * それ以外の記述は一般的に広く知られた情報に基づく。
 * 特定の出典で確認できない断定表現は避けている。
 */

type OriginSource = {
  name: string;
  url: string;
};

type OriginColumn = {
  why: string;
  features: string[];
  bestFor: string[];
  sources: OriginSource[];
};

export const ORIGIN_COLUMNS: Record<string, OriginColumn> = {
  rishiri: {
    why: "利尻島・礼文島周辺の海域で採れます。透明で上品なだしが取れることで知られ、京都の料亭でも使われているとされています（農林水産省、北海道庁資料）。利尻富士からの豊富なミネラルを含む海水が、上質な昆布を育むとされています。",
    features: ["透明で澄んだだし", "上品で繊細な旨み", "塩味が控えめ"],
    bestFor: ["お吸い物", "茶碗蒸し", "湯豆腐", "懐石料理"],
    sources: [
      { name: "農林水産省「特集 こんぶ」", url: "https://www.maff.go.jp/j/pr/aff/2203/spe2_01.html" },
      { name: "北海道庁「北海道の水産業 こんぶ」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/" },
      { name: "北海道ぎょれん「北海道のこんぶ」", url: "https://www.gyoren.or.jp/konbu/" },
    ],
  },
  rausu: {
    why: "知床半島の羅臼町沿岸で採れます。「昆布の王様」とも呼ばれ、濃厚で旨みの強いだしが特徴とされています。知床の豊かな海洋環境が育む昆布として、水産庁の資料でも紹介されています。",
    features: ["濃厚で力強い旨み", "黄色がかった琥珀色のだし", "甘みが強い", "香りが豊か"],
    bestFor: ["煮物", "おでん", "鍋料理", "昆布締め"],
    sources: [
      { name: "農林水産省「特集 こんぶ」", url: "https://www.maff.go.jp/j/pr/aff/2203/spe2_01.html" },
      { name: "水産庁「水産物についての知識」", url: "https://www.jfa.maff.go.jp/" },
      { name: "北海道庁「北海道の水産業 こんぶ」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/" },
      { name: "北海道ぎょれん「北海道のこんぶ」", url: "https://www.gyoren.or.jp/konbu/" },
    ],
  },
  hidaka: {
    why: "日高地方の太平洋沿岸で採れます。繊維が柔らかく、だしを取った後もそのまま食べられるため、家庭料理で広く使われています。北海道庁の水産資料によると、日高地方は北海道の主要な昆布産地の一つです。",
    features: ["柔らかく食べやすい", "だしにも煮物にも使える", "価格が手頃", "初心者におすすめ"],
    bestFor: ["煮物", "昆布巻き", "おでん", "家庭のだし全般"],
    sources: [
      { name: "農林水産省「特集 こんぶ」", url: "https://www.maff.go.jp/j/pr/aff/2203/spe2_01.html" },
      { name: "北海道庁「北海道の水産業 こんぶ」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/" },
      { name: "北海道水産林務部「北海道お魚図鑑」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/osazu/oz01fis/oz010fi.html" },
      { name: "北海道ぎょれん「北海道のこんぶ」", url: "https://www.gyoren.or.jp/konbu/" },
    ],
  },
  makombu: {
    why: "函館近海（道南地区）で採れます。上品な甘みのあるだしが特徴で、大阪の昆布文化を支えてきたとされています。農林水産省の資料では、真昆布は日本で最も代表的な昆布の一つとして紹介されています。",
    features: ["上品な甘みのだし", "肉厚で幅広", "昆布締めに最適"],
    bestFor: ["鍋料理", "昆布締め", "佃煮", "うどんだし"],
    sources: [
      { name: "農林水産省「特集 こんぶ」", url: "https://www.maff.go.jp/j/pr/aff/2203/spe2_01.html" },
      { name: "北海道庁「北海道の水産業 こんぶ」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/" },
      { name: "北海道水産林務部「北海道お魚図鑑」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/osazu/oz01fis/oz010fi.html" },
      { name: "北海道ぎょれん「北海道のこんぶ」", url: "https://www.gyoren.or.jp/konbu/" },
    ],
  },
  gagome: {
    why: "函館近海の限られた海域でのみ採れる希少な昆布です。表面にカゴの目のような凹凸模様があるのが名前の由来です。強い粘りが特徴で、とろろ昆布や松前漬けの材料として使われています。北海道水産林務部の資料でも、道南地域の特産として紹介されています。",
    features: ["強い粘り気", "希少性が高い", "独特の凹凸模様", "とろろ・松前漬けに向く"],
    bestFor: ["納豆昆布", "松前漬け", "サラダのトッピング", "とろろ昆布"],
    sources: [
      { name: "農林水産省「特集 こんぶ」", url: "https://www.maff.go.jp/j/pr/aff/2203/spe2_01.html" },
      { name: "北海道水産林務部「北海道お魚図鑑」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/osazu/oz01fis/oz010fi.html" },
      { name: "北海道庁「北海道の水産業 こんぶ」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/" },
      { name: "北海道ぎょれん「北海道のこんぶ」", url: "https://www.gyoren.or.jp/konbu/" },
    ],
  },
  nagakombu: {
    why: "釧路・根室地方の太平洋沿岸で採れます。名前の通り非常に長く、煮崩れしにくいため、昆布巻きの材料として広く使われています。農林水産省の資料では、長昆布は生産量が多く加工用途に広く利用される昆布として紹介されています。",
    features: ["非常に長い", "煮崩れしにくい", "リーズナブル", "業務用に最適"],
    bestFor: ["昆布巻き", "煮物", "おでん", "業務用だし"],
    sources: [
      { name: "農林水産省「特集 こんぶ」", url: "https://www.maff.go.jp/j/pr/aff/2203/spe2_01.html" },
      { name: "農林水産省「漁業・養殖業生産統計」", url: "https://www.maff.go.jp/j/tokei/kouhyou/kaimen_gyosei/" },
      { name: "北海道庁「北海道の水産業 こんぶ」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/" },
      { name: "北海道ぎょれん「北海道のこんぶ」", url: "https://www.gyoren.or.jp/konbu/" },
    ],
  },
  hosome: {
    why: "函館近海で採れる昆布で、名前の通り幅が細いのが特徴です。粘りが非常に強く、おぼろ昆布・とろろ昆布の主原料として使われています。北海道水産林務部の資料でも、道南地域で採れる加工向け昆布として紹介されています。",
    features: ["幅が細い", "粘りが非常に強い", "とろろ昆布の原料", "おぼろ昆布の原料"],
    bestFor: ["とろろ昆布", "おぼろ昆布", "酢昆布"],
    sources: [
      { name: "農林水産省「特集 こんぶ」", url: "https://www.maff.go.jp/j/pr/aff/2203/spe2_01.html" },
      { name: "北海道水産林務部「北海道お魚図鑑」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/osazu/oz01fis/oz010fi.html" },
      { name: "北海道庁「北海道の水産業 こんぶ」", url: "https://www.pref.hokkaido.lg.jp/sr/ske/" },
      { name: "北海道ぎょれん「北海道のこんぶ」", url: "https://www.gyoren.or.jp/konbu/" },
    ],
  },
};
