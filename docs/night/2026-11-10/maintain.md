# 点検枠（2026-11-10 夜 / 実行は 11-11 未明）

inbox.md の未処理は無かった（年越しそばは新規枠が `- [x]` 済み）。next-actions の「高」もすべて済み。
この枠の役割（内部リンク・全体チェック・インデックス促進・楽天の再照合）を順に行った。

## 1. 内部リンク

**孤立記事: 0本**（34本すべて、どれかの記事の related に入っている）。
`site-check.ts --offline` に related の警告は出ていない。guides.ts の related を記事ごとに数えて確かめた
（存在しない slug・自分自身を指す related も無い）。

被リンクが少ない記事（2本）: toshikoshi-soba-dashi・kobujime-chicken・kobujime-vegetables・gagome-kombu・kombu-history。
昆布締めの2本は柱（kobujime）と kobujime-tips/hirame から入っており、gagome-kombu は kombu-types（種類の柱）から、
kombu-history は kombu-recipes・kombu-production から入っているので、今夜は足していない。

足したリンク:

| 記事 | 見直し前の被リンク | 足したリンク元 | 見直し後 |
| --- | --- | --- | --- |
| toshikoshi-soba-dashi（年越しそばのだし。今夜の新規） | 2（nanakusa-gayu-dashi・kombu-recipes） | kombu-katsuo-dashi（昆布だしと鰹だしの違い） | 3 |

年越しそばの記事は「合わせだしに昆布を足す」話なので、合わせだしの手順を書いている kombu-katsuo-dashi が
いちばん近い。related に足し、本文の「合わせだし」の節に「農林水産省が紹介する年越しそばのつゆは削り節だけで、
昆布は入っていません。…年越しそばのだしの記事にまとめています」の1文を足した（新記事で出典確認済みの事実のみ）。
本文を変えたので dateModified を 2026-11-11 にした。季節需要（12月中旬の立ち上がり）の記事への入口を増やすのが狙い。

コミット: 42ff45b 昆布だしと鰹だしの違いの記事から年越しそばのだしへ内部リンクを足した

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（オンライン） | ERROR 0 / WARN 4。ページ57件OK、画像サンプル50件OK | 直していない（下に理由） |
| check-links.ts（全件） | sitemap 372 / 内部 479 / 外部 1102。切れは外部5件 | 直していない（下に理由） |
| check-article-links.ts --all | 記事34本・出典57件、切れ0・移転0 | なし |
| meta-check.ts | 50ページ、要修正0・改善推奨0 | なし |
| fact-audit.ts | 34記事、食い違いなし | なし |
| verify-affiliate-links.ts | 問題0（Amazon 直314 / 検索1、楽天 直140 / 検索175） | なし |
| images:optimize | ガイド画像29件、200KB超 0件 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY が未設定で、共有枠の1日の上限に当たった（0/3） | 記録のみ（lighthouse.md） |
| 構造化データ | page.tsx が全記事に Article、faq のある記事に FAQPage を出す。FAQ付きは34/34。新しい記事 toshikoshi-soba-dashi も欠けなし | なし |

### 直さなかった指摘と理由

- **site-check の WARN 4件**（画像なし1・購入リンクなし1・重複商品1「ヤマサ 昆布つゆ 1800ml」）—
  商品データの直しで DB 書き込みが要る。この枠で許可されている書き込みは楽天の rakutenUrl / rakutenId（triage 経由）だけ。前夜と同じ
- **外部リンク切れ https://www.matumaeya.jp/（404）** — DB の生産者 id=7（松前屋）の url。DB 書き込みが要るので人の判断待ち（11-06 から継続）
- **外部リンク切れ: もしもアフィリエイト経由の楽天商品リンク4件（404）** — donzstore（b0gfm1s4kl・b0fr7q9hjb）、
  elimino（9a00qoe23fq・2c01ibkqktu）。楽天側で商品ページが消えている。rakutenUrl を外す・付け替える書き込みは
  許可の外（許可は triage が振り分けた分を付けることだけ）。人の判断待ち（11-09 から継続）
- 確かめられなかった外部リンク2件（ogurayayamamoto.co.jp 1、amazon.co.jp 1）は切れとは判定されていない。記事の出典ではない
- ガイド画像 29件 / 記事34本 — おやつ5本が画像を流用している（next-actions に既出）。画像の用意は人の作業

## 3. インデックス促進

- **サイトマップの lastmod:** curl が許可されていなかったので、WebFetch で素の URL と `?f=2` の2回取った（キャッシュを避けるため）。
  ルート・/guide・toshikoshi-soba-dashi は 2026-11-11、kobujime は 2026-11-10、/category/shiokombu は 2026-11-04T18:16:52.472Z、
  /about は lastmod なし。2回で同じ値だった。
  唯一変わったのは kombu-katsuo-dashi（11-08 → 11-11）で、1回目と2回目のあいだに上の内部リンクのコミットがデプロイされたため。
  dateModified どおりの変化で、取得時刻に引きずられた値ではない
- **IndexNow:** 孤立記事0を確かめてから `indexnow.ts --all` を実行。372件を通知し、HTTP 200 で受理された

## 4. 楽天マッチの再照合

- 下見: `match-rakuten.ts`（書き込みなし）。対象175件 / 一致49 / 保留126
  - 根拠: scripts/tmp/rakuten-match-2026-11-11.json（前夜の2件適用で対象が177→175に減った）
- 振り分け: `triage-rakuten.ts`。**自動適用の対象0** / レビュー待ち49 / 未一致126
  - レビュー待ちの内訳: スコア0.85未満 30 / 相手だけ複数個入り 12 / 価格が離れている 7（前夜と同じ内訳）
- **適用: 0件。** rakuten-apply.json が空（`[]`）だったので、`--apply ... --write` は実行していない。DB への書き込みは無し
- **レビュー待ちに残った件数: 49件**。一覧は scripts/tmp/review-rakuten.csv
- 49件は2夜続けて同じ内訳で、点検枠の自動経路では減らない。減らすには人が CSV を見て個別に判断する必要がある

## 5. 前の枠の出力

analysis.md・improve-log.md・ai-citation・index-status・status-analysis/create/improve.json はあった。
held.md・new-content-log.md は無かった。新規枠は toshikoshi-soba-dashi を公開済み（611bfab 以前のコミット）なので、保留が無かったと読む。
