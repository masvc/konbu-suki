# 分析（2026-11-25 夜・1枠目）

集計期間: Search Console 2026-10-25〜2026-11-22（28日。GSC は3日遅れ）。GA4 は 28daysAgo〜today。
URL 検査は 2026-11-25 23:07 に取得（44本、API エラー1: kobujime-hare）。AI引用チェックは同じ夜に実行（gemini-2.5-flash、42キーワード、1語2回）。
`docs/inbox.md` の「未処理」は **なし**（11-25 昼に人が入れた4件は「対応済み」で入っている）。

比較の相手: GSC は前夜の分析（`docs/night/2026-11-24/analysis.md`、10-24〜11-21）。**前期間（09-27〜10-24）は今夜初めて実測した**:
`search-console.ts 56 pages` の合計が28日と同じ（表示1,894・クリック41）なので、前期間は **表示0・クリック0**。
インデックスと AI 引用は前夜の取得と比べた。AI 引用の夜ごとの並びは [ai-citation-diff.md](ai-citation-diff.md)（スクリプトの出力）。
前夜（2026-11-24 フォルダ）の5枠はすべて status-*.json と report.md がある。**`git stash list` は 3 → 5件**（11-24 夜の improve・create の前の2件。11-25 朝の仕上げ枠が人の判断に記録済み）。

指示文の前提（「33ページすべてが未検出」）は古い。GSC には28日で表示1,894が出ている。GSC・GA4・AI 引用の3つを根拠にした。

## 先に結論

- **shiokombu-guide・kombumaki が 11-25 01:53Z に再クロールされ、oden-kombu が 11-25 02:02Z に登録された。** 3本とも 11-24 の報告で「URL 検査を依頼して」と挙げたもので、shiokombu と kombumaki のクロール時刻は1秒違い。
  人が依頼したと見られる（inbox・todo には記録が無いので断定はしない）。**21夜続いた依頼のうち、最優先の2本が通った。** おせちの締め切り（11月末）に kombumaki が間に合った
- GSC は **表示 1,711 → 1,894（+183）、クリック 37 → 41（+4）**、平均 13.2 → 12.9位。前期間は 0・0
- **shiokombu-guide は 272表示・6.1位・クリック0**（「塩昆布 塩分」71・3.2位・0）。11-14 の title がやっと Google に渡った。GSC は3日遅れなので、CTR の変化は **11-29 夜の分析から**読める。本文も title も触らない
- インデックス: **登録 34/44。検出 - インデックス未登録 5件・クロール済み - インデックス未登録 0件**・未認識 4件・取得できず 1件（kobujime-hare、Internal error）
- GA4: アフィリクリックは28日で **12件（楽天6・Amazon6）**、前夜と同じ。記事を入口にしたクリックは0件。記事内の商品カードは 11-25 昼に公開したばかりで、まだ数えられる日が無い。AI流入は0
- **AI引用（1回目）は 7/42**（前夜 9/42）。2回取りで **毎回引用 6・一部だけ 6・引用なし 30・取得失敗 0**（前夜 8・3・31）。**「引用なし → 毎回引用」はがごめ昆布の1語だけで、引かれたのは別ページ（/origin/gagome）。打ち手の効果と言える語は今夜も0**
- **サーモン 昆布締めが 2/2 を3夜続けたあと 0/2 に落ちた**（本文は 11-06 のクロールから同じ）。前夜決めた「3夜続けて 2/2」を、打ち手なしで満たしてから外れた例。条件は変えずに、効果を言うときは同じ夜の「変えていない語」の出入りと並べて書く
- 健康・安全で新しく直すものは見つからなかった

## 1. Search Console

`seo-opportunities.ts` / `search-console.ts queries` / `search-console.ts pages`（28日・7日・56日）/ `search-console.ts queries --page <path>` / `seo-snapshot.ts`（`data/seo-snapshots/2026-11-25.json`）。

