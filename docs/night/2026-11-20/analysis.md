# 分析（2026-11-20 夜・1枠目）

集計期間: Search Console 2026-10-20〜2026-11-17（28日。GSC は3日遅れ）。GA4 は 28daysAgo〜today。
URL 検査は 2026-11-20 23:20 に1回目、API エラーが7本出たので取り直した（3章）。AI引用チェックは 23:17 実行（gemini-2.5-flash、41キーワード、1語2回。11-20 公開の kobujime-iwashi-katsuo の「イワシ 昆布締め」が増えた）。
`docs/inbox.md` の未処理は **なし**。

比較の相手: GSC は前夜の分析枠のスナップショット（`data/seo-snapshots/2026-11-19.json`、10-19〜11-16）。
インデックスと AI 引用は前夜の取得（`docs/night/2026-11-19/`）。前夜の5枠（分析・改善・新規・点検・仕上げ）はすべて status-*.json と report.md があり、git log にも各枠のコミットが残っている。

指示文の前提（「33ページすべてが未検出」）は古い。GSC には28日で表示1,092が出ている。
数字があるので GSC と AI 引用の両方を根拠にした。

## 先に結論

- **GSC は表示 971 → 1,092（+121）、クリック 25 → 27（+2）**、平均 13.6 → 13.1位。28日の表示が初めて1,000を超えた。前期間（9月下旬〜10月中旬）は表示0・クリック0の記録のまま。
- **shiokombu-guide が表示171・6.3位・クリック0**（前夜146）。「塩昆布 塩分」は **41表示・3.3位でクリック0**。打ち手は人の再クロール依頼（16夜目）。
- **how-to-make-dashi が 11-19 14:14Z に再クロールされた**（11-17 の title 変更の後）。人の依頼の一覧から外した。効果は GSC に 11-20 以降が入る 11-23 夜から見る。
- **インデックス（URL 検査を2回取って合わせた）: 登録 32/43。検出 - インデックス未登録 6件・クロール済み - インデックス未登録 0件**・未認識 4件・2回とも API エラー 1件（otsumami-kombu）。
  kobujime-beef が登録された（11-20 クロール、公開の翌日）。中身を見たうえで見送られた記事は今夜も0。検出と未認識は同じ夜の30分で入れ替わる記事があり、2つを足した「未取得 10件」で読む。
- **AI引用（1回目）は 8/41**（前夜 6/40）。2回取りで **毎回引用 7・一部だけ 4・引用なし 30・取得失敗 0**（前夜 毎回4）。
  「引用なし → 毎回引用」は **ヒラメ 昆布締め・野菜 昆布締めの2語**。ただし**どちらも変更後の版が Google にクロールされていない**ページで、打ち手の効果とは言えない。逆に **昆布茶 使い方は本文を変えずに 毎回 → 引用なし**。2回取りでも1夜の 0/2 ↔ 2/2 は揺れる。
- **kombu-diet-oyatsu は登録の翌夜に 2/2 とも本人へ移った**（前夜は 2/2 とも oyatsu-guide）。
- **GA4: アフィリクリックは28日で11件（楽天5・Amazon6）で前夜と同じ**。記事を入口にしたクリックは今夜も0件（7夜続けて）。AI流入は0。
- 健康・安全で新しく直すものは見つからなかった。

## 1. Search Console

`seo-opportunities.ts` / `search-console.ts queries` / `search-console.ts pages` / `search-console.ts queries --page <path>` / `seo-snapshot.ts`（`data/seo-snapshots/2026-11-20.json`、`compare` で前夜と比較）。

| 項目 | 今期（10-20〜11-17） | 前夜の窓（10-19〜11-16） | 前期間 |
| --- | ---: | ---: | ---: |
| クリック | 27 | 25 | 0（記録） |
| 表示 | 1,092 | 971 | 0（記録） |
| CTR | 2.5% | 2.6% | - |
| 平均掲載順位 | 13.1 | 13.6 | - |
| CTR課題ページ（imp50+ & CTR<5%） | 4 | 3 | - |
| 順位改善チャンス（8〜20位 & imp30+） | 6 | 4 | - |
| クエリ機会損失（imp20+ & CTR<5% & 20位以内） | 3 | 3 | - |
| GSC未検出ページ | 15/57 | 16/56 | - |

