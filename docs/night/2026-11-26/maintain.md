# 点検枠（2026-11-26 夜の4枠目、実行は 11-27 未明）

inbox の未処理は無し。前の枠の出力は docs/night/2026-11-26/ にあった（analysis.md・improve-log.md・ai-citation*・index-status.*・status-*.json）。
新規枠は kubu-irichi（クーブイリチーの作り方）を公開済み（c394b45・a193f2b）。

## 1. 内部リンク

- 44記事の related を guides.ts から数えた（`grep` で slug のキー行と related 行を出し、slug ごとに被リンク元を数えた。`scripts/tmp/orphans.ts` は今夜も `npx tsx` の許可が無く実行できなかった）
- **孤立記事 0。** 全44記事が他記事の related に入っている。存在しない slug を指す related も無い。`site-check.ts --offline` に related の警告は無い
- 新しい kubu-irichi の被リンクは2本（kombu-recipes・kombu-history）。柱の kombu-recipes は related に入れているうえ、本文の「煮込まずに炒めるなら、だしがらのクーブイリチー」の節でも触れている。kubu-irichi の本文も「昆布を使ったレシピ集と昆布の佃煮の記事」に触れている
- 柱（kobujime・how-to-make-dashi・kombu-types・kombu-oyatsu-guide・kombu-recipes・kombu-processed-foods）と配下は双方向につながっている（昆布締め10本はすべて kobujime へ、だし系6本はすべて how-to-make-dashi へ、おやつ4本はすべて kombu-oyatsu-guide へ戻る）
- **今夜は変えていない。** kubu-irichi を kombu-tsukudani の related に足すのがいちばん話題が近いが、tsukudani は next-actions.md の「クロール待ち・触らない記事」に入っているため据え置いた。孤立ではないので急がない。tsukudani のクロール後に足す候補

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4 / INFO 14。ページ 67 OK・画像404 0（サンプル50）・FAQ 44/44・ガイド画像 44/44・E-E-A-T ページ3つ | WARN は画像なし1・購入リンクなし2・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 1 切れ**（検査 383/490/1146）。確かめられなかった 1（ogurayayamamoto） | 切れは **#301 廣川昆布 御昆布 8品佃煮詰合せ の楽天リンク**（mctachu/4997644003350、404）。外すには rakutenUrl を空にする DB 書き込みが要り、夜間の許可（match-rakuten の --apply 経由の付け替え）の外なので**直していない**。人が `scripts/check-affiliate-links.ts` で外す |
| check-article-links.ts --all | 44記事 / 84件 / 切れ0・移転0 | なし |
| meta-check.ts | 60ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 44記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直313・検索2 / 楽天直142・検索173。楽天マッチ適用前） | なし |
| images:optimize | 44件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

## 3. インデックス促進

- **サイトマップの lastmod:** `curl -s https://konbu-suki.com/sitemap.xml` は今夜も承認待ちで拒否され、本番を2回取って比べられていない。
  `src/app/sitemap.ts` は lastModified を記事の dateModified と DB の updatedAt からだけ作り、現在時刻は使っていない（コードで確認）。そのため値は取得のたびには変わらない
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、FAQ のある記事に FAQPage（44/44）、recipe のある記事に Recipe、itemList 指定の記事に ItemList を出す。新しい kubu-irichi も FAQ ありで欠けは無い
- **IndexNow:** 孤立記事0を確かめてから `indexnow.ts --all` で **383 URL** を通知した。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 173件中 一致51 / 保留122（scripts/tmp/rakuten-match-2026-11-27.json）
- triage: 自動対象6 / レビュー待ち45 / 未一致122（保留の内訳: 0.85未満29・相手だけ複数個入り10・価格差6）。triage の元の出力は scripts/tmp/rakuten-apply-2026-11-27-triage.json に残した
- 自動対象6件を目で確かめた結果:
  - #15 前島食品 北海道産 おやつ昆布 100g ← zozo「揚げ昆布 100g …」（1.00）。相手は揚げ昆布でブランドも無く別商品。**外した**（5夜続けて同じ判断）
  - #48 ファイン 根昆布エキス粒 ×2個セット ← echirota、品名完全一致。**適用**
  - #155 天然生活 訳あり おしゃぶり昆布梅味 100g ← echirota、品名一致。**適用**
  - #160 天然生活 訳あり おしゃぶり昆布 100g ← echirota、品名一致。**適用**
  - #243 ヘルシーカンパニー 昆布茶 400g ← echirota、品名一致。**適用**
  - #265 ねこぶだし 450ml **2本セット** ← hidacurt「…（**3本セット**）」。入り数が違う別商品。triage の「相手だけ複数個入り」は両方が複数個入りのときに当たらないため上がってきた。**外した**
- **適用 4件**（`match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write`、書き換えたのは rakutenUrl/rakutenId のみ）
- **レビュー待ちに残った件数: 47**（triage のレビュー45 + 目視で外した #15・#265）
- triage に「揚げ等の別加工」「セットの本数違い」の除外を足すかは人の判断（基準を自分で作り直さない決まりのため触っていない）

## 直さなかったもの（理由）

- 楽天リンク切れ1件（#301）: 外すのは DB 書き込みで夜間の許可の外。人が `scripts/check-affiliate-links.ts` で外す
- 商品 DB の WARN 4件（画像なし1・購入リンクなし2・重複1）: DB 書き込みが要り、夜間の許可の外
- kombu-tsukudani の related に kubu-irichi を足すこと: 触らない記事に入っているため
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
- サイトマップの2回取得: curl が許可されていない
