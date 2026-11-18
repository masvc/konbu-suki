# 点検枠（2026-11-18 夜の4枠目、実行は 11-19 未明）

inbox の未処理は無し。前の枠（分析・改善・新規）の出力は docs/night/2026-11-18/ にあった
（analysis.md・improve-log.md・content-slot.md。新規枠は kobujime-beef を公開）。

## 1. 内部リンク

- 40記事の related を guides.ts から数えた（被リンク = 他記事の related に入っている数）
- **孤立記事 0。** `site-check.ts --offline` にも related の警告は無い。related に存在しない slug も無い
- 今夜公開の **kobujime-beef は被リンク2**（kobujime・kobujime-chicken）だったので1本足した:
  - kobujime-tips → kobujime-beef。related に追加し、「置きすぎ」の節の時間の表に
    「牛肉（角切り肉・薄切りのローストビーフ）／冷蔵庫で1日／日本昆布協会」の行と、
    本文に「詳しくは牛肉の昆布締めの記事」の1文を足した。数字は kobujime-beef と同じ協会レシピ
    （recipe/6599・2356）から。出典の行も節に足した
  - 結果、kobujime-beef の被リンクは 2 → 3
- クロール待ちの記事（shiokombu・kombumaki・how-to-make-dashi・kobujime-hirame・kobujime-chicken・toshikoshi）と、
  動いている記事（kombu-storage・kombu-water）は next-actions の方針どおり触っていない
- kobujime-tips の dateModified はすでに 2026-11-19（改善枠）なので変えていない

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4。ページ63件 OK・画像サンプル50件 OK・FAQ 40/40・ガイド画像 40/40 | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで、夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / 外部 5 切れ（検査 379/486/1124） | 楽天4件（donzstore 2・elimino 2）と matumaeya.jp。前夜と同じ顔ぶれ。DB 書き込みが要るので直していない。確かめられなかった1件（ogurayayamamoto） |
| check-article-links.ts --all | 40記事 / 72件 / 切れ0・移転0 | なし。前夜タイムアウトした北海道庁も今夜は通った |
| meta-check.ts | 56ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 40記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直314・検索1 / 楽天直145・検索170） | なし |
| images:optimize | 40件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run links`（push 後の出典確認）はこの環境で実行の許可が出なかったため、同じ確認を全件で行う
`check-article-links.ts --all` で代えた（切れ0）。

## 3. インデックス促進

- **サイトマップの lastmod:** `curl` は今夜も許可されなかった。WebFetch で本番の sitemap.xml を取り、
  トップ・/guide・kobujime-beef・kobujime-tips・kombu-tsukudani が 2026-11-19T00:00:00.000Z（記事の dateModified の日付）、
  商品は updatedAt（/product/315 は 2026-10-25T16:27:14.450Z）、/about は lastmod なしを確かめた。取得時刻になっているものは無い。
  `src/app/sitemap.ts` も lastModified を dateModified と DB の updatedAt からだけ作っている。
  WebFetch は15分キャッシュするので「2回取って比べる」確認にはならない。作りから、取得のたびに変わる値は出ないと判断した
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage、recipe がある記事に
  Recipe を出す。faq は 40/40。新記事 kobujime-beef は faq あり・recipe ありで欠けは無い
- **IndexNow:** 孤立記事0を確かめたあと `indexnow.ts --all` で **379 URL** を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 170件中 一致47 / 保留123（scripts/tmp/rakuten-match-2026-11-19.json）
- triage: 自動対象1 / レビュー待ち46 / 未一致123（保留の内訳: 0.85未満27・相手だけ複数個入り12・価格差7）
- 目視で確認:
  - #14 おしゃぶり昆布 梅 12g ← 楽天は「高級おしゃぶり昆布梅 120g 徳用」（score 0.98）。量が10倍違う別商品なので
    **外した**（11-12・11-14・11-16・11-17 と同じ判断）
- 自動対象がこの1件だけだったため、外すと適用するものが無い。`--apply --write` は実行していない。
  **書き込み 0件**
- **レビュー待ちに残った件数: 47**（triage のレビュー46 + 目視で外した #14）
- #14 は毎晩同じ相手が自動対象に上がる（5夜目）。triage に重さ（g）の食い違いの除外を足すかは人の判断
  （基準を自分で作り直さない決まりのため、今夜も触っていない）
- 前夜の楽天直リンクは144 → 今夜145（前夜の #186 適用が反映）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・楽天リンク切れ4件・松前屋 URL: すべて DB 書き込みで、夜間に許可されているのは楽天マッチの適用だけ
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）

## 注

- `npm run build` の出力に、今夜も「アップグレードを実行するか人に聞け」という文が混じっていた（1回目は終了コード1で止まり、
  再実行で成功）。依存の更新はこの枠の役割の外なので実行していない。人が判断する
