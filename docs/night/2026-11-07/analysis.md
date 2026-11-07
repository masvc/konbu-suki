# 分析（2026-11-07 夜・1枠目）

集計期間: Search Console 2026-10-07〜2026-11-04（28日。GSC は3日遅れ）、前期間 2026-09-09〜10-06。
GA4 直近28日（28daysAgo〜today）。AI引用チェックは 2026-11-07 23:06 実行（gemini-2.5-flash、23キーワード）。

## 先に結論

- **Search Console は実質ゼロ。** 28日で表示1・クリック0。表示が出たのは `/product/314` の1回だけ（平均順位6.0）。
  クエリは1行も返らない。ガイド記事を含む対象39ページはすべて未検出（前夜36 → 新規3本で39）。
  CTR課題・8〜20位・クエリ機会損失は「該当なし」ではなく **材料が無い**。順位や CTR は書いていない。
- **前期間比:** 56日窓の合計も表示1・クリック0なので、前期間（09-09〜10-06）は表示0。0 → 1 で、伸びとは言えない。
- **GA4 はほぼ空。** 28日で46セッション、うち direct 43。Organic Search 1（yahoo）、AI流入 0。
  ガイド記事（/guide/*）の PV は 0。
- **アフィリリンクのクリックは楽天 0・Amazon 0**（下に取り方の注記）。
- **AI引用は 0/23。** 新規の3本（kombumaki・kombu-katsuo-dashi・kobujime-hare）も引用なし。
- 今夜のトップ10は指示どおり **AI引用チェックを主な根拠** にした。全件「引用なし」が共通なので、
  差は (a) AI が実際に投げたクエリに記事が答えているか (b) 競合の顔ぶれ (c) 出典の無い断定・数字の食い違いが
  残っているか（CLAUDE.md の優先順位で最優先）で付けた。
- 最大のボトルネックは引き続き **インデックス**（39/39 未検出）。今回の GSC 期間は 11-04 までで、
  11-07 に入れた canonical・/guide 一覧・トップの記事リンクの修正はまだ反映されていない期間。

## 1. Search Console

`seo-opportunities.ts`（`compare` も実行）/ `search-console.ts queries` / `search-console.ts pages` / `search-console.ts 56`。
プロパティは `sc-domain:konbu-suki.com`（konbu-suki.com のみに絞り込み）。

| 項目 | 今期（10-07〜11-04） | 前期（09-09〜10-06） |
| --- | ---: | ---: |
| クリック | 0 | 0 |
| 表示 | 1（/product/314、順位6.0） | 0 |
| CTR課題ページ（imp50+ & CTR<5%） | 0 | - |
| 順位改善チャンス（8〜20位 & imp30+） | 0 | - |
| クエリ機会損失（imp20+ & CTR<5% & 20位以内） | 0 | - |
| 検索クエリ Top50 | 0行 | - |
| GSC未検出ページ | **39/39** | （前夜 36/36） |

前期の値は「56日の合計 − 今期」で出した（56日窓も表示1・クリック0）。

`seo-opportunities.ts compare` は前回スナップショットが無く比較できなかったので、
`seo-snapshot.ts` を回して `data/seo-snapshots/2026-11-07.json`（と latest.json）を作った。次回から比較が出る。

## 2. GA4

`ga4-report.ts`

| 指標 | 今夜（28日） | 前夜の28日（参考） |
| --- | ---: | ---: |
| アクティブユーザー | 43 | 37 |
| セッション | 46 | 40 |
| PV | 53 | 47 |
| 平均セッション時間 | 58秒 | 62秒 |
| 直帰率 | 84.8% | 85.0% |
| エンゲージセッション | 7 | 6 |

前夜の列は期間がほぼ重なる28日窓で、前期間比ではない（スクリプトは前期間を出さない）。

- ページ別: `/` 43PV、`/kombu-box` 3、`/about`・`/category/gift`・`/contact`・`/origin/makombu`・
  `/product/149`・`/product/314`・`/search` が各1。**ガイド記事の PV は 0。**
- 流入元: `(direct) / (none)` 43、`af.moshimo.com / referral` 2、`yahoo / organic` 1、`(not set)` 1。
- デバイス: desktop 27ユーザー（平均89秒）、mobile 16ユーザー（平均5秒）。mobile の短さは3夜続いているが、
  数が少なく原因までは言えない。

### AI経由（`ai-traffic.ts` / `ai-quality.ts`）

- AI流入 0セッション（全体47の0.0%）。LP別・日別もゼロ。検索エンジン1セッション、AI/検索比 0.0%。

### アフィリリンクのクリック（CTA_EVENTS）

`CTA_EVENTS` は `amazon_click` と `rakuten_click` の2つ。

| イベント | 28日のクリック |
| --- | ---: |
| amazon_click | 0 |
| rakuten_click | 0 |

取り方の注記: 楽天/Amazon を別々に数えるために28日・前28日の一時スクリプト（scripts/tmp/cta-by-event.ts、
git 管理外）を書いたが、**実行の許可が下りず走らせられなかった。** 代わりに `ai-quality.ts` の
「CTAクリック数 全体 = 0」を使った。これは2イベントを OR でまとめた合計なので、合計0なら両方0と言える。
クリックが1件でも出たら合計だけでは分けられないので、そのときは `weekly.ts`（eventName 別、直近7日）で見る。

記事には購入リンクが無く、クリックは商品ページでしか起きない。どの記事から来たかも載っていないため、
記事ごとのクリック率は今の計測では出せない（next-actions の収益導線の項）。

## 3. AI引用チェック

詳細は [ai-citation.md](ai-citation.md) / ai-citation.json。

- 引用 **0/23**、取得失敗 0、消費トークン 28,805。
- 引用の多い他ドメイン: **kombu.or.jp 12/23**、youtube.com 11、delishkitchen.tv 11、sirogohan.com 8、
  odashiya.jp 8、tankuma.jp 7、kurakon.jp 6、odashi.co.jp 5、orangepage.net 5、rakuten.co.jp 5。
- 顔ぶれは3系統で前夜と同じ。公的・団体（kombu.or.jp、maff.go.jp、gyoren.or.jp、gov-online.go.jp）、
  専門店・メーカー（odashiya.jp、kurakon.jp、odashi.co.jp、konbumura.co.jp）、レシピ・動画
  （delishkitchen.tv、youtube.com、sirogohan.com、tankuma.jp、orangepage.net）。
- **昆布締め系8本（正月を含む）では tankuma.jp が8本中6本に出る**（鯛・サーモン・正月・失敗・野菜・作り方）。
  delishkitchen.tv は5本（正月・サーモン・鯛・ヒラメ・作り方）。釣り系（tsurihack.com、umizuriguide.com、surf-flatfish.com）も失敗・ヒラメに出る。
- 競合が少ない語: 昆布 保存方法（6）、昆布 選び方（6）、サーモン 昆布締め（7）。
  多い語: 正月 昆布締め（15）、昆布 種類（15）、昆布 レシピ（15）、がごめ昆布（14）。
- **kombu-comparison と kombu-types の取り合い:** comparison（昆布 違い）の引用元8ドメインのうち
  7（odashiya.jp・ogurayayamamoto.co.jp・kombu.or.jp・odashi.co.jp・dashi-tanbou.com・marukome.co.jp・sirogohan.com）が
  types（昆布 種類）と重複。AI は「昆布 違い」を「昆布 種類 違い」「真昆布 利尻昆布 羅臼昆布 違い」に展開しており、
  types の展開と同じ語になっている。

### 展開クエリと記事の答え（23本を突き合わせた結果）

`src/lib/guides.ts` の見出し・FAQ・本文と webSearchQueries を突き合わせた（grep で確認）。

**答えていない問いが残る記事**

| 記事 | 答えていない問い | 備考 |
| --- | --- | --- |
| kobujime-chicken | 鶏むね肉 昆布締め **効果** / 旨味 | なぜ昆布で締めるのか・何が変わるのかの節が無い。「効果」は健康と読まれやすい |
| kobujime-salmon | サーモン 昆布締め 旨味 / 特徴 | 「鮭」は description・title・見出しに無い（FAQ に1回） |
| kobujime-tai | 鯛 昆布締め とは / 特徴 | 食べ方は本文にある（農水省「旨味が移っている」）。締める理由の節は無い |
| kobujime-tips | 昆布締め 失敗 **旨味が出ない** | しょっぱい・べちゃべちゃ・味が染みないは 11-07 に対応済み |
| kombu-katsuo-dashi | 昆布だし 鰹だし **栄養成分** | うま味成分は答えているが、成分表の値が無い。kombu-nutrition に昆布だしの値あり |
| kombu-recipes | 昆布 レシピ 人気 / 昆布 効能 | 中身はだしがら活用のみ。title とのずれが残る |
| shiokombu-guide | 塩昆布 レシピ 簡単 / アレンジ / 料理 活用術 | 組み合わせ表はあるが手順のあるレシピが無い |
| kombu-comparison | 昆布 種類 違い / 真昆布 利尻昆布 羅臼昆布 違い | types と同じ問いになっている（上記） |
| kombu-history | 昆布ロード **現状** | 「一番食べているのは富山」の節はあるが、現代の昆布ロードとして立っていない |
| kobujime-vegetables | 野菜 昆布締め メリット | おすすめ野菜は「生のまま／茹でて」の節で答えている |
| kobujime-hare | 昆布締め 種類 | 意味は FAQ「昆布締めは正月料理ですか」で答えている |

**主要な展開クエリに答えているもの:** kombumaki（コツ＝3つの注意＋FAQ）、how-to-choose-kombu（見分け方、11-07 対応）、
gagome-kombu（効能・栄養、11-07 対応）、tororo-oboro、kombu-water、kombu-types、how-to-make-dashi、
kombu-nutrition、kombu-storage、kombu-production、kobujime、kobujime-hirame。

**答えてはいるが出典の無い断定・数字の食い違いが残るもの**（前朝の仕上げ枠が「高」に足した2件、未着手）

- kombu-production（guides.ts 1635行）: 「等級は見た目の規格で決まるもので、味の優劣を表すものではありません」に出典が無い
- kombu-storage（guides.ts 1471行）: 「水1リットルに昆布10gが目安」が協会の10〜20g（how-to-make-dashi・how-to-choose-kombu）と揃っていない

## 4. 伸びしろのある記事トップ10

GSC・GA4 は全ページゼロのため、**順位・CTR を根拠にしたものは1件も無い**（データが無い）。
「表示は多いが CTR が低い」「8〜20位」「長い質問型クエリで表示」に当たる記事は、材料が無いので挙げていない。
全件「AI検索で引用なし（0/23）」が共通。そのうえで並べた。

### 1. kombu-production（昆布の生産と産地）

- 根拠: 出典の無い断定（「等級は…味の優劣を表すものではありません」）。CLAUDE.md の優先順位で、ほかの何より先。
  how-to-choose-kombu・kombu-types では同じ理由で削除・差し替え済みで、記事どうしの言い方もずれている。
- AI: 引用なし。競合8ドメインに kombu.or.jp・umamiinfo.jp。展開クエリ「昆布 主な産地」には答えている。
- 直し: 一文を削るか、how-to-choose-kombu の「同じ種類でも採れた場所で格付けが分かれる」（出典あり）の言い方に揃える。

### 2. kombu-storage（昆布の保存方法）

- 根拠: 記事どうしの数字の食い違い（10g と 10〜20g）。
- AI: 引用なし。競合6ドメインと23本中最少（odashiya.jp・kurakon.jp・rausu.com ほか、公的機関は無し）。
  展開クエリ（保存方法 要点）には答えているので、数字を揃えれば取りに行ける位置。
- 直し: 「水1リットルに昆布10〜20g（日本昆布協会）」に揃える。

### 3. kobujime-chicken（鶏むね肉の昆布締め）

- 根拠: 展開クエリ「鶏むね肉 昆布締め **効果**」「旨味」に答える節が無い。「効果」を健康の話で埋めている競合が
  出やすい語で、事実だけの答えを置く意味がある。
- AI: 引用なし。競合11（kombu.or.jp＝記事の出典そのもの、nichinichi-magazine.com、tabi-labo.com、togetter.com ほか）。
- 直し: 「昆布で締めると何が変わるか」の短い節（serai.jp「水分を吸収することで身が締まり」、協会「だし・うま味について」
  グルタミン酸。どちらも前夜確認済みだが、改善枠が開き直してから書く）。鶏むね固有のメリットは出典が無いので書かない。

### 4. kobujime-salmon（サーモンの昆布締め）

- 根拠: 展開クエリ「旨味」「特徴」に答える節が無い。description に「鮭」が無い（前夜からの持ち越し）。
- AI: 競合 **7ドメインで昆布締め系では最少**（delishkitchen.tv・tankuma.jp・orangepage.net・oceans-nadia.com・
  livedoor.com・youtube.com・yahoo.co.jp）。公的・団体は無い。取りやすい。
- 直し: description と冒頭に「鮭（サーモン）」。3. と同じ「何が変わるか」の節。

### 5. kobujime-tai（鯛の昆布締め）

- 根拠: 展開クエリ「鯛 昆布締め とは」「特徴」。手順と時間はあるが、締める理由・何が変わるかの節が無い。
- AI: 競合11（medetaiya.jp・ogurakonbu.co.jp・tankuma.jp・sirogohan.com ほか）。
- 直し: 3. と同じ節を置く（3本まとめて1タスク）。

### 6. kobujime-tips（昆布締めの失敗とコツ）

- 根拠: 展開クエリ5本のうち「**旨味が出ない**」だけ答えが無い（しょっぱい・べちゃべちゃ・味が染みないは対応済み）。
- AI: 競合10。tankuma.jp、tsurihack.com、umizuriguide.com、surf-flatfish.com と釣り系が3つ。協会は出てこない。
- 直し: 原因別の表に「旨味が出ない（昆布の味がしない）」の行。出典で言えることだけ（置く時間・昆布の湿らせ方の記載を確かめる）。

### 7. kombu-katsuo-dashi（昆布だしと鰹だしの違い）

- 根拠: 展開クエリ「昆布だし 鰹だし **栄養成分**」に答えが無い。健康に寄る問い。
- AI: 引用なし。競合10（yamaki.co.jp・marutomo.co.jp・tokyo-gas.co.jp・odashiya.jp ほか）。新規記事で初めて測れた。
- 直し: 成分表（八訂）の「昆布だし」「かつおだし」の値を並べる小さな表。昆布だしの値は kombu-nutrition にあり
  （確認済み）。かつおだしの値は成分表を開いて確かめてから。ヨウ素の注意は既存の節へつなぐ。

### 8. kombu-recipes（昆布を使ったレシピ集）

- 根拠: 展開クエリ「昆布 レシピ 人気」「昆布 効能」。中身はだしがら活用だけで、title とずれている（前夜から）。
- AI: 競合15と最多クラス（kombu.or.jp・ajinomoto.co.jp・gyoren.or.jp・delishkitchen.tv ほか）。
- 直し: 昆布が主役の料理（昆布巻き＝kombumaki、昆布締め＝kobujime、クーブイリチー＝農水省で確認済み）への
  一覧を足して内部リンク。量でレシピ大手と競わない。「効能」には kombu-nutrition へ送るだけにする。

### 9. kombu-comparison（利尻・羅臼・日高・真昆布の違い）

- 根拠: 引用元8ドメインのうち7が kombu-types と重複。AI の展開も「昆布 種類 違い」で types と同じ問い。
- 直し: 「だし用4種」に絞り、冒頭で「7種の一覧は kombu-types」へ送る。新規記事は足さない。

### 10. shiokombu-guide（塩昆布の選び方と使い方）

- 根拠: 展開クエリ「塩昆布 レシピ 簡単」「アレンジ」「料理 活用術」の3本に手順のあるレシピが無い。
- AI: 競合11（kurashiru.com・kikkoman.co.jp・delishkitchen.tv・kombu.or.jp ほか）。
- 収益導線にいちばん近い記事（塩昆布は商品データがある）。ただしクリックは0なので率は言えない。
- 直し: 協会のレシピで塩昆布を使うものを開いて確かめ、2〜3品を出典つきで（分量は写さず参照）。

### 次点

- kombu-history: 展開「昆布ロード 現状」。富山の家計調査の節を「現代の昆布ロード」として立て直す。gov-online.go.jp が引用されている。
- kobujime-vegetables: 展開「メリット」。3〜5. の節を短く流用できる。
- kobujime-hare: 展開「昆布締め 種類」。kobujime の素材別早見表へのリンクで足りる。

## 5. 伸びしろの6観点で見た不足

| 観点 | 今の状態 | 足りないもの |
| --- | --- | --- |
| 信頼性 | 全記事に更新日と参考文献、運営体制、ヨウ素の上限量確定、見分け方・がごめ成分を出典つきで追加（11-07） | **kombu-production の出典なし断定、kombu-storage の数字のずれ**（トップ10の1・2）。著者情報（人の判断） |
| 構造化データ | Article・FAQPage 全記事。Recipe は kombumaki・kombu-water・how-to-make-dashi の3本 | 昆布締めのレシピ型6本（kobujime・salmon・tai・chicken・hirame・vegetables）に Recipe が無い。カテゴリ・産地ページに ItemList が無い |
| 収益導線 | 商品ページに楽天/Amazon | 記事から商品へのクリックが記事単位で測れない。28日のクリック 楽天0・Amazon0 |
| 季節需要 | 昆布巻き・正月の昆布締めを 11-07 に公開 | 年越しそば・七草のだしは出典未確認（期限 11-20）。公開した季節記事がまだインデックスされていない |
| 技術SEO | llms.txt・IndexNow・サイトマップ・canonical 修正 | **39/39 未検出**（人の作業）。Core Web Vitals は API キー待ち |
| SNS | docs/sns に23本ぶん（新規3本も済み） | 不足なし |

## 6. この枠の記録

- 開始時点の作業ツリーは clean、HEAD は 312beea。`.stop` なし。`docs/inbox.md` の未処理は「なし」。
- 前の枠の出力: 今夜の1枠目なので無し。前夜の analysis.md と next-actions.md を参照した。
- 記事・DB には触っていない。
- 一時スクリプト scripts/tmp/cta-by-event.ts は実行も削除も許可が下りなかった。git 管理外なのでコミットには入らない。
- `data/seo-snapshots/` を新しく作った（GSC の集計値だけで秘密情報は無い）。次の枠の stash で消えないよう、このコミットに入れる。
