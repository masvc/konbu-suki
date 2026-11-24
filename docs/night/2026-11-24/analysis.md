# 分析（2026-11-24 夜・1枠目）

集計期間: Search Console 2026-10-24〜2026-11-21（28日。GSC は3日遅れ）。GA4 は 28daysAgo〜today。
URL 検査は 2026-11-24 23:06 に取得（44本、API エラー0）。AI引用チェックは 23:16 実行（gemini-2.5-flash、42キーワード、1語2回、トークン 112,954）。
`docs/inbox.md` の未処理は **なし**。

比較の相手: GSC は前夜の分析（`docs/night/2026-11-23/analysis.md`、10-23〜11-20）と今夜のスナップショット（`data/seo-snapshots/2026-11-24.json`）。
インデックスと AI 引用は前夜の取得。AI 引用の夜ごとの並びは [ai-citation-diff.md](ai-citation-diff.md)（スクリプトが出した。手で並べていない）。
前夜（2026-11-23 フォルダ）の5枠はすべて status-*.json と report.md がある。`git stash list` は3件のまま（増えていない）。

指示文の前提（「33ページすべてが未検出」）は古い。GSC には28日で表示1,711が出ている。GSC と AI 引用の両方を根拠にした。

## 先に結論

- **GSC は表示 1,535 → 1,711（+176）、クリック 36 → 37（+1）**、平均 13.2 → 13.2位。前期間（9月下旬〜10月下旬）は今夜も `search-console.ts` で取れない（前期間の引数が無い）。記録上は表示0・クリック0
- **shiokombu-guide は表示 230 → 253・6.1位・クリック0**（CTR課題の先頭）。「塩昆布 塩分」**66表示・3.2位・0**。最終クロールは今夜も 11-07（20夜目）
- **kombumaki は表示 41 → 44・55.2位・0**（「おせち 昆布巻き」18・60.9位）。最終クロール 11-07。**おせちの締め切り（11月末）まで残り6日**。AI「昆布巻き 作り方」は**14夜続けて引用なし**
- **前夜「最初の効果」とした羅臼昆布は、今夜 2/2 → 0/2 に戻った**（1/2 → 2/2 → 2/2 → 0/2）。本文は 11-21 から変えていない。
  条件「2夜続けて 2/2、かつ変更後の版がクロール済み」は満たしていたが、3夜目に保てなかった。**効果と言い切るのは取り消し、「揺れの範囲だった可能性がある」と読み直す。** 効果の条件に「3夜目も 1/2 以上」を足す（next-actions）
- **「引用なし → 毎回引用」は kombu-katsuo-dashi の1語**（0/2 ×3夜 → 2/2）。11-23 に登録された翌夜で、本文は変えていない。打ち手の効果ではなく「登録の効き目」の候補。11-25 も 2/2 かを見る
- **インデックス: 登録 34/44。検出 - インデックス未登録 3件・クロール済み - インデックス未登録 0件**・未認識 7件・取得できず 0件。新しく公開した oden-kombu は未認識。
  toshikoshi・nanakusa・iwashi-katsuo が 検出 → 未認識に戻った（最終クロールはどれも「未」。11-20 に決めたとおり揺れとして「未取得」にまとめる。未取得は 9 → 10 で、増えたのは oden-kombu の1本）
- **AI引用（1回目）は 9/42**（前夜 9/41）。2回取りで **毎回引用 8・一部だけ 3・引用なし 31・取得失敗 0**（前夜 毎回5）
- **GA4: アフィリクリックは28日で12件（楽天6・Amazon6）**。前夜11件から /product/128 の楽天1件が増えた。どれも商品ページが入口で、**記事を入口にしたクリックは0件（11夜続けて）**。AI流入は0
- 健康・安全で新しく直すものは見つからなかった

## 1. Search Console