| 項目 | 今期（10-25〜11-22） | 前夜の窓（10-24〜11-21） | 前期間（09-27〜10-24） |
| --- | ---: | ---: | ---: |
| クリック | 41 | 37 | **0（56日窓で実測）** |
| 表示 | 1,894 | 1,711 | **0（同）** |
| CTR | 2.2% | 2.2% | - |
| 平均掲載順位 | 12.9 | 13.2 | - |
| 直近7日（11-15〜11-22） | 表示1,204・クリック22・12.2位 | - | - |
| CTR課題ページ（imp50+ & CTR<5%） | 8 | 8 | - |
| 順位改善チャンス（8〜20位 & imp30+） | 5 | 5 | - |
| クエリ機会損失（imp20+ & CTR<5% & 20位以内） | 4 | 4 | - |
| GSC未検出ページ | 12/58 | 12/58 | - |

GSC未検出12本は oden-kombu・kobujime-iwashi-katsuo・kombu-seaweed-types・kombu-life-cycle・toshikoshi-soba-dashi・nanakusa-gayu-dashi・kombu-processed-foods・kombu-katsuo-dashi・kombu-comparison・miyako-kombu・otsumami-kombu・/category/gift（前夜と同じ顔ぶれ）。

### ページ（前夜 → 今夜。表示・順位・クリック）

| ページ | 前夜（10-24〜11-21） | 今夜（10-25〜11-22） | 直近7日（11-15〜11-22） | 最終クロール |
| --- | --- | --- | --- | --- |
| /guide/shiokombu-guide | 253・6.1位・0 | **272・6.1位・0** | （上位に出ず） | **11-25（新）** |
| /guide/kombu-storage | 167・9.2位・3 | 185・8.9位・3（CTR 1.6%） | 126・7.9位・2 | 11-14 |
| /product/259（六彩だし） | 131・8.9位・4 | 144・8.7位・4 | 73・7.7位・2 | - |
| /guide/kombu-water | 93・13.2位・1 | 104・12.9位・1 | - | 11-10 |
| /guide/kombu-oyatsu-guide | 81・8.4位・2 | 94・7.9位・**3** | 80・8.2位・2 | 11-12 |
| /guide/how-to-make-dashi | 79・22.5位・0 | 86・21.1位・0 | - | 11-19 |
| /guide/kobujime-hirame | 59・20.3位・1 | 72・18.8位・1 | **47・10.4位・1** | 11-09 |
| /product/314 | 63・4.3位・9 | 67・4.4位・9 | 29・4.8位・3 | - |
| /category/shiokombu | 52・9.5位・2 | 61・9.5位・2 | 44・8.8位・2 | - |
| /guide/kombumaki | 44・55.2位・0 | **48・54.6位・0** | - | **11-25（新）** |
| /guide/kobujime-tips | 43・5.8位・2 | 46・5.7位・2 | 26・4.9位・1 | 11-22 |

- 28日の窓の終わり（11-22）は、shiokombu・kombumaki の再クロール（11-25）より前。**今夜の数字にはまだ新しい title・FAQ の効き目は入っていない**
- kobujime-hirame は直近7日が 10.4位（前夜の7日 18.9位）。見える語は「昆布締め ヒラメ」2・3.0位、「ヒラメ昆布締め」1・3.0位、「ヒラメ昆布締め 作り方」3・13.0位など各1〜3表示。
  最終クロールは 11-09 のままで、11-14 以降の変更は Google に見えていない。打ち手の効果ではない。触らない
- kombu-oyatsu-guide は3クリック目。2クリックとも違いの語（「都こんぶ 酢こんぶ 違い」12・4.9位・1、「酢こんぶ都 こんぶ違い」2・7.0位・1）。違いを書いた miyako-kombu は未認識のまま

### ページ別のクエリ内訳（`--page`）

