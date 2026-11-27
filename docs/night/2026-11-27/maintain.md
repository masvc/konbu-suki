# 点検枠（2026-11-27 夜の4枠目、実行は 11-28 未明）

inbox の未処理は無し。前の枠の出力は、docs/night/2026-11-27/ には status-create.json だけがあった（分析枠・改善枠の出力は**無かった**）。
新規枠は senmaizuke-kombu（千枚漬けの作り方と昆布）を公開済み（e6862ba ほか）。

## 1. 内部リンク

- 45記事の related を guides.ts から数えた（`grep` で related 行の slug を抜き出し、`uniq -c` で被リンク数を数えた）
- **孤立記事 0。** 全45記事が他記事の related に入っている（最少は kubu-irichi と senmaizuke-kombu の2本）。`site-check.ts --offline` に related の警告は無い
- 新しい senmaizuke-kombu の被リンク元は柱の kombu-recipes と kombu-comparison の2本で、どちらも本文で千枚漬けに触れている（新規枠が追加）。senmaizuke-kombu の related は kobujime-vegetables・matsumaezuke・kombu-recipes・kombu-comparison で、本文でも「松前漬けの作り方の記事」「野菜の昆布締めの記事」「利尻・羅臼・日高・真昆布の違いの記事」に触れている
- **今夜は related を変えていない。** 逆方向のリンクを足すなら kobujime-vegetables と rausu-kombu から千枚漬けへが話題として近いが、どちらも next-actions.md の「触らない記事」に入っている。matsumaezuke は問いの言い回しだけが例外扱いなので、ここも触っていない。孤立ではないので急がない
- 柱と配下のつながりは前夜から変わっていない（昆布締め10本は kobujime へ、だし系は how-to-make-dashi へ、おやつ4本は kombu-oyatsu-guide へ戻る）

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4 / INFO 14。ページ 68 OK・画像404 0（サンプル50）・FAQ 45/45・ガイド画像 45/45・E-E-A-T ページ3つ | WARN は画像なし1・購入リンクなし2・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品DBへの書き込みが要り、夜間の許可の外なので直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 1 切れ**（検査 384/491/1148）。確かめられなかった 1（ogurayayamamoto） | 切れは前夜と同じ **#301 の楽天リンク**（mctachu/4997644003350、404）。外すには DB 書き込みが要り、夜間の許可の外なので**直していない**。人が `scripts/check-affiliate-links.ts` で外す（2夜続けて残っている） |
| check-article-links.ts --all | 45記事 / 85件 / 切れ0・移転0 | なし |
| meta-check.ts | 61ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 45記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直313・検索2 / 楽天直146・検索169。楽天マッチ適用前） | なし |
| images:optimize | 45件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY が未設定で、共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

## 3. インデックス促進

- **サイトマップの lastmod:** `curl -s https://konbu-suki.com/sitemap.xml` は今夜も承認が必要で拒否され、本番の値を2回取って比べられなかった。
  コードで確かめた: `src/app/sitemap.ts` は lastModified を記事の dateModified と DB の updatedAt だけから作っていて、現在時刻は使っていない。なので値は取得のたびには変わらない
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、FAQ のある記事に FAQPage（45/45）、recipe のある記事に Recipe、itemList を指定した記事に ItemList を出す。新しい senmaizuke-kombu も FAQ があり、欠けは無い
- **IndexNow:** 孤立記事0を確かめてから `indexnow.ts --all` で **384 URL** を通知した。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 169件中 一致48 / 保留121（scripts/tmp/rakuten-match-2026-11-28.json）
- triage: 自動対象5 / レビュー待ち43 / 未一致121（保留の内訳: 0.85未満29・相手だけ複数個入り9・価格差5）。triage の元の出力は scripts/tmp/rakuten-apply-2026-11-28-triage.json に残した
- 自動対象5件を目で確かめた結果:
  - #15 前島食品 北海道産 おやつ昆布 100g ← zozo「揚げ昆布 100g …」（1.00）。相手は揚げ昆布の別商品。**外した**（6夜続けて同じ判断）
  - #63 シマヤ こんぶだしの素 顆粒1kg ← worldnext、品名が完全に一致。**適用**
  - #79 坂昆 天然 **羅臼昆布** 加工用 500g ← bariasu-online「坂昆 天然 **利尻昆布** 加工用 500g」（0.97）。昆布の種類が違う別商品。**外した**
  - #218 丸美屋 混ぜ込みわかめ しそ昆布 29g×5 ← agri-support「混ぜ込みわかめ 29g×5個 鮭 若菜 梅しそ おかか しそ昆布 …」。複数の味から選ぶ商品ページで、しそ昆布5個と同じかどうかが品名から確かめられない。**外した**
  - #265 ねこぶだし 450ml **2本セット** ← hidacurt「…（**3本セット**）」。本数が違う別商品。**外した**（前夜と同じ）
- **適用 1件**（`match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write`。書き換えたのは rakutenUrl/rakutenId だけ）
- **レビュー待ちに残った件数: 47**（triage のレビュー43 + 目視で外した #15・#79・#218・#265）
- triage は名称の一致だけを見ているので、「産地・種類の語の違い（羅臼/利尻）」「揚げ等の加工の違い」「セットの本数違い」を通してしまう。除外を足すかは人が判断する（基準を自分で作り直さない決まりなので触っていない）

## 直さなかったもの（理由）

- 楽天リンク切れ1件（#301）: 外すのは DB 書き込みで、夜間の許可の外。人が `scripts/check-affiliate-links.ts` で外す
- 商品DBの WARN 4件（画像なし1・購入リンクなし2・重複1）: DB 書き込みが要り、夜間の許可の外
- 千枚漬けへの逆リンク（kobujime-vegetables・rausu-kombu から）: どちらも「触らない記事」に入っているため
- Core Web Vitals: API の上限で測れなかった。`.env` の PAGESPEED_API_KEY に値を入れれば毎晩測れる（キー名だけ記録。値は人が入れる）
- サイトマップの2回取得: curl が許可されていない。コードで代わりに確かめた
- **手元の node_modules の Next.js が 16.4.3 のまま。** package.json と package-lock.json は 16.4.6（11-25 の更新）なのに、この PC の node_modules が古い。`npm run build` が1回目に「既知の脆弱性がある」として止まり、2回目は警告だけで通った。本番（Amplify）はロックファイルからインストールするので 16.4.6 のはず。夜間に依存関係を入れ替えるのは枠の役目の外なので、ビルドの出力が勧めていた `next upgrade` は実行していない。**人がこの PC で `npm ci` を実行して揃える**