前期間は今夜 GSC で取ったものではない。11-15 夜に「56日窓 − 28日窓 = 0」で確かめた記録による（`search-console.ts` に前期間の引数は無い）。

### ページ（前夜 → 今夜。表示・順位・クリック）

| ページ | 前夜（10-19〜11-16） | 今夜（10-20〜11-17） | 最終クロール |
| --- | --- | --- | --- |
| /guide/shiokombu-guide | 146・6.5位・0 | **171・6.3位・0** | 11-07（下の注） |
| /guide/kombu-storage | 95・10.1位・1 | **108・9.9位・1**（CTR 0.9%） | 11-14 |
| /product/259（六彩だし） | 86・9.3位・4 | 97・8.9位・4 | - |
| /guide/kombu-water | 43・17.3位・1 | 51・15.7位・1 | 11-10 |
| /product/314 | 41・4.3位・6 | 44・4.3位・6 | - |
| /guide/kombu-oyatsu-guide | 29・8.7位・2 | 38・8.3位・2 | 11-12 |
| /guide/kobujime-hirame | 36・26.9位・0 | 37・26.5位・0 | 11-09 |
| /guide/how-to-make-dashi | 34・11.0位・0 | 36・10.7位・0 | **11-19**（title 変更後） |
| /category/shiokombu | 26・10.4位・1 | 32・10.1位・1 | - |
| /guide/kobujime-tips | 25・6.9位・1 | 29・6.4位・1 | 11-07 |
| /category/kombucha | 14・18.8位・0 | 16・18.0位・0 | - |

順位改善チャンス（8〜20位 & imp30+）に kombu-oyatsu-guide（38・8.3位）と /category/shiokombu（32・10.1位）が新しく入った。

### ページ別のクエリ内訳（`--page` で取った）

| ページ | 見えたクエリ（表示・順位） | 見えない（匿名）表示 |
| --- | --- | ---: |
| shiokombu-guide（171） | 塩昆布 塩分 41・3.3 / 塩ふき昆布 塩昆布 違い 23・8.7 / 塩昆布 塩分量 17・8.6 / 塩昆布塩分 6・2.5 / 塩昆布 塩ふき昆布 違い 5・7.2 / 塩昆布の塩分量 3・11.0 / 塩昆布塩分量 2・9.5 / 汐吹昆布 塩昆布 違い 1・6.0 | 73 |
| kombu-storage（108） | 昆布水 賞味期限 3・9.0 / 昆布 常温保存 1・7.0 | 104 |
| kombu-water（51） | 昆布水 1・36 / 昆布水 作り方 1・52 / 昆布水の作り方 1・52 / 昆布水作り方 1・54 / 昆布水 使い方 1・75 | 46 |
| how-to-make-dashi（36） | 昆布水の作り方 1・79 | 35 |
| kobujime-hirame（37） | ヒラメ 昆布締め 時間 2・13.0 / 昆布 締め 2・84 / ヒラメ 昆布締め 日持ち 1・23 / ほか表記ゆれ3語 各1（46〜87位） | 29 |

- shiokombu-guide は**見えている98表示のうち、塩分の語が69、違いの語が29**。どれも1ページ目でクリック0。11-14 に塩分の数字を前に出した title は、最終クロール 11-07 のため Google に見えていない、という見立てが続く
- kombu-water・kombu-storage・how-to-make-dashi は表示の9割前後が匿名で、クエリから打ち手は決められない。kombu-water の見える5語は前夜と同じ
- shiokombu-guide の今夜の URL 検査は1回目が 503、2回目で取れた。**最終クロールは 2026-11-07T17:55Z のまま**

### クエリ（目立つもの）