| ページ | 見えたクエリ（表示・順位） | 見えない（匿名）表示 |
| --- | --- | ---: |
| shiokombu-guide（272） | 塩昆布 塩分 **71・3.2** / 塩ふき昆布 塩昆布 違い 31・8.6 / 塩昆布 塩分量 27・8.2 / 塩昆布塩分 11・3.4 / 塩昆布 塩ふき昆布 違い 7・8.1 / 塩昆布の塩分量 5・10.0 / 塩昆布塩分量 4・8.8 / ほか5語 各1〜2 | 109 |
| kombumaki（48） | おせち 昆布巻き 18・60.9 / 昆布巻き 5・53.6 / おせち 昆布 2・46.5 / おせち料理 昆布巻き 2・49.5 / ほか10語 各1（50〜68位。「昆布巻き 作り方」「昆布巻き作り方」「昆布巻きレシピ」が新しく） | 7 |
| kombu-oyatsu-guide（94） | 都こんぶ 酢こんぶ 違い 12・4.9・1 / おしゃぶり昆布 5・15.6 / 都こんぶ おしゃぶり昆布 違い 5・4.0 / 酢昆布 都こんぶ 違い 4・6.3 / ほか8語 | 56 |
| kobujime-hirame（72） | ヒラメ昆布締め 作り方 3・13.0 / 昆布締め ヒラメ 2・3.0 / ヒラメ 昆布締め 時間 2・13.0 / ほか11語 各1 | 54 |

- shiokombu-guide の見える163表示のうち、塩分の語が約123、違いの語が39。全部1ページ目でクリック0。再クロールで新しい title（「塩分量」「塩ふき昆布との違い」を前に出したもの）が載ったので、**11-29 夜以降の CTR** を見る
- kombumaki は作り方の語が出始めた（各1・54〜55位）。11-10 の強化・11-22 の下処理 FAQ が 11-25 のクロールで載った。順位の変化は **11-29 夜以降**

### クエリ（目立つもの）

| クエリ | 表示 | クリック | 順位 | ページ |
| --- | ---: | ---: | ---: | --- |
| 塩昆布 塩分 | 71 | 0 | **3.2** | shiokombu-guide |
| 六彩だし | 68 | 0 | 8.3 | /product/259（クエリ機会損失・コンテンツギャップの唯一の行） |
| 塩ふき昆布 塩昆布 違い | 31 | 0 | 8.6 | shiokombu-guide |
| 塩昆布 塩分量 | 27 | 0 | 8.2 | shiokombu-guide |
| 六彩だし 使い方 | 20 | 4 | 3.9 | /product/259 |
| おせち 昆布巻き | 18 | 0 | 60.9 | kombumaki |
| 塩昆布 おすすめ | 16 | 1 | 11.8 | /category/shiokombu（推定） |
| 都こんぶ 酢こんぶ 違い | 12 | 1 | 4.9 | kombu-oyatsu-guide |
| ライフ 塩昆布 | 11 | 2 | 2.4 | （商品ページと推定） |

## 2. GA4

`ga4-report.ts` / `ai-quality.ts` / `ai-traffic.ts`。

| 項目 | 28日 | 前夜 |
| --- | ---: | ---: |
| アクティブユーザー | 169 | 157 |
| セッション | 181 | 169 |
| PV | 215 | 203 |
| エンゲージセッション | 63 | 57 |
| Organic Search | 83セッション（google 57・yahoo 23・bing 3） | 74 |
| Direct | 90セッション（エンゲージ10） | 87 |
| Referral | 8セッション（af.moshimo.com 7・docomo 1） | 8 |
| AI流入 | **0** | 0 |

- 記事ページの PV は最大5（kombu-oyatsu-guide）。kobujime-tips 4、kombu-diet-oyatsu・kombu-nutrition・kobujime-vegetables・kombu-storage・kombu-water 各3
- /product/259・/product/314 が各12PV。/product/131 は7PV・206秒（アフィリ5件のページ）
- /kombu-box 9PV（2ユーザー・499秒）と af.moshimo.com の7セッションは前夜と同じで、運営側の確認と見る

