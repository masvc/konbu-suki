# 点検枠（2026-11-08 夜 / 実行は 11-09 未明）

inbox.md の未処理は無かった。この枠の役割（内部リンク・全体チェック・インデックス促進・楽天の再照合）を順に行い、
next-actions.md の「中」にあった「楽天の検索語を128文字以内に切り詰める」も片付けた。

## 1. 内部リンク

**孤立記事: 0本**（32本すべて、どれかの記事の related に入っている）。
`site-check.ts --offline` に related の警告は出ていない。guides.ts の related を数えて確かめた
（related に出てくる slug は重複を除いて32種＝全記事）。

見直す前に弱かったところと、足したリンク:

| 記事 | 見直し前の被リンク | 足したリンク元 | 見直し後 |
| --- | --- | --- | --- |
| kombu-history（歴史と昆布ロード） | 1（kombu-production） | kombu-recipes（郷土料理の節に案内） | 2 |
| kombu-oyatsu-guide（おやつの柱） | 5（おやつ4本＋kombu-recipes） | kombu-processed-foods（加工品の柱。酢昆布・おやつ昆布・おしゃぶり昆布の行から案内） | 6 |
| otsumami-kombu | 3（おやつ群のみ） | shiokombu-guide（塩分の節に案内） | 4 |
| kombu-diet-oyatsu | 3（おやつ群のみ） | kombu-nutrition（成分表の節に案内） | 4 |

おやつ5本は互いにはつながっていたが、既存の柱（加工品・塩昆布・栄養）から入る道がレシピ集の1本だけだった
（todo.md「既存記事からおやつ系記事への内部リンク追加」）。kombu-processed-foods の related から kombu-types を外した
（kombu-types は被リンク10本で最多のため）。

本文には足したリンク先の記事タイトルを書いた。新しい事実は書いていない。dateModified は変えていない
（案内の1文を足しただけで、記事の内容は変わっていないため）。

コミット: 92595fb

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（オンライン） | ERROR 0 / WARN 4。ページ55件OK、画像サンプル50件OK | 直していない（下に理由） |
| check-links.ts（全件） | sitemap 370 / 内部 477 / 外部 1100。切れは外部1件 | 直していない（下に理由） |
| check-article-links.ts --all | 記事32本・出典54件、切れ0・移転0 | なし |
| meta-check.ts | 48ページ、要修正0・改善推奨0 | なし |
| fact-audit.ts | 32記事、食い違いなし | なし |
| verify-affiliate-links.ts | 問題0（Amazon 直314 / 検索1、楽天 直138 / 検索177） | なし |
| images:optimize | ガイド画像27件、200KB超 0件 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY が未設定で、共有枠の1日の上限に当たった（0/3） | 記録のみ（lighthouse.md） |
| 構造化データ | page.tsx が全記事に Article、faq のある記事に FAQPage を出す。FAQ付きは32/32。新しい記事（nanakusa-gayu-dashi・kombu-processed-foods・ma-kombu・rausu-kombu・おやつ5本）も欠けなし | **1件直した**（下） |

### 直した指摘

- **kombumaki の Recipe の recipeCategory が「だし」だった。** page.tsx が全レシピに「だし」を固定で入れていた。
  だし2本は正しいが、昆布巻きはおせち料理。recipe に任意の `category` を足し、kombumaki に「おせち料理」を入れた（abe33ac）
- **楽天照合の検索語が128文字以上で 400 になる**（11-07 の点検で6件）。語の切れ目で127文字に切り詰めるようにした（9701879）。
  今夜の下見はこの修正の前のコードで走っているので、効果は次の点検で確かめる。`--apply`（書き込みなし）で読み込みが通ることは確認した

### 直さなかった指摘と理由

- **site-check の WARN 4件**（画像なし1・購入リンクなし1・重複商品1「ヤマサ 昆布つゆ 1800ml」）—
  商品データの直しで DB 書き込みが要る。この枠で許可されている書き込みは楽天の rakutenUrl / rakutenId だけ。前夜と同じ
- **外部リンク切れ https://www.matumaeya.jp/（404）** — DB の生産者 id=7（松前屋）の url。DB 書き込みが要るので人の判断待ち（next-actions「人の判断」）
- 確かめられなかった外部リンク2件（ogurayayamamoto.co.jp 1、maff.go.jp 1）は切れとは判定されていない。記事の出典は
  check-article-links で全件生きているので、記事の出典ではない
- ガイド画像 27件 / 記事32本 — おやつ5本が kombu-processed-foods の画像を流用している（next-actions「中」に既出）。画像の用意は人の作業

## 3. インデックス促進

- **サイトマップの lastmod:** 2回取って同じ値だった（ルート・/guide・kombu-recipes・nanakusa-gayu-dashi は 2026-11-09、
  kombu-nutrition は 2026-11-06、/category/snack は 2026-11-04T18:16:52.518Z、/product/315 は 2026-10-25T16:27:14.450Z）。
  取得のたびに変わる値は無い。記事は guides.ts の dateModified、商品・カテゴリは DB の updatedAt から出ている（src/app/sitemap.ts）
  - curl が許可されていなかったので、WebFetch で `?f=1` `?f=2` を付けて2回取った（キャッシュを避けるため）
- **IndexNow:** 孤立記事0を確かめてから `indexnow.ts --all` を実行。370件を通知し、HTTP 200 で受理された

## 4. 楽天マッチの再照合

- 下見: `match-rakuten.ts`（書き込みなし）。対象177件 / 一致49 / 保留128
  - 根拠: scripts/tmp/rakuten-match-2026-11-09.json
- 振り分け: `triage-rakuten.ts`。自動適用の対象2 / レビュー待ち47 / 未一致128
  - レビュー待ちの内訳: スコア0.85未満 27 / 相手だけ複数個入り 13 / 価格が離れている 7
- **適用: 0件。** 自動適用の対象2件は、目で見て同じ商品とは言えなかったので外した。`--apply ... --write` は実行していない
  - #14「おしゃぶり昆布 梅 12g」（中野物産）← 楽天は別の店（konbu-onomichi）の「高級おしゃぶり昆布梅 **120g** 徳用」。
    前夜と同じ候補。内容量が10倍で作り手も違う
  - #93「お徳用 天然 日高昆布（**切**）500g **長さ15cm**」（坂昆）← 楽天は「お徳用 天然 日高昆布 500g **長さ35cm**」。
    名前はほぼ同じだが切り方の違う別の規格。リンク先で違う物を買うことになる
  - 外すことは許可の範囲を狭めるだけで、広げてはいない
- **レビュー待ちに残った件数: 49件**（triage のレビュー待ち47 + 今回外した2）。一覧は scripts/tmp/review-rakuten.csv

### triage の基準について（人が判断すること）

前夜に書いた3点（内容量 g の違い・逆向きのセット・量が違うのに価格が近い）に、今夜は「長さ（cm）の違い」が加わった。
#14・#93 とも「価格が近い +0.08」でしきい値を越えている。基準はこの枠で作り直さない決まりなので、記録に留める。

## 5. 前の枠の出力

analysis.md・improve-log.md・new-content-log.md・held.md・status-*.json はあった。欠けていたものは無い。
