# 点検枠（2026-11-14 夜の4枠目、実行は 11-15 未明）

inbox の未処理は無し。前の枠（分析・改善・新規）の出力はそろっていた。

## 1. 内部リンク

- 38記事の related を guides.ts から数えた（被リンク = 他記事の related に入っている数）
- **孤立記事 0。** `site-check.ts --offline` にも related の警告は無い。related に存在しない slug も無い
- いちばん少なかったのは前の枠で公開した kombu-seaweed-types（被リンク2: kombu-life-cycle・kombu-nutrition）。
  柱の kombu-types の related に足し、本文の「がごめ昆布について」の節で記事名に触れた（54a6507）。被リンク3になった
- 被リンク3の記事: kombu-cha-uses・kobujime-hare・kobujime-salmon・kobujime-chicken・kobujime-vegetables・
  gagome-kombu・how-to-choose-kombu・kombu-history・miyako-kombu・kombu-diet-oyatsu・kombu-seaweed-types。
  どれも柱（kobujime / kombu-types / kombu-oyatsu-guide / kombu-recipes など）か同じ群からつながっているので、今夜は足していない
- dateModified は上げていない（導線の1文を足しただけで、記事の中身は変えていない）

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4 | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。どれも商品 DB の書き込みで、夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / 外部 6 切れ（検査 376/483/1116） | 楽天5件（donzstore 2・elimino 2・net-o 1）と matumaeya.jp。前夜と同じ顔ぶれ。DB 書き込みが要るので直していない（next-actions に既出）。確かめられなかった1件は ogurayayamamoto.co.jp |
| check-article-links.ts --all | 38記事 / 67件 / 切れ0・移転0 | なし |
| meta-check.ts | 54ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（楽天直143・検索172） | なし |
| images:optimize | 38件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run links` は夜間の許可が無く実行できなかった。代わりに `check-article-links.ts --all` で全出典を確かめた（上表）。

## 3. インデックス促進

- **サイトマップの lastmod:** 今夜は `curl` が許可されておらず、本番の sitemap.xml を2回取る確認はできなかった。
  代わりに `src/app/sitemap.ts` を読んだ。記事は `dateModified`、商品一覧は商品の `updatedAt` の最大値、
  分からないものは lastModified を出さない作りで、取得のたびに変わる `new Date()` は使っていない
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage を出す。
  faq は 38/38 にある（site-check）ので、新しい kombu-seaweed-types も欠けていない
- **IndexNow:** 孤立記事0を確かめたあと `indexnow.ts --all` で 376 URL を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 172件中 一致49 / 保留123（scripts/tmp/rakuten-match-2026-11-15.json）
- triage: 自動対象2 / レビュー待ち47 / 未一致123（保留の内訳: 0.85未満28・相手だけ複数個入り12・価格差7）
- 目視で確認:
  - #89 ぎょれん北光 北海道産 日高昆布 500g ← 楽天「【送料無料】ぎょれん北光 北海道産 日高昆布 500g」（score 1.00）→ **適用**
  - #14 おしゃぶり昆布 梅 12g ← 楽天は 120g の徳用。量が10倍違うので**外した**（11-12 と同じ判断）
- `match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write` で **1件を書き込んだ**（rakutenUrl / rakutenId のみ）
- **レビュー待ちに残った件数: 48**（triage のレビュー47 + 目視で外した #14）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・楽天リンク切れ5件・松前屋 URL: すべて DB 書き込みで、夜間に許可されているのは楽天マッチの適用だけ
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