`seo-opportunities.ts` / `search-console.ts queries` / `search-console.ts pages`（28日・7日）/ `search-console.ts queries --page <path>` / `seo-snapshot.ts`。

| 項目 | 今期（10-24〜11-21） | 前夜の窓（10-23〜11-20） | 前期間 |
| --- | ---: | ---: | ---: |
| クリック | 37 | 36 | 0（記録） |
| 表示 | 1,711 | 1,535 | 0（記録） |
| CTR | 2.2% | 2.3% | - |
| 平均掲載順位 | 13.2 | 13.2 | - |
| CTR課題ページ（imp50+ & CTR<5%） | **8** | 7 | - |
| 順位改善チャンス（8〜20位 & imp30+） | 5 | 6 | - |
| クエリ機会損失（imp20+ & CTR<5% & 20位以内） | 4 | 4 | - |
| GSC未検出ページ | 12/58 | 12/57 | - |

CTR課題に /category/shiokombu（52・9.5位・2）が新しく入った。GSC未検出12本は oden-kombu・kobujime-iwashi-katsuo・kombu-seaweed-types・kombu-life-cycle・toshikoshi-soba-dashi・nanakusa-gayu-dashi・kombu-processed-foods・kombu-katsuo-dashi・kombu-comparison・miyako-kombu・otsumami-kombu・/category/gift（前夜の kombu-tsukudani が外れ、oden-kombu が入った）。

### ページ（前夜 → 今夜。表示・順位・クリック）

| ページ | 前夜（10-23〜11-20） | 今夜（10-24〜11-21） | 直近7日（11-14〜11-21） | 最終クロール |
| --- | --- | --- | --- | --- |
| /guide/shiokombu-guide | 230・6.2位・0 | **253・6.1位・0** | （上位30に出ず） | 11-07 |
| /guide/kombu-storage | 150・9.0位・3 | 167・9.2位・3（CTR 1.8%） | 114・7.9位・2 | 11-14 |
| /product/259（六彩だし） | 119・9.2位・4 | 131・8.9位・4 | 70・8.1位・3 | - |
| /guide/kombu-water | 79・13.9位・1 | 93・13.2位・1 | 79・13.3位・1 | 11-10 |
| /guide/kombu-oyatsu-guide | 71・8.7位・2 | 81・8.4位・2 | 76・8.5位・2 | 11-12 |
| /guide/how-to-make-dashi | 60・14.6位・0 | **79・22.5位・0** | **58・28.5位・0** | 11-19 |
| /product/314 | 60・4.2位・9 | 63・4.3位・9 | 33・4.5位・5 | - |
| /guide/kobujime-hirame | 50・22.6位・1 | 59・20.3位・1 | 43・18.9位・1 | 11-09 |
| /category/shiokombu | 43・9.7位・1 | **52・9.5位・2** | 40・9.1位・2 | - |
| /guide/kombumaki | 41・54.7位・0 | **44・55.2位・0** | - | 11-07 |
| /guide/kobujime-tips | 43・5.8位・2 | 43・5.8位・2 | 23・5.1位・1 | 11-22 |
| /guide/kombu-cha-uses | 34・8.0位・0 | 35・7.8位・0 | - | 11-13 |

- **how-to-make-dashi は 14.6 → 22.5位（7日は 28.5位）。** 見えるクエリ13語のうち10語が「昆布だし 取り方」の表記ゆれで **71〜95位**（各1表示）、「出汁 取り方 昆布」6位・「昆布 水出し 時間」11位。
  頭の語に70〜90位台で出始めた分が平均を下げている形で、kombu-water で 11-19 に見たのと同じ。既存の語が落ちたかは匿名66表示のため判別できない。予定どおり 11-27 夜にクロール前後7日で比べる。本文は触らない
- kombu-storage は7日で 114表示・7.9位（前夜の判断のときのクロール後7日 97・7.5位とほぼ同じ）。CTR 1.8%。中の条件つき項目（11-30 夜）のまま
- /category/shiokombu は 2クリック目。CTR課題に入った

