# 分析（2026-11-18 夜・1枠目）

集計期間: Search Console 2026-10-18〜2026-11-15（28日。GSC は3日遅れ）。GA4 は 28daysAgo〜today。
URL 検査は 2026-11-18 23:06、AI引用チェックは 23:14 実行（gemini-2.5-flash、39キーワード。11-18 公開の kombu-tsukudani の「昆布 佃煮」が増えた）。
`docs/inbox.md` の未処理は **なし**。

比較の相手: GSC は前夜の分析枠のスナップショット（`data/seo-snapshots/2026-11-17.json`、10-17〜11-14）。
インデックスと AI 引用は前夜 23:07 / 23:08 の取得（`docs/night/2026-11-17/`）。前夜の5枠（分析・改善・新規・点検・仕上げ）はすべてコミットが残っている。

指示文の前提（「33ページすべてが未検出」）は古い。GSC には28日で表示838が出ている。
数字があるので GSC と AI 引用の両方を根拠にした。

## 先に結論

- **GSC は表示 690 → 838（+148）、クリック 19 → 23（+4）**（前夜の28日窓との比較。窓が1日進んだ分）。前期間（09月中旬〜10月中旬）は表示0・クリック0の記録のまま。
- **shiokombu-guide が表示127・6.6位・クリック0**（前夜111）。クエリ「塩昆布 塩分」は**30表示・3.9位でクリック0**。
  11-14 の title 変更は最終クロール 11-07 のままで載っていない。打ち手は人の再クロール依頼（14夜目）。
- **インデックス: 登録 30/41。検出 - インデックス未登録 8件・クロール済み - インデックス未登録 0件**・未認識 3件。
  中身を見たうえで見送られた記事は今夜も0。新しく登録された記事は無い。
- **AI引用は 8/39（取得失敗0）。** 前夜 6/38 から+2。新しく引用: 昆布茶 使い方（狙いどおり）・真昆布（別ページ /origin/makombu）・昆布 おやつ おすすめ（狙いどおり）。外れた: ヒラメ 昆布締め。
  kombu-storage・kombu-water・oshaburi-kombu は3夜続けて引用（狙いどおり）。今夜も1語1回で、揺れとの区別は付かない。
- **GA4: アフィリクリックは28日で8件（楽天4・Amazon4）。前夜と同じ。** 記事を入口にしたクリックは0件。AI流入は0。
- **健康・安全で直すもの1つ（前夜から持ち越し）:** kobujime-hare の FAQ「何日前から作り置きできますか」が、日持ちの日数（2〜3日以内）を釣り人向けの料理記事から引いている。
  hirame・chicken は「資料が無い」として日数を出していないので扱いが食い違う。季節記事（締め切り11月末）なので改善枠の先頭に置く。

## 1. Search Console

`seo-opportunities.ts` / `search-console.ts queries` / `search-console.ts pages` / `seo-snapshot.ts`（`data/seo-snapshots/2026-11-18.json`、`compare` で前夜と比較）。

| 項目 | 今期（10-18〜11-15） | 前夜の窓（10-17〜11-14） | 前期間 |
| --- | ---: | ---: | ---: |
| クリック | 23 | 19 | 0（記録） |
| 表示 | 838 | 690 | 0（記録） |
| CTR | 2.7% | 2.8% | - |
| 平均掲載順位 | 13.8 | 14.1 | - |
| CTR課題ページ（imp50+ & CTR<5%） | 2 | 3 | - |
| 順位改善チャンス（8〜20位 & imp30+） | 4 | 2 | - |
| クエリ機会損失（imp20+ & CTR<5% & 20位以内） | 2 | 2 | - |
| GSC未検出ページ | 17/55 | 17/54 | - |

前期間は今夜 GSC で取ったものではない。11-15 夜に「56日窓 − 28日窓 = 0」で確かめた記録による（`search-console.ts` に前期間の引数は無い）。

### ページ（前夜 → 今夜。表示・順位・クリック）