### アフィリリンクのクリック（CTA_EVENTS）

楽天と Amazon は別に取れた（`ai-quality.ts` の [2b]）。

| イベント | 押したページ | 入口ページ | 回数 |
| --- | --- | --- | ---: |
| rakuten_click | /product/131 | /product/131 | 3 |
| amazon_click | /product/131 | /product/131 | 2 |
| amazon_click | /product/66 | /product/66 | 2 |
| amazon_click | /product/314 | /product/314 | 1 |
| amazon_click | /product/74 | /product/74 | 1 |
| rakuten_click | /product/128 | /product/128 | 1 |
| rakuten_click | /product/314 | /product/314 | 1 |
| rakuten_click | /product/66 | /product/66 | 1 |
| **計** | | | **楽天6・Amazon6（12件）** |

- 検索エンジン経由11件、AI流入0件。前夜から増減なし
- **記事を入口にしたクリック（[2c]、`article_*` の5イベント）は0件。** 記事内の商品カードと検索リンクのイベントは 11-25 昼の公開で、まだ数えられる日が無い。**11-28 夜の分析で初めて読む**（3日分）
- 前期間比: `ai-quality.ts` は 28daysAgo〜today の1期間だけを取る作りで、今夜も取れなかった。GA4 の計測開始より前は0なので、記録上は0

## 3. インデックス（URL 検査 API）

`index-status.ts` → [index-status.md](index-status.md)。API エラー1（kobujime-hare が Internal error）。

| 状態 | 今夜 | 前夜 |
| --- | ---: | ---: |
| 送信して登録されました | **34** | 34 |
| **検出 - インデックス未登録** | **5** | 3 |
| **クロール済み - インデックス未登録** | **0** | 0 |
| URL が Google に認識されていません | 4 | 7 |
| 取得できず（API エラー） | 1 | 0 |
| 計 | 44 | 44 |

- **検出 - 未登録 5件**（まだ取得されていない。待てば進む側）: kombu-seaweed-types・nanakusa-gayu-dashi・kombu-processed-foods・kombu-comparison・otsumami-kombu
- **クロール済み - 未登録 0件**（中身を見たうえで見送られた記事は今夜も無い。強化で効かせる対象は無い）
- 未認識 4件: kobujime-iwashi-katsuo・kombu-life-cycle・toshikoshi-soba-dashi・miyako-kombu
- 取得できず 1件: kobujime-hare（前夜は登録済み・最終クロール 11-07。登録34はこの1本を数えていないので、実際は 35/44 と見てよい）
- 前夜からの動き:
  - **oden-kombu が 未認識 → 登録**（11-25 02:02Z。公開の翌日）
  - **shiokombu-guide・kombumaki が再クロール**（11-25 01:53:55Z・01:53:56Z。11-07 以来18日ぶり）
  - nanakusa-gayu-dashi・kombu-processed-foods が 未認識 → 検出（最終クロール「未」。揺れとして「未取得」にまとめる）。未取得は 10 → 9（oden-kombu の分）
- 登録済みで最終クロールが 11-07 のままの記事: kobujime-hare（今夜は取れず）・kobujime・kobujime-tai・how-to-choose-kombu・kombu-types・kombu-recipes・kombu-history・kombu-production・kombu-nutrition・tororo-oboro（10本）
- 優先5本（自動）: kombu-processed-foods・kombu-comparison・nanakusa-gayu-dashi・toshikoshi-soba-dashi・kombu-life-cycle（前夜と同じ顔ぶれ）

## 4. AI引用チェック

`ai-citation-check.ts`（1語2回、84回呼び出し・トークン 120,042）→ [ai-citation.md](ai-citation.md) / [ai-citation.json](ai-citation.json) / [ai-citation-diff.md](ai-citation-diff.md)。

**1回目 7/42 引用（取得失敗0）。毎回引用 6・一部だけ 6・引用なし 30。**

