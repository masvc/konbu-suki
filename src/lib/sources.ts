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
    title: "日本人の食事摂取基準（2025年版）ミネラル（微量ミネラル）",
    url: "https://www.mhlw.go.jp/content/10904750/001316469.pdf",
    usedFor: "ヨウ素の耐容上限量（成人3,000μg/日・妊婦授乳婦2,000μg/日）と、習慣的な摂取に適用される旨の留意事項",
  },
  {
    publisher: "農林水産省",
    title: "にっぽん伝統食図鑑（昆布〆・とろろ昆布・おぼろ昆布・昆布巻き）",
    url: "https://www.maff.go.jp/j/keikaku/syokubunka/traditional-foods/",
    usedFor: "地域ごとの昆布料理、昆布締めの作り方、加工品の産地",
  },
  {
    publisher: "農林水産省",
    title: "うちの郷土料理（クーブイリチー・昆布巻き 富山県・昆布〆 富山県）",
    url: "https://www.maff.go.jp/j/keikaku/syokubunka/k_ryouri/",
    usedFor: "沖縄の昆布料理、富山の昆布巻きの具と作り方、富山の昆布締めに使う昆布と時間",
  },
  {
    publisher: "農林水産省 中国四国農政局",
    title: "「中国四国地域食育交流会in広島」を開催しました",
    url: "https://www.maff.go.jp/chushi/syokuiku/katudou/tori2808.html",
    usedFor: "昆布だしの水出し・煮出しの時間と温度",
  },
  {
    publisher: "鳥取県（協力: 鳥取短期大学）",
    title: "出汁の取り方",
    url: "https://www.pref.tottori.lg.jp/224613.htm",
    usedFor: "だしの種類ごとの使用量・うま味成分・取り方・用途",
  },
  {
    publisher: "農林水産省",
    title: "和食ワールドチャレンジ「だし・うま味について」",
    url: "https://www.maff.go.jp/j/yusyutu_kokusai/washoku-world-challenge/learning_03.html",
    usedFor: "昆布と鰹節を合わせたときのうま味の相乗効果",
  },
  {
    publisher: "厚生労働省",
    title: "アニサキスによる食中毒を予防しましょう",
    url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000042953.html",
    usedFor: "昆布締めの酢や塩では寄生虫が死なないこと、寄生が見られる魚",
  },
  {
    publisher: "厚生労働省",
    title: "カンピロバクター食中毒予防について（Q&A）",
    url: "https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/kenkou_iryou/shokuhin/syokuchu/campylobacterqa.html",
    usedFor: "鶏肉の昆布締めを加熱して食べる理由",
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
    publisher: "北海道",
    title: "水産林務部「オニコンブ（鬼昆布）」",
    url: "https://www.pref.hokkaido.lg.jp/sr/gid/fis090.html",
    usedFor: "羅臼昆布の分布・形・漁期・検査規格上の名前・用途",
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
  {
    publisher: "サライ.jp（小学館）",
    title: "自宅で「平目の昆布締め」を作るコツ【プロ直伝の技とコツ】",
    url: "https://serai.jp/gourmet/348469",
    usedFor: "昆布締めの昆布の湿らせ方と塩加減（寿司職人の話）",
  },
  {
    publisher: "TSURI HACK",
    title: "昆布締め作り方｜実はあの魚介類も意外にイケるんです【釣り人の料理講座】",
    url: "https://tsurihack.com/8515",
    usedFor: "昆布締めの置きすぎと、厚みごとの時間の目安",
  },
  {
    publisher: "macaroni",
    title: "放っておくだけ。チーズは「昆布締め」 すると至高のもっちり食感に進化",
    url: "https://macaro-ni.jp/72022",
    usedFor: "昆布締めの昆布を戻しすぎないこと",
  },
];
