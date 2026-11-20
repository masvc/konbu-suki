# 点検枠（2026-11-20 夜の4枠目、実行は 11-21 未明）

inbox の未処理は無し。前の枠の出力は docs/night/2026-11-20/ にあった（analysis.md・improve-log.md・held.md）。
新規枠（status-create.json）はコミット0・1分で終わっていて、新しい記事は無かった。
改善枠の held.md にあった rausu-kombu の FAQ（0b34a00）は、この枠の開始時点で origin/main と差分なし（push 済み）。

## 1. 内部リンク

- 41記事の related を guides.ts から数えた（被リンク = 他記事の related に入っている数）
- **孤立記事 0。** 開始時点で全記事が被リンク3本以上。`site-check.ts --offline` に related の警告は無い。存在しない slug も無い
- 柱と個別のつながりを確かめた。昆布締め（kobujime）・おやつ（kombu-oyatsu-guide）・種類（kombu-types）の柱は配下を全部 related に持ち、
  配下の各記事は柱を related に持っている
- 被リンクの少ない記事を中心に3記事の related を足した（4d6713e）
  - kobujime-tips: 野菜・イワシとカツオ・正月の昆布締めを足して、昆布締めの個別記事を全部並べた。
    「置きすぎ」の節に、素材ごとの手順は各記事（タイトルを挙げて）にある旨の1文を足した
  - kombu-nutrition: 昆布茶の使い方・塩昆布を足した。「塩昆布と昆布だしの成分」の節に、昆布茶は成分表のし好飲料類（16051）で
    100gあたり食塩相当量51.3g・ヨウ素26,000μg、換算表は「昆布茶の使い方」にある旨を足した。数字は kombu-cha-uses と同じ出典（食品成分データベース 16051）で、出典欄に URL を足した
  - how-to-make-dashi: 七草がゆのだしを足した（季節記事。年末年始の需要に向けて柱から入れるように）
  - 本文の追記は案内文と既存出典の範囲内の数字だけなので、dateModified は動かしていない
- 結果: kombu-cha-uses 3→4、kobujime-vegetables 3→4、kobujime-hare 3→4、kobujime-iwashi-katsuo 4→5、shiokombu-guide 6→7、nanakusa-gayu-dashi 4→5

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4。ページ64件 OK・画像サンプル50件 OK・FAQ 41/41・ガイド画像 41/41 | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 7 切れ**（検査 380/487/1129） | 前夜と同じ7件。楽天6件（donzstore 2・elimino 2・eksshop0001 2）と matumaeya.jp。DB 書き込みが要るので直していない。確かめられなかった1件（ogurayayamamoto） |
| check-article-links.ts --all | 41記事 / 74件 / 切れ0・移転0 | なし |
| meta-check.ts | 57ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 41記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直314・検索1 / 楽天直146・検索169） | 前夜の #259 適用で楽天直 145→146 になったことを確認 |
| images:optimize | 41件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run build` は1回目に終了コード1で止まり（Next.js の更新を勧める SecurityFatalError）、再実行で成功した。前夜と同じ。
依存の更新はこの枠の役割の外なので実行していない（held.md の「人にお願いしたいこと」と同じ件）。

## 3. インデックス促進

- **サイトマップの lastmod:** `curl` は今夜も許可されなかった。WebFetch で本番の sitemap.xml を取り、
  トップ・/guide・rausu-kombu が 2026-11-21T00:00:00.000Z（rausu-kombu の dateModified）、kobujime-iwashi-katsuo が 2026-11-20T00:00:00.000Z、
  kobujime-tips 2026-11-19・kombu-nutrition 2026-11-14（どちらも記事の dateModified のまま）、
  /product/315 は 2026-10-25T16:27:14.450Z（DB の updatedAt）、/about は lastmod なし。取得時刻になっているものは無い。
  `src/app/sitemap.ts` は lastModified を dateModified と DB の updatedAt からだけ作り、`new Date()` は使っていない。
  WebFetch は15分キャッシュするので「2回取って比べる」確認にはならない。作りから、取得のたびに変わる値は出ないと判断した

- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage、recipe がある記事に Recipe を出す。
  faq は 41/41（site-check）。今夜の新規記事は無いので、欠けは無い
- **IndexNow:** 孤立記事0を確かめたあと `indexnow.ts --all` で **380 URL** を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 169件中 一致47 / 保留122（scripts/tmp/rakuten-match-2026-11-21.json）
- triage: 自動対象1 / レビュー待ち46 / 未一致122（保留の内訳: 0.85未満27・相手だけ複数個入り12・価格差7）
- 目視で確認:
  - 自動対象の1件は #14 おしゃぶり昆布 梅 12g ← 楽天「高級おしゃぶり昆布梅 120g 徳用」（score 0.98）。量が10倍違う別商品なので
    **外した**（11-12 から7夜目の同じ判断）
- 適用対象が0件になったので `match-rakuten.ts --apply ... --write` は実行していない（apply.json は空にした）。**書き込み 0件**
- **レビュー待ちに残った件数: 47**（triage のレビュー46 + 目視で外した #14）
- #14 は毎晩同じ相手が自動対象に上がる。triage に重さ（g）の食い違いの除外を足すかは人の判断（基準を自分で作り直さない決まりのため触っていない）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・楽天リンク切れ6件・松前屋 URL: すべて DB 書き込みで、夜間に許可されているのは楽天マッチの適用だけ
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