| 夜 | 毎回引用 | 一部だけ | 引用なし |
| --- | ---: | ---: | ---: |
| 11-22 | 9 | 4 | 28 |
| 11-23 | 5 | 8 | 28 |
| 11-24 | 8 | 3 | 31 |
| 11-25 | **6** | **6** | **30** |

毎回引用（6）: 昆布だし 鰹だし 違い・ヒラメ 昆布締め・野菜 昆布締め・昆布水 作り方（4語は狙いどおり）、がごめ昆布（別ページ /origin/gagome）・昆布 おやつ おすすめ（別ページ kombu-diet-oyatsu）。

### 動きの読み方（ai-citation-diff.md から）

diff の冒頭の注記は「2夜続けて」のままだが、効果の条件は 11-24 夜に「変更後の版がクロール済み、かつ 2/2 が3夜続く」に変えている（next-actions の方針）。

| 狙う語 | 記事 | 11-22 → 11-25 | 最終クロール | 読み方 |
| --- | --- | --- | --- | --- |
| がごめ昆布 | gagome-kombu | 1/2（別）→ 0/2 → 0/2 → **2/2（別）** | 11-09 | 引用なし → 毎回引用だが、引かれたのは /origin/gagome。記事も産地ページも変えていない。揺れ |
| 昆布だし 鰹だし 違い | kombu-katsuo-dashi | 0/2 → 0/2 → 2/2 → **2/2** | 11-23（登録） | 登録後2夜続けて 2/2。本文は変えていない。11-26 も 2/2 なら「登録の効き目」として記録する（打ち手の効果ではない） |
| **サーモン 昆布締め** | kobujime-salmon | 2/2 → 2/2 → 2/2 → **0/2** | 11-06 | **打ち手なしで3夜 2/2 を続けたあと外れた。** 3夜の条件も、それだけでは効果の証明にならない |
| おしゃぶり昆布 おすすめ | oshaburi-kombu | 2/2（別）→ 1/2 → 2/2 → **0/2** | 11-14 | 揺れ。引用元は4ドメインだけ（dcmiyoshi・took・kyokonbu・yahoo）。商品一覧のページが並ぶ |
| おでん 昆布 | oden-kombu | - → - → 0/2 → **1/2** | **11-25（登録）** | 2回目に狙いどおり。11-25 の役割・具材の変更後の版で登録された。11-26・27 も見る |
| ヒラメ 昆布締め | kobujime-hirame | 2/2 → 2/2 → 1/2 → 2/2 | 11-09 | 揺れの範囲で安定 |
| 昆布巻き 作り方 | kombumaki | 0/2 ×4 | **11-25** | **15夜続けて 0/2。** 再クロールされたのは今日。効き目が見えるのは数夜あと |
| 塩昆布 使い方 | shiokombu-guide | 0/2 ×4 | **11-25** | 同じく今日クロール。数夜見る |
| 羅臼昆布 | rausu-kombu | 2/2 → 2/2 → 0/2 → 0/2 | 11-22 | 2夜続けて外れた。前夜の読み直し（揺れの範囲）のまま |

**今夜「打ち手の効果」と言える語は0。**

### 引用されていない語のうち、競合の顔ぶれと展開クエリへの答え

範囲内（`src/lib/guides.ts` の各記事の行範囲）を grep で数えた。