### ページ別のクエリ内訳（`--page`）

| ページ | 見えたクエリ（表示・順位） | 見えない（匿名）表示 |
| --- | --- | ---: |
| shiokombu-guide（253） | 塩昆布 塩分 **66・3.2** / 塩ふき昆布 塩昆布 違い 29・8.7 / 塩昆布 塩分量 27・8.2 / 塩昆布塩分 10・3.6 / 塩昆布 塩ふき昆布 違い 6・7.7 / 塩昆布の塩分量 4・10.5 / 塩昆布塩分量 4・8.8 / ほか5語 各1〜2 | 105 |
| kombumaki（44） | おせち 昆布巻き 18・60.9 / 昆布巻き 4・58.3 / おせち 昆布 2・46.5 / おせち料理 昆布巻き 2・49.5 / ほか9語 各1（54〜68位） | 7 |
| kombu-oyatsu-guide（81） | 都こんぶ 酢こんぶ 違い 11・4.9・1クリック / おしゃぶり昆布 5・15.6 / 都こんぶ おしゃぶり昆布 違い 4・4.8 / 酢昆布 都こんぶ 違い 3・6.7 / ほか7語 各1 | 47 |
| kobujime-hirame（59） | ヒラメ 昆布締め 時間 2・13.0 / 昆布 締め 2・84.0 / ほか9語 各1（3〜87位） | 46 |
| kombu-cha-uses（35） | 昆布茶 塩分量 1・12.0 | 34 |
| how-to-make-dashi（79） | 上の13語（各1） | 66 |

- shiokombu-guide の見える148表示のうち、塩分の語が111、違いの語が36。全部1ページ目でクリック0。11-14 に直した title が最終クロール 11-07 のため Google に見えていない、という見立ては変わらない
- kombu-oyatsu-guide は表示20以上の語が無い（title/description の条件に当たらない）。違いの語（計18表示・2クリック）は miyako-kombu（未認識）が受けるべき語
- kombumaki は匿名が少なく、全語が46〜68位。季節の語が伸びている（41 → 44）が、11-10・11-22 の強化版はまだ Google に見えていない

### クエリ（目立つもの）

| クエリ | 表示 | クリック | 順位 | ページ |
| --- | ---: | ---: | ---: | --- |
| 塩昆布 塩分 | 66 | 0 | **3.2** | shiokombu-guide |
| 六彩だし | 62 | 0 | 8.5 | /product/259（クエリ機会損失・コンテンツギャップの唯一の行） |
| 塩ふき昆布 塩昆布 違い | 29 | 0 | 8.7 | shiokombu-guide |
| 塩昆布 塩分量 | 27 | 0 | 8.2 | shiokombu-guide |
| 六彩だし 使い方 | 20 | 4 | 3.9 | /product/259 |
| おせち 昆布巻き | 18 | 0 | 60.9 | kombumaki |
| 塩昆布 おすすめ | 14 | 1 | 11.7 | /category/shiokombu（推定） |
| 都こんぶ 酢こんぶ 違い | 11 | 1 | 4.9 | kombu-oyatsu-guide |
| ライフ 塩昆布 | 11 | 2 | 2.4 | （商品ページと推定） |

## 2. GA4

`ga4-report.ts` / `ai-quality.ts` / `ai-traffic.ts`。

| 項目 | 28日 | 前夜 |
| --- | ---: | ---: |
| アクティブユーザー | 157 | 149 |
| セッション | 169 | 161 |
| PV | 203 | 194 |
| エンゲージセッション | 57 | 53 |
| Organic Search | 74セッション（google 52・yahoo 19・bing 3） | 68 |
| Direct | 87セッション（エンゲージ10） | 85 |
| Referral | 8セッション（af.moshimo.com 7・docomo 1） | 8 |
| AI流入 | **0** | 0 |