| クエリ | 表示 | クリック | 順位 | ページ |
| --- | ---: | ---: | ---: | --- |
| 六彩だし | 46 | 0 | 8.9 | /product/259（クエリ機会損失・コンテンツギャップの唯一の行） |
| 塩昆布 塩分 | 41 | 0 | **3.3** | shiokombu-guide |
| 塩ふき昆布 塩昆布 違い | 23 | 0 | 8.7 | shiokombu-guide |
| 六彩だし 使い方 | 18 | 4 | 3.9 | /product/259 |
| 塩昆布 塩分量 | 17 | 0 | 8.6 | shiokombu-guide |
| おせち 昆布巻き | 10 | 0 | 64.5 | kombumaki |
| 都こんぶ 酢こんぶ 違い | 8 | 1 | 5.3 | （ページ不明。miyako-kombu は未登録） |
| 塩昆布 おすすめ | 8 | 1 | 13.1 | /category/shiokombu（推定） |

新しくクリックが付いたクエリは無い（クリックの増えた2件は匿名か、既存の語の窓のずれ）。

## 2. GA4

`ga4-report.ts` / `ai-quality.ts` / `ai-traffic.ts`。

| 項目 | 28日 | 前夜 |
| --- | ---: | ---: |
| アクティブユーザー | 131 | 124 |
| セッション | 142 | 134 |
| PV | 169 | 161 |
| エンゲージセッション | 44 | 42 |
| Organic Search | 54セッション（google 41・yahoo 12・bing 1） | 47 |
| Direct | 81セッション（エンゲージ9） | 80 |
| Referral | 7セッション（af.moshimo.com、2ユーザー） | - |
| AI流入 | **0** | 0 |

- af.moshimo.com（アフィリエイトの管理画面）からの7セッションは2ユーザーだけで、運営側の確認の可能性が高い。読者の流入としては数えない
- 記事のページで PV が2以上あったのは kobujime-tips 3・kombu-oyatsu-guide 3・kombu-water 3・kombu-history 2・kombu-storage 2。記事の流入はまだ1桁

### アフィリリンクのクリック（CTA_EVENTS）

楽天と Amazon は別に取れた（`ai-quality.ts` の [2b]）。

| イベント | 押したページ | 入口ページ | 回数 |
| --- | --- | --- | ---: |
| rakuten_click | /product/131 | /product/131 | 3 |
| amazon_click | /product/131 | /product/131 | 2 |
| amazon_click | /product/66 | /product/66 | 2 |
| amazon_click | /product/314 | /product/314 | 1 |
| amazon_click | /product/74 | /product/74 | 1 |
| rakuten_click | /product/314 | /product/314 | 1 |
| rakuten_click | /product/66 | /product/66 | 1 |
| **計** | | | **楽天5・Amazon6（11件）** |

- 前夜と同じ11件で、新しいクリックは無い。検索エンジン経由が10件、AI流入は0件
- **記事を入口にしたクリックは0件**（7夜続けて）。記事 → 商品の導線が無いことの裏付け（商品カードの仕組みは人の判断）
- 前期間比は今夜も取れなかった。`ai-quality.ts` は 28daysAgo〜today の1期間だけを取る作りで、前期間の引数が無い

## 3. インデックス（URL 検査 API）

`index-status.ts` → [index-status.md](index-status.md)（2回目の結果。1回目の json は [index-status-run1.json](index-status-run1.json) に残した）

1回目（23:20）は43本中7本が API エラー（503「The service is currently unavailable.」6本・500「Internal error encountered.」1本）で取れなかった。
エラーの中に shiokombu-guide が入っていたので、もう一度回した。2回目もエラーは5本出たが、顔ぶれが入れ替わったので、**2回を合わせると取れなかったのは otsumami-kombu の1本だけ**になる。
下の表は「2回目の値。2回目がエラーなら1回目の値」で数えた。

| 状態 | 2回を合わせた件数 | 1回目だけ | 2回目だけ | 前夜 |
| --- | ---: | ---: | ---: | ---: |
| 送信して登録されました | **32** | 28 | 29 | 31 |
| **検出 - インデックス未登録** | **6** | 4 | 5 | 5 |
| **クロール済み - インデックス未登録** | **0** | 0 | 0 | 0 |
| URL が Google に認識されていません | 4 | 4 | 4 | 6 |
| 取得できず（API エラー） | 1 | 7 | 5 | 0 |
| 計 | 43 | 43 | 43 | 42 |