| 狙う語 | 記事 | 引用元の数・主な顔ぶれ | 展開クエリで答えていないもの |
| --- | --- | --- | --- |
| 正月 昆布締め | kobujime-hare（1821〜1888行） | 12: kibun・croissant-online・kyounoryouri・maikon.tv・shaddy | 展開「正月 昆布締め **意味**」「昆布締め 正月 **理由**」。範囲内の「理由」**0件**・「意味」**0件**（「縁起」2件で中身はある）。最終クロール 11-07 で、変えれば人の再クロール1回で載る |
| 昆布 育ち方 | kombu-life-cycle（629〜718行） | 12: kombu.or.jp・fujicco・kurakon・marine-hakodate・suisan-navi | 展開「成長過程」「**生育環境**」「**繁殖**」「養殖方法」。範囲内の「成長過程」「生育環境」「繁殖」**0件**（「成長」6・「生育」2・「養殖」23）。**5夜続けて 0/2**。未認識で、初回クロール前に問いの語を合わせれば載る |
| 昆布締め 失敗 | kobujime-tips（2092〜2182行） | 9: tankuma・mi-journey・sushi-tanji・tsurihack・serai | 展開「**魚が硬くなる**」（3夜目）。範囲内の「硬く」0件・「固く」3件は濡れぶきんの話。「味が薄」3・「原因」4・「コツ」5 は答えている |
| 年越しそば だし | toshikoshi-soba-dashi（938〜1060行） | 14: kubara・yamaki・mizkan・odashi.co.jp・youtube | 展開「材料」7件・「作り方 簡単」は「簡単」2件で答えている。未認識。人の URL 検査 |
| 七草がゆ だし | nanakusa-gayu-dashi（1172〜1314行） | 11: kikkoman・kagome・shimaya・ninben・imc.or.jp | 展開「目的」0件だが「意味」9件で答えている。「種類」1件。検出 - 未登録。人の URL 検査 |
| 昆布 佃煮 | kombu-tsukudani（414〜538行） | 13: nissui・kikkoman・ninben・zenchoshoku.or.jp・kombu.co.jp | 「作り方」7・「歴史」2・「特徴」1・「食べ方」2。展開には答えている。**5夜続けて 0/2**。最終 11-20 で 11-23 の FAQ は未反映 |
| 鯛 昆布締め | kobujime-tai（1987〜2091行） | 13: medetaiya・odashi.co.jp・delishkitchen・tankuma | 展開「旨味」は「うま味」6・「旨味」3で答えている。最終 11-07 |
| 湯豆腐 昆布 | yudofu-kombu | 9: odashi.co.jp・kurakon・kobumasa・kobayashi-foods | 展開「要点」「特徴」「作り方」。答えている。最終 11-13 |
| 昆布締め 食べ方 | kobujime-arrange | 5: keison・kanemitu・medetaiya・hakusando | 展開「何と一緒に食べる」は「一緒に」3・「添え」17件で答えている。最終 11-10 で 11-19・11-24 の変更は未反映 |
| おしゃぶり昆布 おすすめ／おつまみ昆布 おすすめ | oshaburi-kombu・otsumami-kombu | 4／10: dcmiyoshi・took・kakaku・rakuten・monotaro・yahoo（商品一覧・通販） | 展開「選び方」「人気」「種類」。「選び方」は両方3件で答えている。**引用元は商品が並ぶページ。** 記事内の商品カード（11-25）が入ったので、ItemList で並びを機械に読める形にできる |
| 都こんぶ 種類 | miyako-kombu | 7: wikipedia・nakanobussan・kakaku・dagashijiten | 「ラインナップ」「商品一覧」は商品データの範囲。11-25 から記事内カードに都こんぶの商品が出る。未認識 |
| 昆布巻き 作り方 | kombumaki | 10: kurakon・kyounoryouri・kikkoman・higashimaru・maff.go.jp | 展開「基本の作り方」「材料」「レシピ」には答えている。今日クロール。触らない |

全体の顔ぶれは kombu.or.jp（19語）・delishkitchen（14）・tankuma（12）・youtube（11）・wikipedia・note・kurakon・odashi.co.jp（各10）。前夜とほぼ同じ。
展開「効果」「効能」「健康効果」「ダイエット 効果」「メリット」（beef・hirame・gagome・kombu-water・kombu-nutrition・おやつ系）は CLAUDE.md の方針で書かない。

## 5. 伸びしろのある記事トップ10