| ページ | 前夜（10-17〜11-14） | 今夜（10-18〜11-15） | 最終クロール |
| --- | --- | --- | --- |
| /guide/shiokombu-guide | 111・6.9位・0 | **127・6.6位・0** | 11-07 |
| /product/259（六彩だし） | 71・9.6位・2 | 78・9.4位・**4** | - |
| /guide/kombu-storage | 59・11.1位・1 | **77・10.4位・1** | 11-14 |
| /product/314 | 38・4.1位・6 | 40・4.3位・6 | - |
| /guide/kombu-water | 21・10.6位・1 | 34・**19.9位**・1 | 11-10 |
| /guide/kobujime-hirame | 25・34.4位・0 | 31・29.6位・0 | 11-09 |
| /guide/how-to-make-dashi | 25・6.3位・0 | 30・**11.2位**・0 | 11-07 |
| /guide/kobujime-tips | 20・6.6位・1 | 23・6.9位・1 | 11-07 |
| /category/shiokombu | - | 23・10.7位・1 | - |
| /guide/kombu-oyatsu-guide | 14・6.6位・1 | 19・7.1位・1 | 11-12 |
| /category/kombucha | - | 11・21.0位・0 | - |

- kombu-water は表示が増えた一方で平均順位が 10.6 → 19.9 に下がった。新しく低い順位のクエリで出始めた分の平均の動きか、本当に下がったかはクエリ別を見ないと言えない（ページ×クエリの内訳は今夜取っていない）。
- how-to-make-dashi も 6.3 → 11.2 位。11-17 の title 変更は最終クロール 11-07 のままで、変更の影響ではない。
- kombu-storage の判断は、GSC にクロール（11-14）後の日が7日ぶん入る 11-21 の分析で行う（11-16 仕上げ枠の訂正を引き継ぐ）。今夜の最新日は 11-15 で、まだ2日ぶん。

### クエリ（目立つもの）

| クエリ | 表示 | クリック | 順位 | 推定ページ |
| --- | ---: | ---: | ---: | --- |
| 六彩だし | 36 | 0 | 9.0 | /product/259（クエリ機会損失・コンテンツギャップの唯一の行） |
| 塩昆布 塩分 | 30 | 0 | **3.9** | shiokombu-guide |
| 塩ふき昆布 塩昆布 違い | 18 | 0 | 8.8 | shiokombu-guide |
| 塩昆布 塩分量 | 15 | 0 | 8.7 | shiokombu-guide |
| 六彩だし 使い方 | 13 | 4 | 3.8 | /product/259 |
| おせち 昆布巻き | 6 | 0 | 63.5 | kombumaki |
| 日高昆布 | 6 | 0 | 19.8 | /origin/hidaka（推定） |
| 塩昆布 おすすめ | 5 | 1 | 15.2 | /category/shiokombu（推定） |
| 都こんぶ 酢こんぶ 違い | 5 | 1 | 5.6 | miyako-kombu か oyatsu-guide（推定。miyako は未登録） |
| 昆布 栄養成分表 | 4 | 0 | 3.5 | kombu-nutrition |
| ヒラメ 昆布締め 時間 | 2 | 0 | 13.0 | kobujime-hirame |

「塩昆布 塩分」系の4語で合計 **約50表示・クリック0、うち30表示は3.9位**。上位に出ていてクリックされないのは、Google に見えている title/description が 11-07 の古い版だから、と見るのがいちばん筋が通る（新しい title は塩分の数字を前に出している）。

## 2. GA4

`ga4-report.ts` / `ai-quality.ts` / `ai-traffic.ts`。

| 項目 | 28日 |
| --- | ---: |
| アクティブユーザー | 117 |
| セッション | 127 |
| PV | 154 |
| エンゲージセッション | 38 |
| Organic Search | 41セッション（google 30・yahoo 10・bing 1） |
| Direct | 79セッション（エンゲージ9） |
| AI流入 | **0** |

### アフィリリンクのクリック（CTA_EVENTS）

楽天と Amazon は別に取れた（`ai-quality.ts` の [2b]）。