- **検出 - 未登録 6件**（まだ取得されていない。待てば進む側）: kombu-tsukudani・toshikoshi-soba-dashi・nanakusa-gayu-dashi・kombu-processed-foods・kombu-comparison・miyako-kombu（miyako は1回目の値）
- **クロール済み - 未登録 0件**（中身を見て見送られた記事は無い。強化が効く側の候補は今夜も無し）
- 未認識 4件: kobujime-iwashi-katsuo（11-20 公開・初回）・kombu-seaweed-types・kombu-life-cycle・kombu-katsuo-dashi
- 取れなかった1件: otsumami-kombu（2回ともエラー。前夜は未認識）
- 前夜からの動き:
  - **kobujime-beef が 未認識 → 登録**（最終クロール 2026-11-20T13:59Z。公開の翌日）
  - **how-to-make-dashi が再クロールされた**（2026-11-19T14:14Z。前夜の値は 11-08）。11-17 の title/description の変更の後なので、新しい title が Google に見えた
  - nanakusa-gayu-dashi・kombu-comparison が 未認識 → 検出、kombu-tsukudani が 未認識 → 検出
  - kombu-seaweed-types・kombu-life-cycle が 検出 → 未認識
  - **同じ夜の1回目と2回目（約30分差）でも、seaweed-types は 検出 → 未認識、tsukudani は 未認識 → 検出 と入れ替わった。** 検出と未認識の区別は1時間も持たない。最終クロールはどれも「未」で、2つを足した「未取得 10件」で読むのがよい（前夜 11件）
- 登録済みで最終クロールが 11-07 のままの記事: **kombumaki・shiokombu-guide・kobujime-hare**・kobujime・kobujime-tips・kobujime-vegetables・kobujime-tai・how-to-choose-kombu・kombu-types・kombu-recipes・kombu-history・kombu-production・kombu-nutrition・tororo-oboro
- 優先5本（自動・2回目）: kombu-processed-foods・toshikoshi-soba-dashi・kombu-life-cycle・kombu-katsuo-dashi・kombu-comparison。1回目は toshikoshi・comparison がエラーだったため、代わりに nanakusa・tsukudani が入っていた。**季節の nanakusa-gayu-dashi は優先5本と別に人の依頼に残す**

## 4. AI引用チェック

`ai-citation-check.ts`（1語2回）→ [ai-citation.md](ai-citation.md) / [ai-citation.json](ai-citation.json)。トークン 114,678（82回）。

**1回目 8/41 引用（取得失敗0）。** 前夜 6/40。

### 前夜（11-19）→ 今夜の動き

前夜の md と今夜の md を手で突き合わせた（前夜比のスクリプトは未着手。next-actions の高の先頭）。

| 狙う語 | 記事 | 11-19 | 11-20 | 引用されたページ（今夜） | 変更後の版はクロール済みか |
| --- | --- | --- | --- | --- | --- |
| ヒラメ 昆布締め | kobujime-hirame | 0/2 | **2/2** | 2回とも狙いどおり | **いいえ**（最終 11-09、変更 11-14） |
| 野菜 昆布締め | kobujime-vegetables | 0/2 | **2/2** | 2回とも狙いどおり | 変更なし（最終 11-07、本文は 11-10 から同じ） |
| 昆布水 作り方 | kombu-water | 2/2 | 2/2 | 2回とも狙いどおり（6夜続けて引用） | - |
| おしゃぶり昆布 おすすめ | oshaburi-kombu | 2/2 | 2/2 | 1回目は oyatsu-guide・2回目は狙いどおり | - |
| 昆布 おやつ ダイエット | kombu-diet-oyatsu | 2/2（別ページ） | 2/2 | **2回とも狙いどおり**（前夜は2回とも oyatsu-guide） | 11-18 クロール・11-19 登録 |
| 昆布 おやつ おすすめ | kombu-oyatsu-guide | 1/2 | 2/2 | 1回目は diet-oyatsu・2回目は両方 | - |
| おつまみ昆布 おすすめ | otsumami-kombu | 1/2 | 2/2 | 2回とも別ページ（oyatsu-guide） | otsumami は未登録 |
| 昆布 保存方法 | kombu-storage | 1/2 | 1/2 | 2回目が狙いどおり | - |
| 昆布締め 作り方 | kobujime | 0/2 | 1/2 | 別ページ（kobujime-hirame） | - |
| がごめ昆布 | gagome-kombu | 0/2 | 1/2 | 別ページ（/origin/gagome） | - |
| 昆布 種類 | kombu-types | 0/2 | 1/2 | 別ページ（/origin/makombu・/origin/hidaka） | - |
| 真昆布 | ma-kombu | 1/2 | **0/2** | - | - |
| **昆布茶 使い方** | kombu-cha-uses | **2/2** | **0/2** | - | 本文は 11-13 から同じ。引用元は12 → 5ドメインに減った |