| # | 記事 | 打ち手 | 根拠の数字 |
| --- | --- | --- | --- |
| 1 | **shiokombu-guide** | **触らない。11-29 夜から CTR を読む**（再クロール後の日が GSC に入る）。12-02 夜にクロール前後7日で比べる | GSC **272表示・6.1位・クリック0**（CTR課題の先頭、前夜253）。「塩昆布 塩分」**71表示・3.2位・0**、「塩ふき昆布 塩昆布 違い」31・8.6位、「塩昆布 塩分量」27・8.2位（クエリ機会損失4件中3件）。11-14 の title が **11-25 の再クロールでやっと載った**。AI「塩昆布 使い方」0/2（11ドメイン: kurakon・kikkoman・kombu.or.jp） |
| 2 | **kobujime-hare** | **改善枠で、既存の「縁起」の節・FAQ の問いに「意味」「理由」を入れる**（既存の出典の範囲。新しい主張は足さない）＋人の再クロール依頼 | 季節（12月上旬に検索が立ち上がる、締め切り11月末）。AI「正月 昆布締め」**0/2 が4夜**（12ドメイン: kibun・kyounoryouri・croissant-online）。展開「意味」「理由」が範囲内で**0件**（「縁起」2件）。最終クロール 11-07（今夜 API は取れず） |
| 3 | **kombumaki** | 触らない。11-29 夜から順位を読む。SNS 文案（`docs/sns/kombumaki.md`）は12月上旬に人が出す | GSC 48表示・54.6位・0（「おせち 昆布巻き」18・60.9位、作り方の語が新しく3語）。AI **15夜続けて 0/2**（10ドメイン）。**11-25 再クロールで 11-10 の強化と 11-22 の FAQ が載った** |
| 4 | **kombu-life-cycle** | **改善枠で、既存の節見出しか FAQ の問いに「生育環境」「成長過程」**（中から上げた。「繁殖」は出典の記載を確かめたときだけ） | AI「昆布 育ち方」**0/2 が5夜**（12ドメイン: kombu.or.jp・fujicco・kurakon・marine-hakodate）。展開「成長過程」「生育環境」「繁殖」が範囲内で**0件**（「成長」6・「生育」2）。未認識なので初回クロールで載る |
| 5 | **oden-kombu** | 触らない（11-25 の版で登録された）。11-26・27 の AI を見る | 11-25 02:02Z 登録。AI「おでん 昆布」0/2 → **1/2（2回目が狙いどおり）**（引用元: kobayashi-foods・maikon.tv・delishkitchen・odendane）。季節の最中 |
| 6 | **toshikoshi-soba-dashi**・**nanakusa-gayu-dashi** | 人の URL 検査（優先5本の3・4番目）。本文は触らない | 年越しは未認識、七草は検出。AI 0/2（年越し14・七草11ドメイン）。展開（材料・簡単・意味）は答えている。**12月上旬に登録されている必要がある** |
| 7 | **kobujime-hirame** | 人の再クロール依頼（11-14 の由来・11-23 の寄生虫とヨウ素の節が未反映） | GSC 72表示・18.8位・1、**直近7日 47・10.4位**（前夜の7日 18.9位）で8〜20位の帯。AI 2/2 狙いどおり。最終クロール 11-09 のまま順位が上がっている。直した版が載れば1ページ目が見える |
| 8 | **oshaburi-kombu・otsumami-kombu** | **改善枠で、記事内の商品カードを ItemList の構造化データでも出す**（構造化データ・収益導線。中から上げた。順位・評価は付けない） | AI「おしゃぶり昆布 おすすめ」2/2 → **0/2**、「おつまみ昆布 おすすめ」0/2 が4夜。引用元は商品が並ぶページ（dcmiyoshi・took・kakaku・rakuten・monotaro）。11-25 に記事内カードが入り、出せる商品の並びができた |
| 9 | **miyako-kombu**（と受け皿の kombu-oyatsu-guide） | 人の URL 検査 | GSC 違いの語（「都こんぶ 酢こんぶ 違い」12・4.9位・1、「酢こんぶ都 こんぶ違い」2・7.0位・1 など計約23表示・2クリック）を kombu-oyatsu-guide（94・7.9位・3）が受けている。miyako は未認識。AI「都こんぶ 種類」0/2（7ドメイン） |
| 10 | **kobujime-tips** | 中のまま: 協会・農水省の資料で締めすぎの説明が確かめられたときだけ「魚が硬くなる」の FAQ | AI「昆布締め 失敗」**0/2 が4夜**（9ドメイン: tankuma・sushi-tanji・tsurihack・serai）。展開「魚が硬くなる」が3度目。範囲内「硬く」0件。GSC 46・5.7位・2 |

