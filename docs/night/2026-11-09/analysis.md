# 分析（2026-11-09 夜・1枠目）

集計期間: Search Console 2026-10-09〜2026-11-06（28日。GSC は3日遅れ）、前期間 2026-09-11〜10-08。
GA4 直近28日（28daysAgo〜today）。URL 検査は 2026-11-09 23:05、AI引用チェックは 23:11 実行（gemini-2.5-flash、32キーワード）。
`docs/inbox.md` の未処理は無し。

## 先に結論

- **Search Console はまだほぼゼロ。** 28日で表示14・クリック0（前夜は表示6）。前期間（09-11〜10-08）は表示0
  （56日窓の合計も表示14なので）。ガイド記事で表示が出たのは **kombu-storage の1本だけ（表示3・平均16.0位）**。
  CTR課題・8〜20位（imp30+）・クエリ機会損失は、いずれも **材料が無い**（「該当なし」ではない）。
- **GA4 もほぼ空。** 28日で64セッション、うち direct 51。Organic Search 7（yahoo 5・google 2）、AI流入 0。
- **アフィリリンクのクリックは楽天 0・Amazon 0**（合計0。内訳は下の「取り方」を参照）。
- **インデックス: 登録 22/34**（前夜 21）。未登録12件の内訳は
  **「検出 - インデックス未登録」4件・「クロール済み - インデックス未登録」0件**・「URL が Google に認識されていません」8件。
  「クロール済み」が0なので、今夜は「中身を見て見送られた記事」は無い。未登録はすべて「まだ取りに来ていない」側。
- **AI引用は 9/32（前夜 3/31）。** 新しく引用が付いたのは 昆布 加工品・昆布だし 鰹だし 違い・正月 昆布締め・
  ヒラメ 昆布締め・昆布締め 作り方・とろろ昆布 おぼろ昆布 違い。前夜の3つ（サーモン・失敗・選び方）は続けて引用。
  ただし1キーワード1回の取得で、Gemini の結果は回ごとに揺れる。引用はドメイン単位でしか取れておらず、
  「昆布 加工品」「昆布だし 鰹だし 違い」は狙いの記事が Google 未登録なので、引用されたのが狙いの記事かは分からない。
- **伸びしろの主な根拠は AI 引用チェック。** 引用されていない23語のうち、AI の展開クエリに見出し・FAQ で答えていない
  ものと、季節の締め切りが近いもの（昆布巻き・七草がゆ）を上に置いた。

## 1. Search Console

`seo-opportunities.ts` / `search-console.ts queries` / `search-console.ts pages` / `search-console.ts all 56` /
`seo-snapshot.ts` → `seo-snapshot.ts compare`。プロパティは `sc-domain:konbu-suki.com`（konbu-suki.com のみ）。

| 項目 | 今期（10-09〜11-06） | 前期（09-11〜10-08） |
| --- | ---: | ---: |
| クリック | 0 | 0 |
| 表示 | 14 | 0 |
| 平均掲載順位 | 9.3 | - |
| CTR課題ページ（imp50+ & CTR<5%） | 0 | - |
| 順位改善チャンス（8〜20位 & imp30+） | 0 | - |
| クエリ機会損失（imp20+ & CTR<5% & 20位以内） | 0 | - |
| GSC未検出ページ（表示の行が無いページ） | 45/48 | （前夜 45/47） |

前期は「56日の合計 − 今期」で出した。スナップショット比較（11-08 → 11-09）は表示 6 → 14、順位 4.7 → 9.3。
件数が小さく、伸びとも悪化とも言えない。

ページ別（表示があった6ページ、すべてクリック0）:

| ページ | 表示 | 平均順位 |
| --- | ---: | ---: |
| /product/314 | 5 | 4.6 |
| /guide/kombu-storage | 3 | 16.0 |
| /category/shiokombu | 2 | 17.0 |
| /origin/hidaka | 2 | 4.5 |
| /product/143 | 1 | 8.0 |
| /product/84 | 1 | 8.0 |

クエリ: 「ライフ 塩昆布」表示2・3.0位、「日高昆布」表示1・5.0位、「小倉屋山本 えびす め 切り落とし」表示1・31.0位。
kombu-storage の3表示がどのクエリかは、クエリ行に出ていない（表示が少ないクエリは GSC が伏せる）。
ガイド記事で初めて表示が付いたので、kombu-storage は8〜20位の帯（16.0位）にいる唯一の記事。ただし表示3で、
「8〜20位 & imp30+」の基準には届かない。