- 「引用なし → 毎回引用」の2語は、どちらも Google が変更後の版を見ていないページ。**本文もクロールも変わらずに 0/2 → 2/2 が起きる**ことが分かった。前夜「打ち手の効果と言えるのは 0/2 → 2/2 だけ」としたが、それでも1夜では足りない。
  next-actions に「**2夜続けて 2/2、かつ変更後の版がクロール済み**」を効果の条件として書いた
- kombu-diet-oyatsu の「別ページ → 狙いどおり」は、登録（11-19）の翌夜に起きた。理屈に合う動きだが、同じ揺れの大きさを考えて 11-21 夜も見て閉じる
- 昆布締めの語（ヒラメ・野菜・作り方）で、自サイトの昆布締めの記事が3語引かれた。昆布締め群は11本あり、まとまりとして見られ始めている可能性はあるが、1夜では言えない

### 引用されていない語のうち、競合の顔ぶれと展開クエリへの答え

範囲内（`src/lib/guides.ts` の記事の行範囲）を grep で数えた。

| 狙う語 | 記事 | 引用元の数・主な顔ぶれ | 展開クエリで答えていないもの |
| --- | --- | --- | --- |
| 昆布 わかめ ひじき 違い | kombu-seaweed-types | **20**（今夜の最多）: kombu.or.jp・umamiinfo・iwate-wakame・morinaga・delishkitchen | 「特徴 用途」は 11-20 に足した（範囲内の「用途」10件）。「栄養 違い」は成分表の比較表で答えている。未取得なのでクロール待ち |
| 年越しそば だし | toshikoshi-soba-dashi | **18**: sobahonda・tsumura-seimen・kubara・odashiya・sirogohan | 「関東 関西 違い」（範囲内の「関東」0件）。公的資料が無く [!]。「意味」「材料」「作り方」には答えている |
| 昆布 産地 | kombu-production | 18: hokkaido.lg.jp・konjikyo.or.jp・jf-minamikayabe・rebun.jp・shinhidaka-hokkaido.jp | 「真昆布 産地」など種類別の産地。範囲内に真昆布8・利尻10・羅臼12・日高10件。答えている |
| 昆布 加工品 | kombu-processed-foods | 17: kombu.or.jp・gyoren.or.jp・kurakon・海外の海藻産業サイト | 「利点」（範囲内0件、抽象的）。「種類」「用途」「特徴」には答えている。未取得 |
| 真昆布 | ma-kombu | 16: odashiya・kombu.or.jp・jf-minamikayabe・marine-hakodate | 「使い方」「出汁」は答えている。1/2 → 0/2 は揺れ |
| 昆布締め 食べ方 | kobujime-arrange | 15: keison・kanemitu・kyokonbu・dancyu・takaoka-konbu | 「そのまま 食べる」「薬味」（11-19 に足した）「保存方法」「お刺身」。範囲内に「そのまま食べ」あり。クロール待ち（11-10） |
| 正月 昆布締め | kobujime-hare | 14: delishkitchen・kyoudo-ryouri・tankuma・kibun | 「意味」「作り方」「とは」は答えている。クロール待ち（11-07） |
| 羅臼昆布 | rausu-kombu | 14: odashiya・rausu-konbu・jf-rausu.shop・gyoren.net・konjikyo.or.jp | **「食べ方」**（範囲内0件。「用途」はある） |
| 昆布 佃煮 | kombu-tsukudani | 13: nissui・kikkoman・ninben・kombu.co.jp | 「歴史」は 11-19 に足した。未取得 |
| 七草がゆ だし | nanakusa-gayu-dashi | 11: kagome・doshisha.ac.jp・ninben・yamaki・shimaya | 「種類」は資料が無く低。「なぜ」は「意味」の節で答えている。未取得 |
| 鶏むね肉 昆布締め | kobujime-chicken | 10: kombu.or.jp・tuberecipe・nichinichi | 「注意点」は日持ち・加熱の節で答えている |
| 昆布 育ち方 | kombu-life-cycle | 10: kombu.or.jp・fujicco・ogurayayamamoto・suisan-navi | 「生息環境」「成長過程」は 11-20 に足した生態の節で答えている。未取得 |
| イワシ 昆布締め | kobujime-iwashi-katsuo | 9: tsurihack・tankuma・sushi-tanji・mi-journey | 「とは」「作り方」「特徴」は答えている。**Recipe の構造化データが無い**（ほかの昆布締めのレシピ型にはある）。未認識 |
| 昆布茶 使い方 | kombu-cha-uses | 5: ekamo・kurashiru・tokyogas・kaneryo | **「飲み方」**（範囲内0件。「飲むほかに」だけ）。1夜の外れは揺れの可能性 |

