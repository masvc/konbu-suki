# 分析（2026-11-19 夜・1枠目）

集計期間: Search Console 2026-10-19〜2026-11-16（28日。GSC は3日遅れ）。GA4 は 28daysAgo〜today。
URL 検査は 2026-11-19 23:06、AI引用チェックは 23:17 実行（gemini-2.5-flash、40キーワード、**今夜から1語2回取り**。11-19 公開の kobujime-beef の「牛肉 昆布締め」が増えた）。
`docs/inbox.md` の未処理は **なし**。

比較の相手: GSC は前夜の分析枠のスナップショット（`data/seo-snapshots/2026-11-18.json`、10-18〜11-15）。
インデックスと AI 引用は前夜 23:06 / 23:14 の取得（`docs/night/2026-11-18/`）。前夜の5枠（分析・改善・新規・点検・仕上げ）はすべてコミットが残っている（git log で確認）。

指示文の前提（「33ページすべてが未検出」）は古い。GSC には28日で表示971が出ている。
数字があるので GSC と AI 引用の両方を根拠にした。

## 先に結論

- **GSC は表示 838 → 971（+133）、クリック 23 → 25（+2）**、平均 13.8 → 13.6位（前夜の28日窓との比較。窓が1日進んだ分）。前期間（09月中旬〜10月中旬）は表示0・クリック0の記録のまま。
- **shiokombu-guide が表示146・6.5位・クリック0**（前夜127）。「塩昆布 塩分」は**34表示・3.8位でクリック0**。最終クロールは 11-07 のまま。打ち手は人の再クロール依頼（15夜目）。
- **インデックス: 登録 31/42。検出 - インデックス未登録 5件・クロール済み - インデックス未登録 0件**・未認識 6件。
  **kombu-diet-oyatsu が新しく登録された**（最終クロール 2026-11-18T15:17Z）。中身を見たうえで見送られた記事は今夜も0。
- **AI引用（1回目）は 6/40**（前夜 8/39）。2回取りでは **毎回引用 4・一部だけ 4・引用なし 32・取得失敗 0**。
  前夜引用された8語は、今夜も8語とも少なくとも1回は引用された（外れた語は無い）。前夜の2語の「減り」は1回目に出なかっただけで、2回目には出ている。**「引用なし → 毎回引用」の動きは無い**（2回取りは今夜が初めてで、前夜の基準が無い）。
- **GA4: アフィリクリックは28日で11件（楽天5・Amazon6）**。前夜8件から+3、新しく /product/66（Amazon 2・楽天1）。**記事を入口にしたクリックは今夜も0件**。AI流入は0。
- 健康・安全で新しく直すものは見つからなかった。前夜の kobujime-hare・kobujime-tips の日持ちの出典は 11-19 改善枠で済み。

## 1. Search Console

`seo-opportunities.ts` / `search-console.ts queries` / `search-console.ts pages` / `search-console.ts queries --page <path>` / `seo-snapshot.ts`（`data/seo-snapshots/2026-11-19.json`、`compare` で前夜と比較）。

| 項目 | 今期（10-19〜11-16） | 前夜の窓（10-18〜11-15） | 前期間 |
| --- | ---: | ---: | ---: |
| クリック | 25 | 23 | 0（記録） |
| 表示 | 971 | 838 | 0（記録） |
| CTR | 2.6% | 2.7% | - |
| 平均掲載順位 | 13.6 | 13.8 | - |
| CTR課題ページ（imp50+ & CTR<5%） | 3 | 2 | - |
| 順位改善チャンス（8〜20位 & imp30+） | 4 | 4 | - |
| クエリ機会損失（imp20+ & CTR<5% & 20位以内） | 3 | 2 | - |
| GSC未検出ページ | 16/56 | 17/55 | - |

前期間は今夜 GSC で取ったものではない。11-15 夜に「56日窓 − 28日窓 = 0」で確かめた記録による（`search-console.ts` に前期間の引数は無い）。