| イベント | 押したページ | 入口ページ | 回数 |
| --- | --- | --- | ---: |
| rakuten_click | /product/131 | /product/131 | 3 |
| amazon_click | /product/131 | /product/131 | 2 |
| amazon_click | /product/314 | /product/314 | 1 |
| amazon_click | /product/74 | /product/74 | 1 |
| rakuten_click | /product/314 | /product/314 | 1 |
| **計** | | | **楽天4・Amazon4** |

- 前夜と同じ8件。新しいクリックは無い。
- **記事を入口にしたクリックは0件**（5夜続けて）。記事 → 商品の導線が無いことの裏付けで、商品カードの仕組み（人の判断）の根拠になる。
- 前期間比は今夜も取れなかった。`ai-quality.ts` は 28daysAgo〜today の1期間だけを取る作りで、前期間の引数が無い（next-actions の中に残っている項目）。

## 3. インデックス（URL 検査 API）

`index-status.ts` → [index-status.md](index-status.md)

| 状態 | 件数 | 前夜 |
| --- | ---: | ---: |
| 送信して登録されました | 30 | 30 |
| **検出 - インデックス未登録** | **8** | 9 |
| **クロール済み - インデックス未登録** | **0** | 0 |
| URL が Google に認識されていません | 3 | 1 |
| 計 | 41 | 40 |

- **検出 - 未登録 8件**（まだ取得されていない。待てば進む側）: kombu-seaweed-types・nanakusa-gayu-dashi・kombu-processed-foods・kombu-katsuo-dashi・kombu-comparison・miyako-kombu・otsumami-kombu・kombu-diet-oyatsu
- **クロール済み - 未登録 0件**（中身を見て見送られた記事は無い。強化が効く側の候補は今夜も無し）
- 未認識 3件: kombu-tsukudani（11-18 公開・初回）・kombu-life-cycle・toshikoshi-soba-dashi
- 前夜からの動き: kombu-processed-foods が 未認識 → 検出。kombu-life-cycle・toshikoshi-soba-dashi が 検出 → **未認識に戻った**（最終クロールはどれも「未」）。11-13 夜・11-15 夜と同じ揺れの形で、本当に後退したとは言えない
- 登録済みのうち最終クロールが 11-07 のままの記事: kombumaki・shiokombu-guide・how-to-make-dashi・kobujime・kobujime-hare・kobujime-tips・kobujime-vegetables・kobujime-tai・how-to-choose-kombu・kombu-types・kombu-recipes・kombu-history・kombu-production・kombu-nutrition・tororo-oboro
- 優先5本（自動）: kombu-processed-foods・toshikoshi-soba-dashi・kombu-katsuo-dashi・kombu-comparison・kombu-life-cycle（前夜とほぼ同じ。nanakusa が外れ katsuo-dashi が入った）

## 4. AI引用チェック

`ai-citation-check.ts` → [ai-citation.md](ai-citation.md) / [ai-citation.json](ai-citation.json)。トークン 54,234。

**8/39 引用（取得失敗0）。** 前夜 6/38（取得失敗1）。

| 狙う語 | 記事 | 11-17 | 11-18 | 引用されたページ |
| --- | --- | --- | --- | --- |
| 昆布 保存方法 | kombu-storage | 引用 | 引用 | 狙いどおり（3夜連続） |
| 昆布水 作り方 | kombu-water | 引用 | 引用 | 狙いどおり（3夜連続） |
| おしゃぶり昆布 おすすめ | oshaburi-kombu | 引用 | 引用 | 狙いどおり＋oyatsu-guide |
| おつまみ昆布 おすすめ | otsumami-kombu | 引用 | 引用 | **別ページ**（oyatsu-guide。本人は検出-未登録） |
| 昆布 おやつ ダイエット | kombu-diet-oyatsu | 引用 | 引用 | **別ページ**（oyatsu-guide。本人は検出-未登録） |
| 昆布茶 使い方 | kombu-cha-uses | なし | **引用** | 狙いどおり |
| 真昆布 | ma-kombu | なし | **引用** | **別ページ**（/origin/makombu） |
| 昆布 おやつ おすすめ | kombu-oyatsu-guide | なし | **引用** | 狙いどおり |
| ヒラメ 昆布締め | kobujime-hirame | 引用 | **なし** | - |