スナップショットは `data/seo-snapshots/2026-11-09.json`。

## 2. GA4

`ga4-report.ts`

| 指標 | 今夜（28日） | 前夜の28日（参考） |
| --- | ---: | ---: |
| アクティブユーザー | 57 | 50 |
| セッション | 64 | 53 |
| PV | 78 | 60 |
| 平均セッション時間 | 68秒 | 51秒 |
| 直帰率 | 79.7% | 83.0% |
| エンゲージセッション | 13 | 9 |

前夜の列は期間がほぼ重なる28日窓で、前期間比ではない（スクリプトは前期間を出さない）。

- ページ別: `/` 55PV、`/kombu-box` 8（2ユーザー・平均343秒）、`/guide/kobujime-tips` 2、ほか
  `/guide/kobujime-chicken`・`/guide/kombu-storage`・`/origin/makombu`・商品5ページ・`/search` などが各1。ガイド記事の PV は計4（前夜2）。
- 流入元: `(direct) / (none)` 51、`af.moshimo.com / referral` 6、`yahoo / organic` 5、`google / organic` 2。
  google の自然検索が初めて出た（2セッション）。
- デバイス: desktop 35ユーザー（平均102秒）、mobile 22ユーザー（平均9秒）。mobile の短さは5夜続くが、数が少なく原因は言えない。
- `/kombu-box` の8PVは2ユーザーで、`af.moshimo.com` の6セッションと合わせ、運営者の確認の可能性がある（GA4 からは区別できない）。

### AI経由（`ai-traffic.ts` / `ai-quality.ts`）

- AI流入 0セッション（全体65の0.0%）。LP別・日別もゼロ。検索エンジン7セッション、AI/検索比 0.0%。
- AI の引用は9件あるが、そこからの流入はまだ無い。

### アフィリリンクのクリック（CTA_EVENTS）

`scripts/lib/analytics-constants.ts` の `CTA_EVENTS` は `amazon_click` と `rakuten_click` の2つ。

| イベント | 28日のクリック |
| --- | ---: |
| amazon_click | 0 |
| rakuten_click | 0 |

**取り方:** 既存スクリプトは CTA を合計でしか出さない（`weekly.ts`・`ai-quality.ts` とも「CTA 0click」）。
イベント別に出す一時スクリプト（`scripts/tmp/cta-split.ts`、gitignore 下）を書いたが、実行が許可されず走らせられなかった。
合計が0なので、両方0と判断した。合計が1以上になると内訳が分からなくなるので、楽天/Amazon 別の集計を
既存スクリプトに足す項目を next-actions の「中」に残す。

## 3. インデックス状況（`index-status.ts`、URL 検査 API）

詳細は [index-status.md](index-status.md)。

| 状態 | 今夜 | 前夜（11-09 07:05） |
| --- | ---: | ---: |
| 送信して登録されました | **22** | 21 |
| URL が Google に認識されていません | 8 | 10 |
| **検出 - インデックス未登録** | **4** | 3 |
| **クロール済み - インデックス未登録** | **0** | 0 |

- 検出 - インデックス未登録（4）: kombu-katsuo-dashi・kobujime-chicken・gagome-kombu・kombu-water。
  まだページを取得していない状態。待てば進む。
- クロール済み - インデックス未登録（0）: 該当なし。記事を厚くして登録を狙う対象は、今夜は無い。
- URL が Google に認識されていません（8）: おやつ5本・nanakusa-gayu-dashi・kombu-processed-foods・kombu-comparison。
- 前夜からの動き: rausu-kombu が登録された。kombu-katsuo-dashi・kombu-water は「認識されていません」→「検出」に進んだ。
  kombu-processed-foods は前夜「検出」→ 今夜「認識されていません」と逆向きに出た。URL 検査 API の返す状態が揺れた
  可能性があるが、理由はこの数字からは分からない。
- 優先5本（人が URL 検査からリクエスト）: kombu-oyatsu-guide・kombu-processed-foods・kombu-comparison・
  kombu-diet-oyatsu・otsumami-kombu。前夜の5本と4本が重なる（前夜の rausu-kombu は登録済みになり外れた）。
  前夜の朝報告でリクエストを頼んでいるが、実行されたかは記録が無く分からない。

## 4. AI引用チェック（`ai-citation-check.ts`）

詳細は [ai-citation.md](ai-citation.md) / ai-citation.json。32キーワード、取得失敗0、42,254トークン。