### ページ（前夜 → 今夜。表示・順位・クリック）

| ページ | 前夜（10-18〜11-15） | 今夜（10-19〜11-16） | 最終クロール |
| --- | --- | --- | --- |
| /guide/shiokombu-guide | 127・6.6位・0 | **146・6.5位・0** | 11-07 |
| /guide/kombu-storage | 77・10.4位・1 | **95・10.1位・1**（CTR 1.1%） | 11-14 |
| /product/259（六彩だし） | 78・9.4位・4 | 86・9.3位・4 | - |
| /guide/kombu-water | 34・19.9位・1 | 43・17.3位・1 | 11-10 |
| /product/314 | 40・4.3位・6 | 41・4.3位・6 | - |
| /guide/kobujime-hirame | 31・29.6位・0 | 36・26.9位・0 | 11-09 |
| /guide/how-to-make-dashi | 30・11.2位・0 | 34・11.0位・0 | 11-08（下の注） |
| /guide/kombu-oyatsu-guide | 19・7.1位・1 | 29・8.7位・2 | 11-12 |
| /category/shiokombu | 23・10.7位・1 | 26・10.4位・1 | - |
| /guide/kobujime-tips | 23・6.9位・1 | 25・6.9位・1 | 11-07 |
| /category/kombucha | 11・21.0位・0 | 14・18.8位・0 | - |

### ページ別のクエリ内訳（`--page` で取った）

| ページ | 見えたクエリ（表示・順位） | 見えない（匿名）表示 |
| --- | --- | ---: |
| shiokombu-guide（146） | 塩昆布 塩分 34・3.8 / 塩ふき昆布 塩昆布 違い 21・8.8 / 塩昆布 塩分量 15・8.7 / 塩昆布 塩ふき昆布 違い 5・7.2 / 塩昆布塩分 5・2.8 / ほか3語 各1〜2 | 約61 |
| kombu-storage（95） | 昆布水 賞味期限 3・9.0 / 昆布 常温保存 1・7.0 | 91 |
| kombu-water（43） | 昆布水 1・36 / 昆布水 作り方 1・52 / 昆布水の作り方 1・52 / 昆布水作り方 1・54 / 昆布水 使い方 1・75 | 38 |
| how-to-make-dashi（34） | 昆布水の作り方 1・79 | 33 |
| kobujime-hirame（36） | ヒラメ 昆布締め 時間 2・13.0 / 昆布 締め 2・84 / ヒラメ 昆布締め 日持ち 1・23 / ほか表記ゆれ3語 各1 | 28 |

- shiokombu-guide は**見えている表示85のうち、塩分の語が約57、違いの語が約27**。どれも1ページ目に出ていてクリック0。新しい title（塩分の数字を前に出した 11-14 の版）は最終クロール 11-07 のため Google に見えていない、という前夜の見立てが続く
- kombu-water は前夜と同じ5語の顔ぶれで、表示34 → 43 の増えた9は全部匿名。順位 19.9 → 17.3 の戻りも、どの語が動いたのかは言えない
- kombu-storage・how-to-make-dashi は表示の9割以上が匿名で、クエリから打ち手を決められない
- **how-to-make-dashi の最終クロールが 11-07 → 11-08 20:54 に変わった。** 前夜の URL 検査は 11-07 15:03 と返していた。11-17 の title 変更より前の日付なので、title は今夜も未反映。API の値がさかのぼって変わった理由は分からない
- **kombu-storage の判断日の訂正:** 「GSC にクロール後の日が7日ぶん入るのは 11-21 の分析」としていたが、GSC の最新日は実行日の3日前（今夜は 11-16）。11-14 から7日ぶん（〜11-20）が入るのは **11-23 夜の分析**。11-21 では5日ぶん

### クエリ（目立つもの）

