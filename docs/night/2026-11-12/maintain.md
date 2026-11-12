# 点検枠（2026-11-12 夜 / 実行は 11-13 未明）

inbox.md の未処理は無かった。next-actions の「高」で夜間にできるものは前の枠で済んでいる（残る1件は人の URL 検査）。
この枠の役割（内部リンク・全体チェック・インデックス促進・楽天の再照合）を順に行った。

## 1. 内部リンク

**孤立記事: 0本**（36本すべて、どれかの記事の related に入っている）。
`site-check.ts --offline` に related の警告（孤立・存在しない slug・自己参照）は出ていない。guides.ts の related を記事ごとに数えて確かめた。

見直し前の被リンクは最少が kombu-cha-uses（11-13 公開）の2本（kombu-processed-foods・shiokombu-guide から）。ほかは全記事3本以上。

| 足したリンク元 | 足した related | 本文で触れた箇所 |
| --- | --- | --- |
| kombu-recipes（レシピの柱） | kombu-cha-uses | 「昆布が主役の料理」の節、塩昆布の使い方の記事の案内の直後に「粉末の昆布茶を調味料として使う量は、昆布茶の使い方の記事に日本昆布協会のレシピ6品の表でまとめています」の1文 |

見直し後の被リンク: kombu-cha-uses 2→3。

- 足した文は記事の案内だけで、新しい事実の主張は無い（協会レシピ6品の表は kombu-cha-uses 本文にある）
- 本文が変わったので kombu-recipes の dateModified を 2026-11-13 にした
- 11-10〜11-11 に強化して「数日触らない」とした記事は触っていない

コミット: 0700a37

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（オンライン） | ERROR 0 / WARN 4。ページ59件OK、画像サンプル50件OK、FAQ付き 36/36 | 直していない（下に理由） |
| check-links.ts（全件） | sitemap 374 / 内部 481 / 外部 1109。切れは外部7件、確かめられなかった1件 | 直していない（下に理由） |
| check-article-links.ts --all | 記事36本・出典62件、切れ0・移転0 | なし |
| meta-check.ts | 52ページ、要修正0・改善推奨0 | なし |
| fact-audit.ts | 36記事、食い違いなし | なし |
| verify-affiliate-links.ts | 問題0（Amazon 直314 / 検索1、楽天 直141 / 検索174。適用前の値） | なし |
| images:optimize | ガイド画像36件、200KB超 0件 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY が未設定で、共有枠の1日の上限に当たった（0/3） | 記録のみ（lighthouse.md） |
| 構造化データ | page.tsx が全記事に Article、faq のある記事に FAQPage、recipe のある記事に Recipe を出す。FAQ付き 36/36。新しい kombu-cha-uses も faq あり（コード上で欠けなし。本番 HTML の JSON-LD は WebFetch では見えず、目視はできていない） | なし |

`npm run links`（push 後の出典確認）は許可されておらず実行できなかった。代わりに上の `check-article-links.ts --all` で全記事を確かめている（切れ0）。

### 直さなかった指摘と理由

- **site-check の WARN 4件**（画像なし1・購入リンクなし1・重複商品1「ヤマサ 昆布つゆ 1800ml」）— 商品データの直しで DB 書き込みが要る。
  この枠で許可されている書き込みは楽天の rakutenUrl / rakutenId（triage 経由）だけ。前夜から継続
- **外部リンク切れ https://www.matumaeya.jp/（404）** — DB の生産者 id=7（松前屋）の url。人の判断待ち（11-06 から継続）
- **外部リンク切れ: もしも経由の楽天商品リンク6件（404）** — 前夜と同じ6件
  （donzstore b0gfm1s4kl・b0fr7q9hjb、elimino 9a00qoe23fq・2c01ibkqktu、denitselect 4903850066294、net-o a-246-b0czrgg268-238-10）。
  rakutenUrl を外す・付け替える書き込みは許可の外。人の判断待ち
- 確かめられなかった外部リンク1件（ogurayayamamoto.co.jp）は切れと判定されていない。記事の出典ではない

## 3. インデックス促進

- **サイトマップの lastmod:** curl は許可されていなかったので、WebFetch で素の URL と `?nocache=2` の2回取った。
  ルート・/guide・kombu-cha-uses・yudofu-kombu は 2026-11-13、kombu-recipes は 2026-11-09（取得時点ではこの枠の push 前のデプロイ）、
  /category/shiokombu は 2026-11-04T18:16:52.472Z、/product/259 は 2026-10-25T16:27:14.450Z。**2回で同じ値**だった。
  src/app/sitemap.ts も dateModified・商品の updatedAt から出している。lastmod の無い URL は5件（/producers・/kombu-box・/about 系3件。更新日が分からないものは入れない方針どおり）
- **IndexNow:** 孤立記事0を確かめてから `indexnow.ts --all` を実行。**374件を通知し、HTTP 200 で受理**された

## 4. 楽天マッチの再照合

- 下見: `match-rakuten.ts`（書き込みなし）。対象174件 / 一致48 / 保留126
  - 根拠: scripts/tmp/rakuten-match-2026-11-13.json
- 振り分け: `triage-rakuten.ts`。自動適用の対象1 / レビュー待ち47 / 未一致126
  - レビュー待ちの内訳: スコア0.85未満 28 / 相手だけ複数個入り 12 / 価格が離れている 7
- 目で確かめた: #267「とれたて！美味いもの市 ねこぶだし 450ml×6本×2 レシピ付き」→ denitselect「とれたて!美味いもの市 ねこぶだし 450ml×6本×2 レシピ付き」
  （score 1.00。品名・内容量・本数が一致、価格が近い）。外すものは無かった
- **適用: 1件。** `match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write` で rakutenUrl / rakutenId のみ更新（1件を更新）
- **レビュー待ちに残った件数: 47件**。一覧は scripts/tmp/review-rakuten.csv
- 前夜に外した #14（12g と 120g）は今夜の自動適用の対象に入っていない（triage の出力は rakuten-apply.json の1件だけ）

## 5. 前の枠の出力

2026-11-12 のディレクトリには analysis.md・ai-citation・index-status・improve-log.md・status-analysis/create/improve.json があった。held.md は無かった。
新規枠は kombu-cha-uses を公開済み（afc9b8e）。