本文を変えたのは 11-18 未明の3本（kobujime-chicken・toshikoshi-soba-dashi・kobujime-arrange）で、どれもクロール前（chicken の最終クロールは 11-11、toshikoshi は未認識、arrange は 11-10）。今夜の出入り4語はどれもページの変更とは結び付かない。**1語2回の取得（next-actions 高）が4夜続けて未着手で、効果の判断ができない状態が続いている。**

### 引用されていない語のうち、競合の顔ぶれと展開クエリへの答え

範囲内（`src/lib/guides.ts` の記事の行範囲）を grep で数えた。

| 狙う語 | 記事 | 引用元の数・主な顔ぶれ | 展開クエリで答えていないもの |
| --- | --- | --- | --- |
| 昆布締め 食べ方 | kobujime-arrange | 16: keison・kanemitu・kyokonbu・tankuma・orangepage | 「薬味」の語が0件（わさび・ねぎは本文に多数。語だけの問題） |
| 昆布 佃煮 | kombu-tsukudani | 14: nissui・kikkoman・kurakon・kobayashi-foods・ninben | 「歴史」0件（11-18 公開。未認識） |
| 塩昆布 使い方 | shiokombu-guide | 11: kurakon・kikkoman・kombu.or.jp・kurashiru | 「アレンジ」0件。ただしクロール待ちなので触らない |
| 正月 昆布締め | kobujime-hare | 16: tankuma・kibun・maff.go.jp・shaddy | 展開「意味」「なぜ」には答えている。**作り置きの FAQ の出典が民間**（上の結論） |
| 昆布巻き 作り方 | kombumaki | 6: pref.iwate・kombu.or.jp・ameblo・youtube | 展開「コツ」は 11-10 に足した。クロール待ち（11-07） |
| 昆布だし 取り方 | how-to-make-dashi | 14: kombu.or.jp・tsuji.ac.jp・kurakonusa | 答えている。クロール待ち（11-07） |
| 都こんぶ 種類 | miyako-kombu | 10: wikipedia・nakanobussan・dagashijiten・kakaku | 「味 違い」の言い回しが0件。検出-未登録なので登録を待つ |
| 鶏むね肉 昆布締め | kobujime-chicken | 15: kombu.or.jp・delishkitchen・croissant | 「メリット」0件。11-18 に保存期間を足したばかり。クロール待ち |
| 年越しそば だし | toshikoshi-soba-dashi | 12: kikkoman・kubara・suigo・sirogohan | 「基本」「作り方」には答えている。11-18 に「意味」を足した。未認識 |
| 昆布ロード | kombu-history | 12: kombu.or.jp・gyoren・gov-online・mizu.gr.jp | 「意義」0件（急がない） |

全体の顔ぶれは kombu.or.jp（17語）・delishkitchen（12）・odashiya（11）・youtube（11）・kurakon（10）・odashi.co.jp（10）・tankuma（9）。昆布締めの語ではレシピ媒体（delishkitchen・tankuma・orangepage）、商品比較の語では kakaku・rakuten・took が並ぶ形が前夜と同じ。

## 5. 伸びしろのある記事トップ10