| クエリ | 表示 | クリック | 順位 | ページ |
| --- | ---: | ---: | ---: | --- |
| 六彩だし | 41 | 0 | 9.0 | /product/259（クエリ機会損失・コンテンツギャップの唯一の行） |
| 塩昆布 塩分 | 34 | 0 | **3.8** | shiokombu-guide |
| 塩ふき昆布 塩昆布 違い | 21 | 0 | 8.8 | shiokombu-guide |
| 塩昆布 塩分量 | 15 | 0 | 8.7 | shiokombu-guide |
| 六彩だし 使い方 | 15 | 4 | 3.9 | /product/259 |
| おせち 昆布巻き | 8 | 0 | 64.1 | kombumaki |
| 都こんぶ 酢こんぶ 違い | 8 | 1 | 5.3 | （ページ不明。miyako-kombu は未登録） |
| 塩昆布 おすすめ | 7 | 1 | 13.4 | /category/shiokombu（推定） |
| 日高昆布 | 7 | 0 | 18.4 | /origin/hidaka（推定） |

新しくクリックが付いたクエリは「酢こんぶ都 こんぶ違い」1件だけ。

## 2. GA4

`ga4-report.ts` / `ai-quality.ts` / `ai-traffic.ts`。

| 項目 | 28日 | 前夜 |
| --- | ---: | ---: |
| アクティブユーザー | 124 | 117 |
| セッション | 134 | 127 |
| PV | 161 | 154 |
| エンゲージセッション | 42 | 38 |
| Organic Search | 47セッション（google 35・yahoo 11・bing 1） | 41 |
| Direct | 80セッション（エンゲージ9） | 79 |
| AI流入 | **0** | 0 |

記事のページで PV が2以上あったのは kombu-oyatsu-guide 3・kombu-water 3・kobujime-tips 2 だけ。記事の流入はまだ1桁。

### アフィリリンクのクリック（CTA_EVENTS）

楽天と Amazon は別に取れた（`ai-quality.ts` の [2b]）。

| イベント | 押したページ | 入口ページ | 回数 |
| --- | --- | --- | ---: |
| rakuten_click | /product/131 | /product/131 | 3 |
| amazon_click | /product/131 | /product/131 | 2 |
| amazon_click | /product/66 | /product/66 | **2（新）** |
| amazon_click | /product/314 | /product/314 | 1 |
| amazon_click | /product/74 | /product/74 | 1 |
| rakuten_click | /product/314 | /product/314 | 1 |
| rakuten_click | /product/66 | /product/66 | **1（新）** |
| **計** | | | **楽天5・Amazon6（11件）** |

- 前夜8件 → 11件。増えた3件は /product/66 を入口にしたセッション
- **記事を入口にしたクリックは0件**（6夜続けて）。記事 → 商品の導線が無いことの裏付けで、商品カードの仕組み（人の判断）の根拠が1夜ぶん増えた
- 前期間比は今夜も取れなかった。`ai-quality.ts` は 28daysAgo〜today の1期間だけを取る作りで、前期間の引数が無い

## 3. インデックス（URL 検査 API）

`index-status.ts` → [index-status.md](index-status.md)

| 状態 | 件数 | 前夜 |
| --- | ---: | ---: |
| 送信して登録されました | 31 | 30 |
| **検出 - インデックス未登録** | **5** | 8 |
| **クロール済み - インデックス未登録** | **0** | 0 |
| URL が Google に認識されていません | 6 | 3 |
| 計 | 42 | 41 |

- **検出 - 未登録 5件**（まだ取得されていない。待てば進む側）: kombu-seaweed-types・kombu-life-cycle・toshikoshi-soba-dashi・kombu-processed-foods・miyako-kombu
- **クロール済み - 未登録 0件**（中身を見て見送られた記事は無い。強化が効く側の候補は今夜も無し）
- 未認識 6件: kobujime-beef（11-19 公開・初回）・kombu-tsukudani・nanakusa-gayu-dashi・kombu-katsuo-dashi・kombu-comparison・otsumami-kombu
- 前夜からの動き:
  - **kombu-diet-oyatsu が 検出 → 登録**（最終クロール 2026-11-18T15:17Z）
  - kombu-life-cycle・toshikoshi-soba-dashi が 未認識 → 検出（前夜の戻りがまた戻った）
  - nanakusa-gayu-dashi・kombu-katsuo-dashi・kombu-comparison・otsumami-kombu が 検出 → **未認識に戻った**（最終クロールはどれも「未」）。11-13・11-15・11-18 夜と同じ揺れの形で、後退とは言えない