全体の顔ぶれは kombu.or.jp（18語）・delishkitchen（12）・wikipedia（11）・youtube（11）・tankuma・kurakon・odashiya（各10）。前夜とほぼ同じで、wikipedia・youtube が増えた。
展開クエリの「効能」「健康効果」「ダイエット 効果」（gagome・kombu-nutrition・おやつ系・昆布 レシピ）は CLAUDE.md の方針で書かない。

## 5. 伸びしろのある記事トップ10

| # | 記事 | 打ち手 | 根拠の数字 |
| --- | --- | --- | --- |
| 1 | **shiokombu-guide** | 人の再クロール依頼（title は 11-14 に直し済み）。本文は触らない | GSC **171表示・6.3位・クリック0**（CTR課題の先頭、前夜146）。「塩昆布 塩分」**41表示・3.3位・0**、「塩ふき昆布 塩昆布 違い」23・8.7位。見える98表示のうち塩分の語69。最終クロール 11-07 で新 title が未反映。AI「塩昆布 使い方」0/2（8ドメイン: delishkitchen・kikkoman・kombu.or.jp・kurakon） |
| 2 | **kombumaki** | 人の再クロール依頼。**締め切り11月末（残り10日）** | GSC「おせち 昆布巻き」10・64.5位。AI「昆布巻き 作り方」0/2・**10夜続けて引用なし**（10ドメイン、kombu.or.jp を含む）。11-10 の強化が最終クロール 11-07 で未反映 |
| 3 | **kobujime-hare** | 人の再クロール依頼。本文は 11-19 に直したので触らない | 季節（12月上旬に立ち上がり）。AI「正月 昆布締め」0/2（14ドメイン）。展開「意味」「作り方」には答えている。最終クロール 11-07。11-19 の日持ちの出典の修正も未反映 |
| 4 | **kobujime-iwashi-katsuo** | Recipe の構造化データを足す（イワシの1品だけ。宗田鰹は砂糖の量が確かめられていない）。初回クロール前に | 11-20 公開・未認識。AI「イワシ 昆布締め」0/2（9ドメイン: tsurihack・tankuma・sushi-tanji）。展開「作り方」。昆布締めのレシピ型7本には `recipe:` があり、この記事だけ0件 |
| 5 | **toshikoshi-soba-dashi** | 人の URL 検査（12月上旬に登録されている必要がある）。本文は「関東 関西」以外の展開に答えている | AI「年越しそば だし」0/2、**引用元18で今夜の2番目**（sobahonda・tsumura-seimen・kubara 等の製麺・だしメーカー）。URL 検査は検出 - 未登録（2回目で取れた）で、優先5本の2番目。季節の締め切り12月上旬 |
| 6 | **kombu-storage** | 触らない。**11-23 夜の分析**で判断 | GSC **108表示・9.9位・1・CTR 0.9%**（CTR課題2番目・8〜20位）。平均が初めて10位を切った。AI「昆布 保存方法」1/2（狙いどおり）。見えるクエリは4表示だけ |
| 7 | **how-to-make-dashi** | 触らない。**11-19 に再クロール済み**なので、11-17 の title の効果を 11-23 夜以降の CTR で見る | GSC **36表示・10.7位・0**（8〜20位の帯）。AI「昆布だし 取り方」0/2（11ドメイン、kombu.or.jp・tsuji.ac.jp）。展開「基本」「簡単」には答えている |
| 8 | **kombu-seaweed-types** | 人の URL 検査（11-20 に「用途」を足した）。本文は触らない | AI「昆布 わかめ ひじき 違い」0/2、**引用元20で今夜の最多**（kombu.or.jp・iwate-wakame・morinaga）。展開「特徴 用途」は足した直後で未取得 |
| 9 | **kombu-cha-uses** | 11-21 夜も 0/2 なら、既存の出典の範囲で「飲み方」の FAQ を検討 | AI「昆布茶 使い方」**2/2 → 0/2**（本文は 11-13 から同じ。引用元5: ekamo・kurashiru・tokyogas・kaneryo）。展開「昆布茶 飲み方」に対し範囲内の「飲み方」0件 |
| 10 | **rausu-kombu** | 記事の出典に「だし以外の食べ方」があれば FAQ 1問。急がない | AI「羅臼昆布」0/2（14ドメイン: odashiya・rausu-konbu・jf-rausu.shop・gyoren.net・konjikyo.or.jp）。展開「羅臼昆布 食べ方」に対し範囲内の「食べ方」0件。GSC /guide/rausu-kombu 13・11.5位・1 |