- 記事ページの PV は最大4（kobujime-tips・kombu-oyatsu-guide）。kobujime-hirame 2PV・107秒、kombu-nutrition 3PV・67秒、kombu-cha-uses 1PV・518秒
- /product/314 は12PV・12ユーザー（GSC 9クリック）、/product/259 は10PV
- af.moshimo.com の7セッション・/kombu-box の9PV（2ユーザー・499秒）は前夜と同じで、運営側の確認と見る

### アフィリリンクのクリック（CTA_EVENTS）

楽天と Amazon は別に取れた（`ai-quality.ts` の [2b]）。

| イベント | 押したページ | 入口ページ | 回数 |
| --- | --- | --- | ---: |
| rakuten_click | /product/131 | /product/131 | 3 |
| amazon_click | /product/131 | /product/131 | 2 |
| amazon_click | /product/66 | /product/66 | 2 |
| amazon_click | /product/314 | /product/314 | 1 |
| amazon_click | /product/74 | /product/74 | 1 |
| rakuten_click | /product/128 | /product/128 | **1（新しく）** |
| rakuten_click | /product/314 | /product/314 | 1 |
| rakuten_click | /product/66 | /product/66 | 1 |
| **計** | | | **楽天6・Amazon6（12件）** |

- 検索エンジン経由11件、AI流入0件（全体12件のうち1件は検索以外）
- **記事を入口にしたクリックは0件**（11夜続けて）。記事 → 商品の導線が無いことの裏付けが続いている（人の判断「商品カード」）
- 前期間比は今夜も取れなかった。`ai-quality.ts` は 28daysAgo〜today の1期間だけを取る作りで、前期間の引数が無い

## 3. インデックス（URL 検査 API）

`index-status.ts` → [index-status.md](index-status.md)。API エラー0、1回で44本とも取れた。

| 状態 | 今夜 | 前夜 |
| --- | ---: | ---: |
| 送信して登録されました | **34** | 34 |
| **検出 - インデックス未登録** | **3** | 5 |
| **クロール済み - インデックス未登録** | **0** | 0 |
| URL が Google に認識されていません | 7 | 4 |
| 取得できず（API エラー） | 0 | 0 |
| 計 | 44 | 43 |

- **検出 - 未登録 3件**（まだ取得されていない。待てば進む側）: kombu-seaweed-types・kombu-comparison・otsumami-kombu
- **クロール済み - 未登録 0件**（中身を見て見送られた記事は今夜も無い。強化で効かせる対象は無い）
- 未認識 7件: **oden-kombu（新規）**・kobujime-iwashi-katsuo・kombu-life-cycle・toshikoshi-soba-dashi・nanakusa-gayu-dashi・kombu-processed-foods・miyako-kombu
- 前夜からの動き:
  - 登録・再クロールは無し（新しい最終クロール日は0件）
  - iwashi-katsuo・toshikoshi・nanakusa が 検出 → 未認識、comparison が 未認識 → 検出（どれも最終クロール「未」。揺れとして「未取得」にまとめる。未取得 9 → 10 は oden-kombu の1本ぶん）
- 登録済みで最終クロールが 11-07 のままの記事: **kombumaki・shiokombu-guide・kobujime-hare**・kobujime・kobujime-tai・how-to-choose-kombu・kombu-types・kombu-recipes・kombu-history・kombu-production・kombu-nutrition・tororo-oboro（12本、前夜と同じ）
- 優先5本（自動）: kombu-processed-foods・kombu-comparison・nanakusa-gayu-dashi・toshikoshi-soba-dashi・kombu-life-cycle（前夜と同じ顔ぶれ）

## 4. AI引用チェック

`ai-citation-check.ts`（1語2回）→ [ai-citation.md](ai-citation.md) / [ai-citation.json](ai-citation.json) / [ai-citation-diff.md](ai-citation-diff.md)。