- 引用された 9: kombu-processed-foods・kombu-katsuo-dashi・kobujime-hare・kobujime-salmon・kobujime-tips・
  kobujime-hirame・kobujime・tororo-oboro・how-to-choose-kombu
- 引用されていない 23: nanakusa-gayu-dashi・ma-kombu・rausu-kombu・kombumaki・kobujime-tai・kobujime-chicken・
  kobujime-vegetables・gagome-kombu・kombu-water・kombu-comparison・kombu-types・how-to-make-dashi・kombu-nutrition・
  shiokombu-guide・kombu-storage・kombu-recipes・kombu-history・kombu-production・おやつ5本
- 昆布締めは7本中5本が引用された（作り方・正月・サーモン・ヒラメ・失敗）。引用されていないのは鯛・鶏むね肉・野菜。
- **おやつ5本は5本とも引用0。** 引用元は kakaku.com（4語）・rakuten.co.jp（4語）・monotaro.com・yahoo などの商品一覧と、
  美容・ジム・クリニック。展開クエリは「人気商品」「ラインナップ」「商品一覧」「おすすめ」と商品名を求めている。
  記事は 11-09 に照合していない商品表を外したので、いまは商品名で答えていない。
- 他ドメインの顔ぶれ: kombu.or.jp 18語（最多・前夜16）、odashiya.jp・tankuma.jp・delishkitchen.tv 各9、
  odashi.co.jp・kurakon.jp・macaro-ni.jp・youtube.com 各8、rakuten.co.jp 7。

### 展開クエリへの答え（引用されていない語のうち、記事の見出し・FAQ に答えが無いもの）

`src/lib/guides.ts` の heading と FAQ の q を、展開クエリの語と突き合わせた。

| 記事 | 展開クエリ | 記事の状態 |
| --- | --- | --- |
| kombumaki | 昆布巻き 失敗しないコツ / レシピ 簡単 | 「きれいに仕上げるための3つの注意」はあるが「コツ」「簡単」で答える見出し・FAQ が無い。協会の豚肉レシピ（10分）は煮る時間の表に埋もれている |
| nanakusa-gayu-dashi | 七草がゆ 意味 | 七草がゆを食べる意味・由来の節が無い（出典が要る） |
| rausu-kombu | 羅臼昆布 旬 | 採れる時期・旬の記載が無い |
| kombu-comparison | 出汁昆布 食用昆布 違い | 「だし用4種」に絞った後、食べる用途の昆布との違いに答えていない（kombu-types・gagome-kombu に材料はある） |
| kobujime-vegetables | 野菜 昆布締め 向いている野菜 | 「生のまま使う野菜と、茹でてから使う野菜」はあるが、「向いている野菜」の問いの形の FAQ が無い |
| oshaburi-kombu / otsumami-kombu / miyako-kombu | 人気商品 / 人気 / 商品一覧 | 商品名が記事に無い（照合前の表を外したため）。都こんぶは公式7品があるが「商品一覧」の見出しではない |
| shiokombu-guide | 塩昆布 料理 アレンジ / 活用法 | 協会レシピ3品で「使い方」はあるが、料理の型（和え物・炊き込み等）から引く一覧は無い |
| kobujime-tai | 鯛 昆布締め 旨味 / レシピ | 答えはある（「とは」の節）。引用されない理由は記事の中身からは言えない |
| kombu-nutrition | 昆布 健康効果 | 効果は書かない方針（CLAUDE.md）。成分表で言えることに留める形は守る。ここを広げる施策は取らない |

## 5. 伸びしろのある記事トップ10

GSC と GA4 は材料が無いため、**AI 引用チェックを主な根拠**にし、GSC はある数字（kombu-storage）だけ使った。
季節の締め切りが近いものを上に置いた。