記事ではないが、**/product/259（六彩だし）** は「六彩だし」46表示・8.9位・クリック0でクエリ機会損失・コンテンツギャップの唯一の行。説明文の取り込みは DB 書き込みなので人の判断（next-actions の「人の判断」に既出）。

### トップ10から外したもの

- kobujime-hirame・kobujime-vegetables: 今夜 0/2 → 2/2。ただし変更後の版がクロールされていない。打ち手を足す理由が無い（hirame は GSC 37・26.5位で、11-14 の由来の段落のクロール待ち）
- kombu-water: 3夜続けて 2/2 狙いどおり。GSC 51・15.7位で見える語は50位前後の5語だけ。触らない
- kobujime-arrange・kombu-tsukudani・kombu-life-cycle: 11-19〜11-20 に直したばかりでクロール前。重ねて直すと効果が測れない
- kombu-diet-oyatsu・otsumami-kombu: diet-oyatsu は本人に移った（見るだけ）。otsumami は未登録で引用は oyatsu-guide が受けている
- nanakusa-gayu-dashi: 展開（作り方・なぜ）には答えている。打ち手は登録を待つこと（検出 - 未登録。人の依頼に季節枠で残す）
- kombu-nutrition・gagome-kombu・おやつ系の「健康効果」「効能」「効果」: CLAUDE.md の方針で書かない

## 6. 伸びしろの観点（CLAUDE.md の6つ）で今夜拾ったもの

| 観点 | 今夜の気づき | next-actions |
| --- | --- | --- |
| 信頼性 | 健康・安全で新しく直すものは無い。iwashi-katsuo の宗田鰹の砂糖（材料欄が2行で食い違う）は本文で「確認できていない」と書いてある | 構造化データに数字を載せない（高の Recipe の項目） |
| 構造化データ | iwashi-katsuo に Recipe が無い。カテゴリ・産地の ItemList は未着手のまま | 高に1件追加 |
| 収益導線 | アフィリクリックは前夜と同じ11件、記事が入口のものは7夜続けて0。/product/259 の指名語が伸び続けている | 人の判断（商品カード・説明文）に数字を足した |
| 季節需要 | おせち・正月の昆布締めは締め切りまで10日でクロール待ち。年越しそば・七草がゆは未登録。1月以降（節分・ひな祭り）は候補を確かめていない | 季節表に2行足した（1月上旬に一度だけ探す・昆布の日は来年） |
| 技術SEO | URL 検査 API が 43本中7本（2回目は5本）でエラー。how-to-make-dashi が再クロールされた | 中に「index-status.ts に再試行」を追加 |
| SNS | おせち・昆布締めの投稿時期（12月上旬）まで約2週間。文案はある | 変更なし（仕上げ枠が11月末から報告に出す） |