**1回目 9/42 引用（取得失敗0）。毎回引用 8・一部だけ 3・引用なし 31。**

| 夜 | 毎回引用 | 一部だけ | 引用なし |
| --- | ---: | ---: | ---: |
| 11-21 | 8 | 4 | 29 |
| 11-22 | 9 | 4 | 28 |
| 11-23 | 5 | 8 | 28 |
| 11-24 | **8** | 3 | **31** |

毎回引用（8）: 牛肉 昆布締め・昆布茶 使い方・**昆布だし 鰹だし 違い**・サーモン 昆布締め・野菜 昆布締め・昆布水 作り方・おしゃぶり昆布 おすすめ・昆布 おやつ ダイエット。8語とも2回とも狙いどおりのページ。

### 動きの読み方（ai-citation-diff.md から）

| 狙う語 | 記事 | 11-21 → 11-24 | 最終クロール | 読み方 |
| --- | --- | --- | --- | --- |
| **羅臼昆布** | rausu-kombu | 1/2 → 2/2 → 2/2 → **0/2** | 11-22 | **前夜の「最初の効果」は3夜目に保てなかった。** 本文は 11-21 以降同じ。効果とは言い切れない（揺れの範囲だった可能性）。引用元11（rausu.com・rausu-town.jp・rausu-kombu.com・odashiya・kombu.or.jp）。展開「価値」「とは」は特徴・産地の節で答えている。触らない |
| **昆布だし 鰹だし 違い** | kombu-katsuo-dashi | 0/2 → 0/2 → 0/2 → **2/2** | 11-23（登録） | **引用なし → 毎回引用。** 本文は変えていない。登録（11-23 11:03Z）の翌夜で、打ち手ではなく登録の効き目の候補。11-25 も 2/2 かを見る |
| ヒラメ 昆布締め | kobujime-hirame | 1/2 → 2/2 → 2/2 → 1/2 | 11-09 | 毎回 → 一部だけ。揺れ（古い版で引かれている） |
| 昆布 保存方法 | kombu-storage | 2/2 → 0/2 → 2/2 → 1/2 | 11-14 | 揺れ |
| 昆布茶 使い方 | kombu-cha-uses | 2/2 → 1/2 → 1/2 → 2/2 | 11-13 | 揺れ。11-23 の title 変更は未反映 |
| 昆布 種類 | kombu-types | 1/2（別）×3 → 0/2 | 11-07 | 別ページ（/origin/hidaka）が受けていた分も外れた |
| おつまみ昆布 おすすめ | otsumami-kombu | 2/2（別）→ 1/2（別）→ 0/2 → 0/2 | 未取得 | 別ページで受けていた分が2夜続けて外れた |

**今夜「打ち手の効果」と言える語は0。**

### 効果の条件を見直す

羅臼昆布は「2夜続けて 2/2、かつ変更後の版がクロール済み」を満たした翌夜に 0/2 になった。サーモン 昆布締めも打ち手なしで 0/2 → 2/2 を3夜続けている。
2夜の 2/2 は打ち手が無くても起きる。**これからは「変更後の版がクロール済み、かつ 2/2 が3夜続く（または3夜の合計が 5/6 以上）」を効果の条件にする**（next-actions の方針に書いた）。

### 引用されていない語のうち、競合の顔ぶれと展開クエリへの答え

範囲内（`src/lib/guides.ts` の記事の行範囲）を grep で数えた。