- 未登録の11件の数え方: 検出5 + 未認識6。未認識が3 → 6 に増えたのは、新規1本と揺れ4本（−2本）の差
- 登録済みのうち最終クロールが 11-07 のままの記事: kombumaki・shiokombu-guide・kobujime・kobujime-hare・kobujime-tips・kobujime-vegetables・kobujime-tai・how-to-choose-kombu・kombu-types・kombu-recipes・kombu-history・kombu-production・kombu-nutrition・tororo-oboro（how-to-make-dashi は 11-08 に変わった）
- 優先5本（自動）: kombu-processed-foods・toshikoshi-soba-dashi・kombu-katsuo-dashi・kombu-comparison・kombu-life-cycle（前夜と同じ顔ぶれ）

## 4. AI引用チェック

`ai-citation-check.ts`（1語2回）→ [ai-citation.md](ai-citation.md) / [ai-citation.json](ai-citation.json)。トークン 106,560（80回）。

**1回目 6/40 引用（取得失敗0）。** 前夜 6/38 → 8/39 → 今夜 6/40。

| 狙う語 | 記事 | 11-18（1回） | 11-19（2回） | 引用されたページ |
| --- | --- | --- | --- | --- |
| 昆布茶 使い方 | kombu-cha-uses | 引用 | **毎回** 2/2 | 狙いどおり |
| 昆布水 作り方 | kombu-water | 引用 | **毎回** 2/2 | 狙いどおり（4夜連続） |
| おしゃぶり昆布 おすすめ | oshaburi-kombu | 引用 | **毎回** 2/2 | 狙いどおり（2回目は oyatsu-guide も） |
| 昆布 おやつ ダイエット | kombu-diet-oyatsu | 引用 | **毎回** 2/2 | **2回とも別ページ**（oyatsu-guide）。本人は今夜登録された |
| 昆布 保存方法 | kombu-storage | 引用 | 一部 1/2 | 狙いどおり |
| 真昆布 | ma-kombu | 引用 | 一部 1/2 | 別ページ（/origin/makombu） |
| 昆布 おやつ おすすめ | kombu-oyatsu-guide | 引用 | 一部 1/2 | 狙いどおり |
| おつまみ昆布 おすすめ | otsumami-kombu | 引用 | 一部 1/2 | 別ページ（oyatsu-guide・/category/snack） |

- 前夜の8語はそろって残った。1回目だけで数えると2語減ったように見えるが、2回目には出ている。**1回取りなら「2語外れた」と読んでいたところで、2回取りの効き目が初日から出た**
- 「毎回引用」の4語のうち、狙いどおりのページで毎回引かれたのは kombu-cha-uses・kombu-water・oshaburi-kombu の3本
- 本文を変えた記事（11-19 の kobujime-hare・kobujime-tips・kobujime-arrange・kombu-tsukudani、新規の kobujime-beef）はどれもクロール前。今夜の結果は打ち手の効果を測るものではない
- 次夜からは、前夜の json の `runs` と比べて「引用なし（0/2）→ 毎回引用（2/2）」の語だけを効果として数える。今夜がその基準

### 引用されていない語のうち、競合の顔ぶれと展開クエリへの答え

範囲内（`src/lib/guides.ts` の記事の行範囲）を grep で数えた。

