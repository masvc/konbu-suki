/**
 * 記事で使っている出典の一覧。
 *
 * /about/data で公開する。実際に開いて内容を確認したものだけを載せる。
 * docs/topic-map.md の「確認済みの出典」と対応するが、あちらには「何が書いて
 * いないか」といった作業用のメモも入る。公開するのはこちら。
 * 新しい出典を使ったときは両方に足す。
 */
export type Source = {
  publisher: string;
  title: string;
  url: string;
  /** この出典をどの話題で使っているか */
  usedFor: string;
};

export const SOURCES: Source[] = [
  {
    publisher: "文部科学省",
    title: "日本食品標準成分表",
    url: "https://www.mext.go.jp/a_menu/syokuhinseibun/",
    usedFor: "栄養成分の数値",
  },
  {
    publisher: "厚生労働省",
    title: "日本人の食事摂取基準",
    url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/kenkou/eiyou/syokuji_kijyun.html",
    usedFor: "ヨウ素の耐容上限量",
  },
  {
    publisher: "農林水産省",
    title: "にっぽん伝統食図鑑（昆布〆・とろろ昆布・おぼろ昆布・昆布巻き）",
    url: "https://www.maff.go.jp/j/keikaku/syokubunka/traditional-foods/",
    usedFor: "地域ごとの昆布料理、昆布締めの作り方、加工品の産地",
  },
  {
    publisher: "農林水産省",
    title: "うちの郷土料理（クーブイリチー）",
    url: "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/",
    usedFor: "沖縄の昆布料理",
  },
  {
    publisher: "農林水産省 中国四国農政局",
    title: "「中国四国地域食育交流会in広島」を開催しました",
    url: "https://www.maff.go.jp/chushi/syokuiku/katudou/tori2808.html",
    usedFor: "昆布だしの水出し・煮出しの時間と温度",
  },
  {
    publisher: "水産庁",
    title: "水産白書",
    url: "https://www.jfa.maff.go.jp/j/kikaku/wpaper/index.html",
    usedFor: "生産・流通の状況",
  },
  {
    publisher: "北海道",
    title: "水産林務部「ガゴメ（篭目）」",
    url: "https://www.pref.hokkaido.lg.jp/sr/gid/fis094.html",
    usedFor: "がごめ昆布の分布・形・漁期",
  },
  {
    publisher: "一般社団法人 日本昆布協会",
    title: "こんぶネット",
    url: "https://kombu.or.jp/",
    usedFor: "昆布の種類と加工品、保存方法、だしがらの活用、歴史、昆布締めのレシピ",
  },
  {
    publisher: "北海道ぎょれん",
    title: "北海道のこんぶ",
    url: "https://www.gyoren.or.jp/konbu/",
    usedFor: "北海道産7種の特徴と用途",
  },
];