| 狙う語 | 記事 | 引用元の数・主な顔ぶれ | 展開クエリで答えていないもの |
| --- | --- | --- | --- |
| おでん 昆布（新規） | oden-kombu | 9〜11: odendane・yamaki・**kombu.or.jp**・maikon.tv・kanbutuya-imai・seaweed.co.jp | 「役割」**語として0件**（「何のため」1件。表に「だしの役と結び昆布の役」がある）。「具材」**語として0件**（結び・大根・卵などの語は26件）。未認識なので、初回クロール前に問いの語を合わせれば載る |
| 昆布巻き 作り方 | kombumaki | 8: kombu.or.jp・mi-journey・north-dish・youtube | 展開「基本の作り方」「失敗しないコツ」には手順とコツの節で答えている。**14夜続けて 0/2**。11-10・11-22 の版が未クロール。本文は触らない（人の再クロール依頼） |
| 正月 昆布締め | kobujime-hare | 15: kyoudo-ryouri・kyokonbu・medetaiya・tankuma・delishkitchen | 「目的」語として0件だが「縁起」「意味」で2件答えている。最終クロール 11-07。触らない |
| 年越しそば だし | toshikoshi-soba-dashi | 11: kubara・kikkoman・note・youtube・tokubai | 「特徴」「基本」「種類」は答えている（種類は 11-14 の表）。未認識に戻った。触らない |
| 七草がゆ だし | nanakusa-gayu-dashi | 15: kagome・shimaya・ninben・yamaki・higashimaru・**doshisha.ac.jp** | 「なぜ」は 11-24 に FAQ を足した。「味付け」「歴史」3件・「塩」15件で答えている。未認識。触らない |
| 塩昆布 使い方 | shiokombu-guide | 11: kurakon・fujicco・kikkoman・kombu.or.jp・kurashiru・orangepage | 「レシピ 簡単」「料理 アイデア」は協会レシピ6品と料理の型の表で答えている。11-07 クロール。触らない |
| 鯛 昆布締め | kobujime-tai | 12: medetaiya・delishkitchen・tankuma・sirogohan・odashi.co.jp | **「なぜ美味しい」範囲内の「なぜ」「美味し」「おいし」0件**（「何が変わるか」の節は2件ある）。最終クロール 11-07 で、変えても依頼が無ければ載らない |
| 鶏むね肉 昆布締め | kobujime-chicken | 11: kombu.or.jp・futaba-dashi・croissant-online | 「なぜ」0件（「何が変わる」3件）。「効果」は書かない方針 |
| 昆布 育ち方 | kombu-life-cycle | 10: kombu.or.jp・fujicco・kurakon・**hokkaido.lg.jp**・suisan-navi | 「寿命」**語として0件**（「年目」18件で一生の年数は書いてある）。未認識なので初回クロール前に問いの語を合わせれば載る |
| 昆布 佃煮 | kombu-tsukudani | 12: nissui・kikkoman・kurakon・kobayashi-foods・sirogohan | 「材料」2件・「作り方」「特徴」あり。登録済み（11-20）で 11-23 の FAQ は未反映。**4夜続けて 0/2** |
| 昆布締め 食べ方 | kobujime-arrange | 11: keison・kanemitu・hakusando・ajinomoto・medetaiya | 「そのまま食べる」「おつまみ」9件・わさび醤油は早見表で答えている。11-24 の注意点 FAQ は未反映（最終 11-10） |
| 湯豆腐 昆布 | yudofu-kombu | 11: odashi.co.jp・kurakon・umami-labo・sirogohan | 「旨味」7件・「役割」「作り方」あり |
| 昆布だし 取り方 | how-to-make-dashi | 10: kombu.or.jp・sirogohan・gyoren.or.jp・odashiya・nagaikekonbu | 「基本の取り方」「美味しい作り方」は答えている。GSC で頭の語に70〜95位で出始めた |
| 都こんぶ 種類 | miyako-kombu | 8: wikipedia・nakanobussan・kakaku・dcmiyoshi | 「商品ラインナップ」は商品データが無く書けない。「違い」は 11-22 の表で答えている。未認識 |

全体の顔ぶれは kombu.or.jp（19語）・delishkitchen（13）・rakuten・tankuma（各11）・wikipedia（10）・kurakon・odashi.co.jp・youtube・odashiya（各9）。前夜とほぼ同じ。
展開クエリの「効能」「効果」「健康効果」「ダイエット 効果」（gagome・kombu-nutrition・chicken・beef・kombu-recipes・おやつ系）は CLAUDE.md の方針で書かない。

