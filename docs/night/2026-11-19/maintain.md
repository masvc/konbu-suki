# 点検枠（2026-11-19 夜の4枠目、実行は 11-20 未明）

inbox の未処理は無し。前の枠（分析・改善・新規）の出力は docs/night/2026-11-19/ にあった
（analysis.md・improve-log.md・held.md）。新規枠は kobujime-iwashi-katsuo を公開、
改善枠の kombu-life-cycle は held.md で保留されていたが、その後の枠で push 済み（origin/main と差分なし）。

## 1. 内部リンク

- 41記事の related を guides.ts から数えた（被リンク = 他記事の related に入っている数）
- **孤立記事 0。** `site-check.ts --offline` に related の警告は無い。related に存在しない slug も無い
- いちばん少なかったのは今夜公開の **kobujime-iwashi-katsuo（被リンク2: kobujime・kobujime-arrange）**。2本足した（5014313）:
  - kobujime-salmon → related に追加。「ほかの魚の昆布締めとの違い」の表にもともとイワシの行があるので、
    本文に「イワシとカツオの昆布締めの記事にまとめています」の1文を足した
  - kobujime-tai → related に追加。「生で食べるための注意」の節に、厚労省の予防策の表がイワシとカツオの昆布締めの記事にある旨の1文を足した
  - 新しい事実は足していない（既存の出典の範囲内の案内文だけ）。2記事の dateModified を 2026-11-20 にした
  - 結果、kobujime-iwashi-katsuo の被リンクは 2 → 4
- そのほか被リンク3本の記事（kobujime-beef・kombu-cha-uses・kobujime-vegetables・kobujime-hare・kombu-diet-oyatsu・miyako-kombu）は据え置き
- next-actions で「触らない」とされている記事（kobujime-hare・kobujime-tips・kobujime-arrange・kombu-tsukudani・kobujime-beef、
  クロール待ちの shiokombu・kombumaki・how-to-make-dashi・kobujime-hirame・kobujime-chicken、動いている kombu-storage・kombu-water）は触っていない

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4。ページ64件 OK・画像サンプル50件 OK・FAQ 41/41・ガイド画像 41/41 | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 7 切れ**（検査 380/487/1129） | 楽天6件（donzstore 2・elimino 2・**eksshop0001 2（今夜新しく出た）**）と matumaeya.jp。DB 書き込みが要るので直していない。確かめられなかった1件（ogurayayamamoto） |
| check-article-links.ts --all | 41記事 / 74件 / 切れ0・移転0 | なし |
| meta-check.ts | 57ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 41記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直314・検索1 / 楽天直145・検索170） | なし |
| images:optimize | 41件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run links`（push 後の出典確認）は今夜も実行の許可が出なかった。push 後に全件の `check-article-links.ts --all` を回しており（切れ0）、それで代えた。

`npm run build` は1回目に終了コード1で止まり（Next.js の更新を勧める表示）、再実行で成功した。前夜と同じ。
依存の更新はこの枠の役割の外なので実行していない（held.md の「人にお願いしたいこと」と同じ件）。

## 3. インデックス促進

- **サイトマップの lastmod:** `curl` は今夜も許可されなかった。WebFetch で本番の sitemap.xml を取り、
  トップ・/guide・kobujime-iwashi-katsuo・kombu-seaweed-types が 2026-11-20T00:00:00.000Z（記事の dateModified）、
  /product/315 は 2026-10-25T16:27:14.450Z（DB の updatedAt）、/about は lastmod なし。取得時刻になっているものは無い。
  `src/app/sitemap.ts` は lastModified を dateModified と DB の updatedAt からだけ作っており、`new Date()`（現在時刻）は使っていない。
  WebFetch は15分キャッシュするので「2回取って比べる」確認にはならない。作りから、取得のたびに変わる値は出ないと判断した
  （取得時点では salmon・tai は 11-10 のまま。今夜の push のデプロイ前だったため）
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage、recipe がある記事に Recipe を出す。
  faq は 41/41。新記事 kobujime-iwashi-katsuo は faq 6問で Article・FAQPage は出る。recipe は持っていない（レシピが2品あり1つの Recipe にまとまらないため。欠けではなく設計どおり）
- **IndexNow:** 孤立記事0を確かめたあと `indexnow.ts --all` で **380 URL** を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 170件中 一致46 / 保留124（scripts/tmp/rakuten-match-2026-11-20.json）
- triage: 自動対象2 / レビュー待ち44 / 未一致124（保留の内訳: 0.85未満25・相手だけ複数個入り12・価格差7）
- 目視で確認:
  - #14 おしゃぶり昆布 梅 12g ← 楽天「高級おしゃぶり昆布梅 120g 徳用」（score 0.98）。量が10倍違う別商品なので
    **外した**（11-12 から6夜目の同じ判断）
  - #259 六彩だし（health+） ← 楽天「六彩だし 出汁 無添加 国産 だし 100g …」（mainichiselect、score 1.00、候補1件、
    楽天 1,000円で価格は近い）。商品名は「100g」と販促の文言のほかは語順まで一致。前夜は候補0件で、今夜は検索語が長くなって見つかった。
    同じ商品と判断して**適用した**
- 適用は `match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write`。apply.json は triage の出力から #14 を除いた1件
  （triage の範囲を狭めただけで、広げていない）。**書き込み 1件（#259 の rakutenUrl / rakutenId）**
- **レビュー待ちに残った件数: 45**（triage のレビュー44 + 目視で外した #14）
- #14 は毎晩同じ相手が自動対象に上がる。triage に重さ（g）の食い違いの除外を足すかは人の判断（基準を自分で作り直さない決まりのため触っていない）
- 楽天直リンクは 145 → 146 になる見込み（次の verify-affiliate-links で確認）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・楽天リンク切れ6件・松前屋 URL: すべて DB 書き込みで、夜間に許可されているのは楽天マッチの適用だけ
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