| 狙う語 | 記事 | 引用元の数・主な顔ぶれ | 展開クエリで答えていないもの |
| --- | --- | --- | --- |
| 昆布 育ち方 | kombu-life-cycle | 10: kombu.or.jp・fujicco・ogurayayamamoto・kurakon・suisan-navi | 「昆布 生態」「昆布 成長条件」。範囲内の「生育」「海水温」「成長条件」「生態」**0件**（「養殖」は多数） |
| 昆布 わかめ ひじき 違い | kombu-seaweed-types | **17**（今夜の最多）: kombu.or.jp・maff.go.jp・nippon-wakame・iwate-wakame・awa.or.jp | 「昆布 わかめ ひじき 用途 栄養」。範囲内の「用途」**0件**（「栄養」は1件） |
| 昆布締め 食べ方 | kobujime-arrange | 9: kanemitu・keison・tankuma・hokurikumeihin | 「昆布締め 注意点」。範囲内の「注意点」0件。11-19 に直したばかりで触らない |
| 牛肉 昆布締め | kobujime-beef | 13: cuisine-kingdom・macaro-ni・delishkitchen・centralfoods・ogurayayamamoto | 「メリット」0件（「何が変わる」の節はある）。11-19 公開・未認識 |
| 昆布ロード | kombu-history | 12: kombu.or.jp・gyoren・gov-online・mizu.gr.jp | 「意義」0件（「役割」「貿易」はある）。急がない |
| 正月 昆布締め | kobujime-hare | 14: tankuma・maff.go.jp・mi-journey・houkon | 「食べる理由」は「意味」「なぜ」で答えている。クロール待ち（11-07） |
| 昆布巻き 作り方 | kombumaki | 14: delishkitchen・kikkoman・kurakon・kombu.or.jp・pref.iwate | 「簡単」「コツ」は 11-10 に足した。クロール待ち（11-07）。**9夜続けて引用なし** |
| 昆布だし 取り方 | how-to-make-dashi | 10: kombu.or.jp・sirogohan・odashiya・kyounoryouri | 「水出し 煮出し 違い」は答えている（範囲内に多数）。クロール待ち |
| 塩昆布 使い方 | shiokombu-guide | 11: delishkitchen・kurakon・kombu.or.jp・kikkoman・fujicco | 「簡単」「アイデア」は言い回しの問題。クロール待ちなので触らない |
| ヒラメ 昆布締め | kobujime-hirame | 14: 寿司店・釣り情報のサイトが多い | 「目的」「特徴」は答えている。クロール待ち（11-09） |

全体の顔ぶれは kombu.or.jp（16語）・delishkitchen（15）・odashi.co.jp（12）・tankuma（10）・odashiya（10）・sirogohan（8）・kurakon（8）。前夜とほぼ同じ。
展開クエリの「効能」「健康効果」「ダイエット 効果」（gagome・kombu-water・kombu-nutrition・おやつ系）は CLAUDE.md の方針で書かない。

## 5. 伸びしろのある記事トップ10