記事ではないが、**/product/259（六彩だし）** は「六彩だし」68表示・8.3位・クリック0でクエリ機会損失・コンテンツギャップの唯一の行（前夜62）。説明文の取り込みは DB 書き込みなので人の判断（next-actions に既出）。

### トップ10から外したもの

- kombu-storage: 185・8.9位・3（CTR 1.6%）、AI 0/2。中の条件つき項目（7日の表示100以上・10位以内・CTR 2%未満が 11-21〜11-27 も続いたら title）を 11-30 夜に判断
- how-to-make-dashi: 86・21.1位・0。11-27 夜にクロール前後7日で比べる（予定どおり）
- kombu-tsukudani: 5夜 0/2 だが展開には答えている。11-23 の FAQ が未反映（最終 11-20）
- kombu-katsuo-dashi・kobujime-vegetables・kombu-water: 毎回引用。触らない
- kobujime-salmon・rausu-kombu: 本文を変えずに 2/2 → 0/2。打ち手を足す理由が無い
- kombu-nutrition・gagome-kombu・おやつ系の「効果」「効能」: CLAUDE.md の方針で書かない

## 6. 伸びしろの観点（CLAUDE.md の6つ）で今夜拾ったもの

| 観点 | 今夜の気づき | next-actions |
| --- | --- | --- |
| 信頼性 | 健康・安全で新しく直すものは無い。AI 引用の「効果」の判定は、サーモンが打ち手なしで3夜 2/2 → 0/2 になり、3夜でも言い切れないと分かった | 方針に「変えていない語の出入りと並べて書く」を足した |
| 構造化データ | /category/* の ItemList は 11-25 に入った（Rich Results テストは人）。記事内カードが入り、比較系2本の ItemList の前提がそろった。/origin/* は未着手 | 比較系の ItemList を高、/origin/* を中 |
| 収益導線 | アフィリ12件（楽天6・Amazon6）で前夜と同じ。記事内カード（11-25 昼）の効き目は 11-28 夜の分析から読める。/product/259 は「六彩だし」68表示・0クリック | 11-28 夜に [2c] を読む項目を高に |
| 季節需要 | kombumaki が締め切り（11月末）の前に再クロールされた。kobujime-hare は 11-07 のまま（今夜は取れず）。年越し・七草は未登録 | hare の「意味・理由」を高、URL 検査の先頭を hare・miyako・年越し・七草に |
| 技術SEO | 依頼の効き目が出た（3本）。手元の node_modules の Next.js が 16.4.3 のまま（package.json は 16.4.6）。URL 検査 API の取得エラーが1件戻った（hare） | `npm ci` を人の判断へ。index-status の再試行を中のまま（エラーが再発したことを記録） |
| SNS | おせち・昆布締めの投稿時期（12月上旬）まで約1週間。kombumaki はクロール済みなので、投稿の受け皿は整った | 仕上げ枠が12月上旬から報告に出す（変更なし） |

## 7. 記録

- `npm run build` は1回目が Next.js の告知で exit 1、2回目で成功（20ページ）。手元の Next.js は 16.4.3（上の技術SEO）
- `git stash list` は5件（11-25 朝の仕上げ枠の記録どおり。今夜は増えていない）