| # | 記事 | 打ち手 | 根拠の数字 |
| --- | --- | --- | --- |
| 1 | **shiokombu-guide** | 人の再クロール依頼（title は 11-14 に直し済み）。本文は触らない | GSC **127表示・6.6位・クリック0**（CTR課題の先頭）。「塩昆布 塩分」**30表示・3.9位・0クリック**、「塩ふき昆布 塩昆布 違い」18・8.8位。最終クロール 11-07 で新 title が未反映。AI「塩昆布 使い方」引用なし（11ドメイン） |
| 2 | **kombumaki** | 人の再クロール依頼。**締め切り11月末（残り12日）** | GSC「おせち 昆布巻き」6・63.5位。AI「昆布巻き 作り方」**8夜続けて引用なし**（pref.iwate・kombu.or.jp 等6ドメイン）。11-10 の強化（コツ・簡単に作るなら）が最終クロール 11-07 で未反映 |
| 3 | **kobujime-hare** | 作り置き FAQ の日数（民間の料理記事の2〜3日）を外し、hirame・chicken と同じ「資料が無い」の書き方に揃える（信頼性・食の安全） | 季節記事（12月上旬に立ち上がり）。AI「正月 昆布締め」引用なし（16ドメイン、maff.go.jp を含む）。GSC 1・7.0位。出典の扱いが同じサイト内の2記事と食い違う |
| 4 | **how-to-make-dashi** | 人の再クロール依頼（11-17 に title を直した） | GSC **30表示・11.2位・クリック0**（前夜 6.3位）。8〜20位の帯。AI「昆布だし 取り方」引用なし（14ドメイン、kombu.or.jp・tsuji.ac.jp）。最終クロール 11-07 |
| 5 | **kombu-storage** | 触らない。11-21 の分析で判断 | GSC **77表示・10.4位・1クリック・CTR 1.3%**（CTR課題2番目・8〜20位）。AI「昆布 保存方法」**3夜続けて引用（狙いどおり）**。10位以内に入るかの境目 |
| 6 | **kobujime-arrange** | 「薬味」の語で引けるようにする（わさび・ねぎは本文にあるので、表の見出しか FAQ の問いの言い回しだけ）。新しい主張は足さない | AI「昆布締め 食べ方」引用なし（**16ドメイン**、今夜の最多の一つ）。展開「昆布締め 薬味」に対し範囲内の「薬味」0件。GSC 4・23.3位 |
| 7 | **kobujime-hirame** | 人の再クロール依頼（11-14 の由来の段落が未反映）。本文は触らない | GSC **31表示・29.6位・0**（前夜 34.4位）。「ヒラメ 昆布締め 時間」2・13.0位。AI は前夜引用 → 今夜外れた（14ドメイン）。最終クロール 11-09 |
| 8 | **kombu-water** | クエリ別の内訳を取ってから決める（順位の下がり方の正体が分からない） | GSC 21・10.6位 → **34・19.9位**・1クリック（8〜20位の帯）。AI「昆布水 作り方」3夜続けて引用（狙いどおり） |
| 9 | **kombu-tsukudani** | 協会・農水省の資料で佃煮の由来が確かめられたときだけ短い節か FAQ 1問。無ければ「資料に無い」と記録 | 11-18 公開・未認識。AI「昆布 佃煮」引用なし（14ドメイン: nissui・kikkoman・kurakon 等のメーカー）。展開「昆布 佃煮 歴史」に対し範囲内の「歴史」0件 |
| 10 | **otsumami-kombu・kombu-diet-oyatsu** | 人の URL 検査（登録依頼）。中身は触らない | AI で2語とも引用されているが**受けているのは kombu-oyatsu-guide（別ページ）**。本人はどちらも検出 - 未登録。登録されれば狙いどおりの引用に変わるかを見られる |

記事ではないが、**/product/259（六彩だし）** は「六彩だし」36表示・9.0位・クリック0でクエリ機会損失の唯一の行。説明文の取り込みは DB 書き込みなので人の判断（next-actions の「人の判断」に既出）。

### トップ10から外したもの

- toshikoshi-soba-dashi・kobujime-chicken: 11-18 未明に直したばかりでクロール前。重ねて直すと効果が測れない
- yudofu-kombu・nanakusa-gayu-dashi: 展開クエリには答えている。nanakusa の「だしの種類」「おすすめ」は資料が無い（低に残す）
- kombu-nutrition・gagome-kombu・kombu-diet-oyatsu の「健康効果」「効能」「効果」: CLAUDE.md の方針で書かない