## 5. 伸びしろのある記事トップ10

| # | 記事 | 打ち手 | 根拠の数字 |
| --- | --- | --- | --- |
| 1 | **shiokombu-guide** | 人の再クロール依頼（title は 11-14 に直し済み）。本文は触らない | GSC **253表示・6.1位・クリック0**（CTR課題の先頭、前夜230）。「塩昆布 塩分」**66表示・3.2位・0**、「塩ふき昆布 塩昆布 違い」29・8.7位、「塩昆布 塩分量」27・8.2位（クエリ機会損失4件中3件）。最終クロール 11-07 で新 title が未反映（20夜目）。AI「塩昆布 使い方」0/2（11ドメイン） |
| 2 | **kombumaki** | 人の再クロール依頼（**締め切り11月末、残り6日**）。本文は触らない | GSC 表示 **41 → 44**・55.2位（「おせち 昆布巻き」18・60.9位）。AI「昆布巻き 作り方」**14夜続けて 0/2**（8ドメイン、kombu.or.jp を含む）。展開「基本の作り方」「失敗しないコツ」には答えている。11-10・11-22 の変更が最終クロール 11-07 で未反映 |
| 3 | **oden-kombu** | **改善枠で FAQ の問いに「役割」「具材」の語を合わせる**（既存の表の中身を問いにするだけ。新しい主張は足さない）＋人の URL 検査 | 11-24 公開・未認識。AI「おでん 昆布」0/2（9〜11ドメイン: kombu.or.jp・yamaki・odendane）。展開「役割」「具材」とも**範囲内で語として0件**（中身は表にある）。おでんの季節の最中で、初回クロール前に直せば1回で載る |
| 4 | **kobujime-hare** | 人の再クロール依頼。本文は触らない | 季節（12月上旬）。AI「正月 昆布締め」0/2（15ドメイン: kyoudo-ryouri・kyokonbu・medetaiya）。展開「目的」は「縁起」「意味」で答えている。最終クロール 11-07 で 11-19 の食の安全の修正が未反映 |
| 5 | **nanakusa-gayu-dashi**・**toshikoshi-soba-dashi** | 人の URL 検査（優先5本の3・4番目）。本文は触らない | どちらも未認識に戻った（最終クロール「未」）。AI 0/2（七草15・年越し11ドメイン）。展開（なぜ・味付け・歴史・種類・基本）には答えている。1/7・12/31 に向けて12月上旬に登録されている必要がある |
| 6 | **how-to-make-dashi** | 触らない。11-27 夜にクロール前後7日で比べる（予定どおり） | GSC 60・14.6位 → **79・22.5位・0**（直近7日 58・28.5位）。見える13語のうち10語が「昆布だし 取り方」の表記ゆれで71〜95位。頭の語に出始めた分で平均が下がった形。AI「昆布だし 取り方」0/2（10ドメイン: kombu.or.jp・gyoren.or.jp） |
| 7 | **kombu-life-cycle** | 改善枠で、記事の出典（協会「昆布って何？」・道総研）に寿命（何年で枯れるか）の記載があるときだけ FAQ の問いに「寿命」 | 未認識。AI「昆布 育ち方」**0/2 が4夜**（10ドメイン: kombu.or.jp・hokkaido.lg.jp・fujicco）。展開「寿命」範囲内0件（「年目」18件で年数は書いてある） |
| 8 | **kobujime-tai** | 次のクロール後に、既存の「何が変わるか」の節を「なぜ美味しくなるか」でも引ける問いにするか見る（クロール前に変えても載らない） | AI「鯛 昆布締め」**0/2 が4夜**（12ドメイン: medetaiya・delishkitchen・tankuma）。展開「なぜ美味しい」範囲内0件。最終クロール 11-07 |
| 9 | **miyako-kombu**（と受け皿の kombu-oyatsu-guide） | 人の URL 検査。本文は触らない | GSC「都こんぶ 酢こんぶ 違い」11・4.9位・1クリックほか違いの語で計18表示・2クリックを kombu-oyatsu-guide が受けている（81・8.4位・2）。miyako-kombu は未認識。AI「都こんぶ 種類」0/2（8ドメイン） |
| 10 | **/category/shiokombu**（記事ではない） | 改善枠でカテゴリページに ItemList の構造化データ（中から上げる） | GSC **52・9.5位・2クリック**で CTR課題に新しく入った。「塩昆布 おすすめ」14・11.7位・1。カテゴリ・産地ページはパンくずしか構造化データが無い |

