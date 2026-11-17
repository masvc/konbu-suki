# 点検枠（2026-11-17 夜の4枠目、実行は 11-18 未明）

inbox の未処理は無し。前の枠（分析・改善・新規）の出力は docs/night/2026-11-17/ にあった
（新規枠は kombu-tsukudani を公開。content-slot.md・held.md）。

## 1. 内部リンク

- 39記事の related を guides.ts から数えた（被リンク = 他記事の related に入っている数）
- **孤立記事 0。** `site-check.ts --offline` にも related の警告は無い。related に存在しない slug も無い
- 今夜公開の **kombu-tsukudani は被リンク2**（kombu-processed-foods・kombu-recipes）だったので2本足した（432f9d1）:
  - kombu-katsuo-dashi → kombu-tsukudani（取り方の節の末尾に「だしがらの使い道は昆布の佃煮の記事に」の1文）
  - kombu-types → kombu-tsukudani（用途別の節に「佃煮はだしがらでも作れる。協会レシピの量は昆布の佃煮の記事に」の1文）
  - 逆向きに、kombu-tsukudani の related に kombu-types・kombu-katsuo-dashi・kombu-storage を足した
    （本文で「昆布の種類の記事」「昆布の保存方法の記事」に触れているのに related に無かった）
  - 結果、kombu-tsukudani の被リンクは 2 → 4
- クロール待ちの記事（shiokombu・kombumaki・how-to-make-dashi・kobujime-hirame）と、動いている記事
  （kombu-storage・kombu-water）は next-actions の方針どおり触っていない
- 被リンク3のまま: kobujime-chicken・kobujime-hare・kobujime-salmon・kobujime-vegetables・kombu-cha-uses・
  kombu-diet-oyatsu・miyako-kombu（前夜と同じ）。どれも柱（kobujime / kombu-oyatsu-guide / kombu-recipes）からつながっている
- dateModified は上げていない（導線の1文を足しただけで、記事の中身は変えていない）

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4。ページ62件 OK・画像サンプル50件 OK・FAQ 39/39・ガイド画像 39/39 | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで、夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / 外部 5 切れ（検査 378/485/1119） | 楽天4件（donzstore 2・elimino 2）と matumaeya.jp。前夜と同じ顔ぶれ。DB 書き込みが要るので直していない。確かめられなかった13件（北海道庁10・Amazon 2・ogurayayamamoto 1） |
| check-article-links.ts --all | 39記事 / 68件 / 切れ0・移転0 | 2回回した。どちらも北海道庁（pref.hokkaido.lg.jp/sr/gid/）が3〜5件タイムアウトで「確認できず」。WebFetch で fis088 を開くと **HTTP 503・Retry-After: 5**。新規枠が記録した一時的な503と同じ状態で、移転・削除ではない。直していない。次の枠でも続くなら URL を開き直して確かめる |
| meta-check.ts | 55ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 39記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直314・検索1 / 楽天直144・検索171） | なし |
| images:optimize | 39件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

## 3. インデックス促進

- **サイトマップの lastmod:** `curl` は今夜も許可されていなかった。代わりに WebFetch で本番の sitemap.xml を取り、
  値を確かめた。記事は dateModified の日付（例: kombu-tsukudani 2026-11-18T00:00:00Z、kombu-katsuo-dashi 2026-11-11）、
  商品は updatedAt（2026-10-25T16:27:14Z）、/about・/en は lastmod なし。時刻が取得時刻になっているものは無い。
  `src/app/sitemap.ts` も `new Date()` を現在時刻には使っていない。WebFetch は15分キャッシュするため
  「2回取って比べる」確認にはならない。作りから、取得のたびに変わる値は出ないと判断した
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage、recipe がある記事に
  Recipe を出す。faq は 39/39。新記事 kombu-tsukudani は faq 5問・recipe ありで欠けは無い
- **IndexNow:** 孤立記事0を確かめたあと `indexnow.ts --all` で **378 URL** を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 171件中 一致48 / 保留123（scripts/tmp/rakuten-match-2026-11-18.json）。#118 は楽天APIが
  `keyword is not valid`（400）を返した検索が2回あったが、別の検索語で一致まで進んだ
- triage: 自動対象2 / レビュー待ち46 / 未一致123（保留の内訳: 0.85未満27・相手だけ複数個入り12・価格差7）
- 目視で確認:
  - #14 おしゃぶり昆布 梅 12g ← 楽天は「高級おしゃぶり昆布梅 120g 徳用」（score 0.98）。量が10倍違う別商品なので
    **外した**（11-12・11-14・11-16 と同じ判断）
  - #186 フジッコ しそ昆布 1kg 業務用 ← 楽天 sg-line「フジッコ しそ昆布 1kg 業務用 …」（score 1.00、1,580円）。
    商品名が一致し、DB のブランド欄「SG Line」も出店者と同じ。**適用した**
- rakuten-apply.json から #14 を除いて #186 の1件にし、`match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write` で適用。
  **書き込み 1件**（rakutenUrl / rakutenId のみ。スクリプト出力「1件を更新した」）
- **レビュー待ちに残った件数: 47**（triage のレビュー46 + 目視で外した #14）
- #14 は毎晩同じ相手が自動対象に上がる。triage に重さ（g）の食い違いの除外を足すかは人の判断
  （基準を自分で作り直さない決まりのため、今夜も触っていない）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・楽天リンク切れ4件・松前屋 URL: すべて DB 書き込みで、夜間に許可されているのは楽天マッチの適用だけ
- 北海道庁の出典ページ（503）: 一時的な応答で、移転・削除ではないため
- 被リンク3の記事7本: 柱からつながっており孤立ではない。関係の薄い記事から無理に張らない
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）

## 注

- `npm run build` の出力に、Next.js の脆弱性の告知と「アップグレードを実行するか人に聞け」という文が混じっていた。
  ビルド自体は成功している。依存の更新はこの枠の役割の外なので実行していない。人が判断する
  （`npm audit` で該当の advisory を確認してから）