| # | 記事 | 理由（どの数字から言えるか） | 打ち手 |
| --- | --- | --- | --- |
| 1 | **kombumaki**（おせちの昆布巻き） | 「昆布巻き 作り方」で引用なし。引用元11（kurashiru・kyounoryouri・kurakon・kombu.or.jp ほか）。展開「失敗しないコツ」「レシピ 簡単」に見出し・FAQ で答えていない。Google 登録済み。おせちの検索は12月上旬から立ち上がる（季節需要） | 「失敗しないコツ」の見出し化、「簡単に作るなら」の FAQ（協会の豚肉レシピ・早煮昆布）。11月中に |
| 2 | **nanakusa-gayu-dashi** | 「七草がゆ だし」で引用なし。引用元14はすべてだし・食品メーカーとレシピ（umenohana・kagome・ninben・shimaya ほか）。展開「七草がゆ 意味」に答えていない。**Google に認識されていない**。七草は12月中旬から検索が立ち上がる | 「意味・由来」の節を公的資料で（農水省・自治体）。URL 検査のリクエストを人に頼む（12月上旬までに登録させたい） |
| 3 | **kombu-storage** | **ガイド記事で唯一 GSC に表示（3回・平均16.0位）**。8〜20位の帯。AI は「昆布 保存方法」で引用なし、引用元7（odashiya・kurakon・rausu.com ほか）と少ない | 冒頭の結論に「常温・冷蔵・冷凍」と「開封後」の答えを一文で。表示のクエリが伏せられているので、展開「保存方法 要点」に合わせる |
| 4 | **oshaburi-kombu** | 「おしゃぶり昆布 おすすめ」で引用なし。引用元10のうち kakaku.com・rakuten.co.jp・monotaro.com・yahoo の4つが商品一覧。展開「人気商品」に商品名で答えていない。DB の snack カテゴリに商品がある（収益導線）。Google 未認識 | DB の商品カードを埋め込み、照合した商品だけ表に戻す（読み取りのみ）。並びは順位でなく表示順 |
| 5 | **kombu-comparison** | 「昆布 違い」で引用なし。引用元12（kombu.or.jp・kurakon・小倉屋山本・saikon ほか）。展開「出汁昆布 食用昆布 違い」に答えていない。Google 未認識（優先5本） | 「だし用と食べる用の違い」の短い節（kombu-types・gagome・tororo への案内）。新規記事にはしない |
| 6 | **rausu-kombu** | 「羅臼昆布」で引用なし。引用元11（odashiya・wikipedia・rausu-kombu.com・jf-rausu.shop ほか）。展開「羅臼昆布 旬」に答えていない。今夜 Google に登録された | 採取時期を北海道の資料（水産林務部・ぎょれん）で確かめて1行と FAQ |
| 7 | **kobujime-vegetables** | 「野菜 昆布締め」で引用なし。引用元14。展開「向いている野菜」を問いの形で答えていない。昆布締め7本のうち引用0の3本の1つ。登録済み | 「向いている野菜」の FAQ（協会レシピに出る野菜の一覧）。あわせて Recipe 構造化データ |
| 8 | **kobujime-tai** | 「鯛 昆布締め」で引用なし（同系統のヒラメ・サーモンは引用あり）。引用元11（medetaiya・sirogohan・orangepage ほか）。展開「レシピ」。登録済み | 昆布締め6本の Recipe 構造化データ（next-actions「中」）を鯛から。展開「旨味」はすでに答えているので本文は大きく触らない |
| 9 | **otsumami-kombu** | 「おつまみ昆布 おすすめ」で引用なし。引用元13のうち kakaku・rakuten・monotaro・yahoo・jf-rausu.shop が商品・通販。展開「人気 おつまみ昆布」「種類 特徴」。Google 未認識（優先5本） | 4と同じく DB 商品カード。ItemList 構造化データは照合の後 |
| 10 | **shiokombu-guide** | 「塩昆布 使い方」で引用なし。引用元7（kikkoman・delishkitchen・kurakon・rakuten ほか）。展開「料理 アレンジ」「活用法」。GSC では関連の `/category/shiokombu` が「ライフ 塩昆布」で表示2・3.0位（商品名での検索がある） | 料理の型から引く表（協会レシピのみ）と、記事から塩昆布カテゴリ・商品への導線 |

次点: kobujime-chicken（引用なし・検出 - 未登録。登録が先）、gagome-kombu（引用元18で最多・検出 - 未登録。展開「効能」は書かない方針）、
kombu-types / how-to-make-dashi（柱。展開には答えているが kombu.or.jp が両方で引用。差が記事の中身では言えない）。

## 6. 測り方の注意

- AI 引用は1語1回の取得。前夜3 → 今夜9の伸びは、直した記事の効果と取得の揺れを分けられない。
- 引用はドメイン単位。「昆布 加工品」「昆布だし 鰹だし 違い」は狙いの記事が Google 未登録・未取得なので、
  別のページ（商品・カテゴリ）が引かれた可能性がある。URL 単位で取れるよう ai-citation-check.ts を直す項目を next-actions に足す。
- GSC の数字は表示14で、比較に耐えない。ガイドは「登録 → 表示」の段階。