記事ではないが、**/product/259（六彩だし）** は「六彩だし」62表示・8.5位・クリック0でクエリ機会損失・コンテンツギャップの唯一の行（前夜56）。説明文の取り込みは DB 書き込みなので人の判断（next-actions に既出）。

### トップ10から外したもの

- rausu-kombu: 2/2 → 0/2。本文は 11-21 から同じ。打ち手を足す理由が無い（揺れの読み直しだけ）
- kombu-katsuo-dashi: 登録翌夜に 2/2。打ち手を足す理由が無い
- kombu-storage: 7日 114・7.9位。中の条件つき項目（11-30 夜）で見る
- kombu-cha-uses: 35・7.8位・0。11-23 の title 変更が未反映（最終 11-13）。人の再クロール依頼に既出
- kobujime-hirame: 59・20.3位・1。AI 1/2。11-14・11-23・11-24 の変更が最終クロール 11-09 で未反映。人の再クロール依頼に既出
- kombu-tsukudani: 4夜 0/2 だが 11-23 の FAQ が未反映
- kombu-seaweed-types・kombu-processed-foods・kombu-comparison: 展開には答えている。未取得でクロール待ち
- kombu-nutrition・gagome-kombu・おやつ系の「健康効果」「効能」「効果」: CLAUDE.md の方針で書かない

## 6. 伸びしろの観点（CLAUDE.md の6つ）で今夜拾ったもの

| 観点 | 今夜の気づき | next-actions |
| --- | --- | --- |
| 信頼性 | 健康・安全で新しく直すものは無い。AI 引用の「効果」の判定が1夜で崩れた（羅臼昆布）。測り方の信頼性として条件を3夜にする | 方針に条件の変更を書いた |
| 構造化データ | /category/shiokombu が CTR課題に入った（52・9.5位・2）。カテゴリ・産地の ItemList は中のまま未着手 | 中 → 高に上げた |
| 収益導線 | アフィリ12件（楽天6・Amazon6）、記事が入口は11夜続けて0。/product/314 は GSC 9クリック・12PV に対しアフィリ2件 | 人の判断（商品カード・説明文）に数字を足した |
| 季節需要 | kombumaki 41 → 44表示、締め切りまで6日。おでん（oden-kombu）は季節の最中で未認識。toshikoshi・nanakusa は未認識に戻った | 季節表を更新。oden-kombu の FAQ を高に |
| 技術SEO | URL 検査 API は4夜続けてエラー0。今夜は登録・再クロールが0件。how-to-make-dashi は頭の語に低い順位で出始めた | how-to-make-dashi は 11-27 夜のまま。GSC の前期間比を高に |
| SNS | おせち・昆布締めの投稿時期（12月上旬）まで約1週間。文案は `docs/sns/kombumaki.md`・`kobujime-hare.md`・`oden-kombu.md` にある | 仕上げ枠が11月末から報告に出す（変更なし） |

## 7. 記録

- 作業中に置いた `docs/night/2026-11-24/.count.sh`（grep の集計用、使わなかった）は `rm` が許可されず消せなかった。コミットには入れていない。人が消す
