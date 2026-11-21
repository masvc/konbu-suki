# 点検枠（2026-11-21 夜の4枠目、実行は 11-22 未明）

inbox の未処理は無し。前の枠の出力は docs/night/2026-11-21/ にあった（analysis.md・improve-log.md・held.md・status-*.json）。

## 1. 内部リンク

- 41記事の related を guides.ts から数えた（被リンク = 他記事の related に入っている数）
- **孤立記事 0。** 開始時点で全記事が被リンク3本以上（最少は kobujime-beef・kombu-diet-oyatsu の3）。
  `site-check.ts --offline` に related の警告は無い。数えた slug は41種で記事数と一致し、存在しない slug は無い
- kombu-nutrition は本文の結論の節で「昆布おやつとダイエットの記事」に触れているのに、related に入っていなかった。
  related に kombu-diet-oyatsu を足した（ebbd3b6）。kombu-diet-oyatsu の被リンクは 3→4。
  本文は変えていないので dateModified は動かしていない

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4。ページ64件 OK・画像サンプル50件 OK・FAQ 41/41・ガイド画像 41/41 | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 8 切れ**（検査 380/487/1130） | 前夜の7件に楽天1件（goodfindstore/b0gf2j9csy）が増えた。楽天7件（donzstore 2・elimino 2・eksshop0001 2・goodfindstore 1）と matumaeya.jp。どれも DB の URL で、直すには DB 書き込みが要る。直していない。確かめられなかった1件（ogurayayamamoto） |
| check-article-links.ts --all | 41記事 / 75件 / 切れ0・移転0 | なし |
| meta-check.ts | 57ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 41記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直314・検索1 / 楽天直146・検索169） | なし |
| images:optimize | 41件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run build` は1回目に終了コード1で止まり（Next.js の更新を勧める SecurityFatalError）、再実行で成功した。前夜と同じ。
依存の更新はこの枠の役割の外なので実行していない。

## 3. インデックス促進

- **サイトマップの lastmod:** `curl` は今夜も許可されなかった。WebFetch で本番の sitemap.xml を取った。
  トップ・/guide・kombumaki・miyako-kombu が 2026-11-22T00:00:00.000Z（kombumaki と miyako-kombu の dateModified が 2026-11-22）、
  rausu-kombu 2026-11-21、kombu-nutrition 2026-11-14（どれも guides.ts の dateModified と一致）、
  /product/315 は 2026-10-25T16:27:14.450Z（DB の updatedAt）、/about は lastmod なし。取得時刻になっているものは無い。
  `src/app/sitemap.ts` は lastModified を dateModified と DB の updatedAt からだけ作っている。
  WebFetch はキャッシュするので「2回取って比べる」確認にはならない。作りから、取得のたびに変わる値は出ないと判断した
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage、recipe がある記事に Recipe を出す。
  faq は 41/41（site-check）。今夜の新規記事は無いので欠けは無い
- **IndexNow:** 孤立記事0を確かめたあと `indexnow.ts --all` で **380 URL** を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 169件中 一致46 / 保留123（scripts/tmp/rakuten-match-2026-11-22.json）
- triage: 自動対象1 / レビュー待ち45 / 未一致123（保留の内訳: 0.85未満26・相手だけ複数個入り12・価格差7）
- 目視で確認:
  - 自動対象の1件は前夜までと同じ #14 おしゃぶり昆布 梅 12g ← 楽天「高級おしゃぶり昆布梅 120g 徳用」（score 0.98）。
    量が10倍違う別商品なので**外した**
- 適用対象が0件になったので `match-rakuten.ts --apply ... --write` は実行していない（apply.json は空にした）。**書き込み 0件**
- **レビュー待ちに残った件数: 46**（triage のレビュー45 + 目視で外した #14）
- #14 は毎晩同じ相手が自動対象に上がる。triage に重さ（g）の食い違いの除外を足すかは人の判断（基準を自分で作り直さない決まりのため触っていない）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・楽天リンク切れ7件・松前屋 URL: すべて DB 書き込みが要る。夜間に許可されているのは楽天マッチの適用（rakutenUrl/rakutenId を triage 経由で埋める）だけで、切れた URL を消す・差し替える操作は範囲の外
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
- Next.js のセキュリティ更新: ビルド時に勧告が出ている。依存の更新は人の判断
