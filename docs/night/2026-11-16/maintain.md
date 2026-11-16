# 点検枠（2026-11-16 夜の4枠目、実行は 11-17 未明）

inbox の未処理は無し。前の枠（分析・改善・新規）の出力は docs/night/2026-11-16/ にあった
（新規枠は content-slot.md と held.md）。

## 1. 内部リンク

- 38記事の related を guides.ts から数えた（被リンク = 他記事の related に入っている数）
- **孤立記事 0。** `site-check.ts --offline` にも related の警告は無い。related に存在しない slug も無い
- 柱へ戻る線が欠けていた記事と、被リンクが3本の記事に related を足し、本文でも記事名に触れた:
  - nanakusa-gayu-dashi → how-to-make-dashi（だし群の柱へ戻る線が無かった）
  - kombu-comparison → how-to-choose-kombu（how-to-choose-kombu は被リンク3 → 4）
  - ma-kombu → kombu-history（kombu-history は被リンク3 → 4。本文に北前船の経緯の1文）
  - kombu-seaweed-types → gagome-kombu（gagome-kombu は被リンク3 → 4。前の枠で張った逆向きと対にした）
- 被リンク3のまま: kombu-cha-uses・kobujime-hare・kobujime-salmon・kobujime-chicken・kobujime-vegetables・
  miyako-kombu・kombu-diet-oyatsu。どれも柱（kobujime / kombu-oyatsu-guide / kombu-recipes など）からつながっている
- dateModified は上げていない（導線の1文を足しただけで、記事の中身は変えていない）

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4（ページ61件 OK・画像サンプル50件 OK） | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで、夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / 外部 5 切れ（検査 377/484/1117） | 楽天4件（donzstore 2・elimino 2）と matumaeya.jp。前夜までと同じ顔ぶれ（net-o の1件は消えた）。DB 書き込みが要るので直していない。確かめられなかった1件は ogurayayamamoto.co.jp |
| check-article-links.ts --all | 38記事 / 67件 / 切れ0・移転0 | なし |
| meta-check.ts | 54ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（楽天直144・検索171） | なし |
| images:optimize | 38件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

## 3. インデックス促進

- **サイトマップの lastmod:** 今夜も `curl` が許可されておらず、本番の sitemap.xml を2回取る確認はできなかった。
  代わりに `src/app/sitemap.ts` を読んだ。記事は `dateModified`、商品一覧は商品の `updatedAt` の最大値、
  分からないものは lastModified を出さない作りで、取得のたびに変わる `new Date()` は使っていない
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage（レシピ型には Recipe）を出す。
  faq は 38/38 にある（site-check）ので欠けている記事は無い
- **IndexNow:** 孤立記事0を確かめたあと `indexnow.ts --all` で 376 URL を通知。HTTP 200
  （check-links の sitemap は 377件。差の1件は 11-15 に足した `/en` で、indexnow.ts の静的ページ一覧に
  入っていなかった。一覧に足した（次回から 377件）。`/en` だけを今夜追加で通知した）

## 4. 楽天マッチの再照合

- 下見: 171件中 一致47 / 保留124（scripts/tmp/rakuten-match-2026-11-17.json）
- triage: 自動対象1 / レビュー待ち46 / 未一致124（保留の内訳: 0.85未満27・相手だけ複数個入り12・価格差7）
- 目視で確認:
  - #14 おしゃぶり昆布 梅 12g ← 楽天は「高級おしゃぶり昆布梅 120g 徳用」（score 0.98）。量が10倍違い、
    別の商品なので**外した**（11-12・11-14 と同じ判断）。triage の「相手だけ複数個入り」は個数しか見ないため、
    重さの違いは拾えていない
- 外した結果、適用対象が0件になったため `--apply ... --write` は実行していない。**今夜の書き込みは0件**
- **レビュー待ちに残った件数: 47**（triage のレビュー46 + 目視で外した #14）
- #14 は毎晩同じ相手が自動対象に上がる。triage に重さ（g）の食い違いの除外を足すかは人の判断（基準を
  自分で作り直さない決まりのため、今夜は触っていない）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・楽天リンク切れ4件・松前屋 URL: すべて DB 書き込みで、夜間に許可されているのは楽天マッチの適用だけ
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