| # | 記事 | 打ち手 | 根拠の数字 |
| --- | --- | --- | --- |
| 1 | **shiokombu-guide** | 人の再クロール依頼（title は 11-14 に直し済み）。本文は触らない | GSC **146表示・6.5位・クリック0**（CTR課題の先頭、前夜127）。「塩昆布 塩分」**34表示・3.8位・0**、「塩ふき昆布 塩昆布 違い」21・8.8位。最終クロール 11-07 で新 title が未反映。AI「塩昆布 使い方」0/2（11ドメイン） |
| 2 | **kombumaki** | 人の再クロール依頼。**締め切り11月末（残り11日）** | GSC「おせち 昆布巻き」8・64.1位。AI「昆布巻き 作り方」0/2・**9夜続けて引用なし**（14ドメイン、kombu.or.jp・pref.iwate を含む）。11-10 の強化が最終クロール 11-07 で未反映 |
| 3 | **kobujime-hare** | 人の再クロール依頼。本文は 11-19 に直したので触らない | 季節（12月上旬に立ち上がり）。AI「正月 昆布締め」0/2（14ドメイン、maff.go.jp を含む）。最終クロール 11-07。11-19 の日持ちの出典の修正も未反映 |
| 4 | **kombu-life-cycle** | 記事で使っている出典（協会「昆布って何？」・道総研「北水試だより96」）を開き直し、生育の条件（水温・水深など）が書かれていれば節か FAQ 1問。無ければ「資料に無い」と記録 | AI「昆布 育ち方」0/2（10ドメイン）。展開「昆布 生態」「昆布 成長条件」に対し範囲内の「生育」「海水温」「成長条件」「生態」0件。検出 - 未登録で優先5本の5番目。**初回クロール前に直せば1回で載る** |
| 5 | **kombu-seaweed-types** | 記事の出典（農水省「海藻製品」・京都府）に用途の記載があれば、昆布・わかめ・ひじきの比較表に「主な用途」の列か FAQ 1問 | AI「昆布 わかめ ひじき 違い」0/2、**引用元17で今夜の最多**（maff.go.jp・kombu.or.jp を含む）。展開「用途 栄養」に対し範囲内の「用途」0件。検出 - 未登録 |
| 6 | **how-to-make-dashi** | 人の再クロール依頼（11-17 の title 変更が未反映） | GSC **34表示・11.0位・0**（8〜20位の帯）。AI「昆布だし 取り方」0/2（10ドメイン、kombu.or.jp）。最終クロール 11-08。展開「水出し 煮出し 違い」には答えている |
| 7 | **kombu-storage** | 触らない。**11-23 夜の分析**で判断（クロール後の7日ぶんが GSC に入る日。上の訂正） | GSC **95表示・10.1位・1・CTR 1.1%**（CTR課題2番目・8〜20位）。AI「昆布 保存方法」1/2（狙いどおり）。10位以内に入るかの境目 |
| 8 | **kobujime-hirame** | 人の再クロール依頼（11-14 の由来の段落が未反映）。本文は触らない | GSC **36表示・26.9位・0**。「ヒラメ 昆布締め 時間」2・13.0位、「日持ち」1・23位。AI 0/2（14ドメイン）。最終クロール 11-09 |
| 9 | **kombu-diet-oyatsu・otsumami-kombu** | diet-oyatsu は今夜登録された。中身は触らず、AI の引用が oyatsu-guide から本人に移るかを見る。otsumami は人の URL 検査 | AI「昆布 おやつ ダイエット」**2/2 とも別ページ（oyatsu-guide）**。「おつまみ昆布 おすすめ」1/2 で別ページ。otsumami は検出 → 未認識に戻った |
| 10 | **kombu-water** | 触らない。`--page` の内訳を毎夜とって比べる | GSC 43表示・17.3位・1（8〜20位の帯）。見えるクエリは36〜75位の5語、残り38表示は匿名。AI「昆布水 作り方」**2/2 毎回引用（狙いどおり）** |

記事ではないが、**/product/259（六彩だし）** は「六彩だし」41表示・9.0位・クリック0でクエリ機会損失・コンテンツギャップの唯一の行。説明文の取り込みは DB 書き込みなので人の判断（next-actions の「人の判断」に既出）。

### トップ10から外したもの

- kobujime-arrange（「注意点」0件）・kombu-tsukudani: 11-19 に直したばかりでクロール前。重ねて直すと効果が測れない。arrange の「注意点」は中に置き、クロール後に見る
- kobujime-beef（「メリット」0件）: 11-19 公開・未認識。「何が変わる」の節があり、語の言い回しだけの差。低に置く
- toshikoshi-soba-dashi・nanakusa-gayu-dashi: 展開（材料・作り方・意味）には答えている。打ち手は登録を待つこと（人の URL 検査）
- kombu-nutrition・gagome-kombu・kombu-water・おやつ系の「健康効果」「効能」「効果」: CLAUDE.md の方針で書かない
