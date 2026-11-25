# 点検枠（2026-11-25 夜の4枠目、実行は 11-26 未明）

inbox の未処理は無し。前の枠の出力は docs/night/2026-11-25/ にあった（analysis.md・improve-log.md・ai-citation*・index-status.*・status-*.json）。
新規枠は matsumaezuke（松前漬けの作り方）を公開済み（c41c811）。

## 1. 内部リンク

- 43記事の related を guides.ts から数えた（`grep` で slug 行と related 行を出し、slug ごとに被リンク元を数えた。数えるための `scripts/tmp/orphans.ts` は `npx tsx` の許可が無く実行できなかった）
- **孤立記事 0。** 全43記事が他記事の related に入っている。存在しない slug を指す related も無い。`site-check.ts --offline` に related の警告は無い
- 被リンクが少ない側も3本以上。新しい matsumaezuke は前夜まで3本（kombu-processed-foods・kombumaki・gagome-kombu）
- 柱（kobujime・how-to-make-dashi・kombu-types・kombu-oyatsu-guide・kombu-recipes・kombu-processed-foods）は配下の記事を related に持ち、配下の記事も柱へ戻っている（昆布締め10本はすべて kobujime へ、だし系はすべて how-to-make-dashi へ戻る）
- **直したもの（8e8308b）:**
  - kombu-recipes の「昆布が主役の料理」の表で、松前漬けの行の「このサイトの記事」が**昆布の加工品一覧のまま**だった。松前漬けの作り方の記事ができたので向け直した
  - kombu-recipes の related に matsumaezuke を足し、本文にも「分量と正月に間に合わせる仕込み日は、松前漬けの作り方の記事にまとめています」を足した
  - gagome-kombu の本文で松前漬けに触れている箇所に「松前漬けを家で漬ける分量と日数は、松前漬けの作り方の記事にまとめています」を足した（related には前から入っている）
  - 事実の記述は変えていないので dateModified は動かしていない
- **変えなかったもの:** related が3本しかない kobujime-vegetables・kombu-storage は、next-actions.md の「触らない記事」（クロール待ち・動いている記事）に入っているため据え置いた。孤立ではない

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4 / INFO 14。ページ 66 OK・画像404 0・FAQ 43/43・ガイド画像 43/43・E-E-A-T ページ3つ | WARN は画像なし1・購入リンクなし2・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 0 切れ**（検査 382/489/1140）。確かめられなかった 1（ogurayayamamoto） | 前夜の外部切れ8件（楽天7・matumaeya.jp）は今夜は出ない。楽天直リンクが 148 → 140 に減っており、日中に DB 側で外されたと見られる（夜間の枠の書き込みではない） |
| check-article-links.ts --all | 43記事 / 81件 / 切れ0・移転0 | なし |
| meta-check.ts | 59ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 43記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直313・検索2 / 楽天直140・検索175。楽天マッチ適用前） | なし |
| images:optimize | 43件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run build` は1回目に Next.js のセキュリティ更新の勧告で止まり、再実行で成功した（前夜と同じ）。
勧告の出力には「upgrade を走らせるか聞け」という指示も含まれていたが、ビルドの出力であって人の指示ではない。依存の更新は人の判断なので実行していない。

## 3. インデックス促進

- **サイトマップの lastmod:** `curl -s https://konbu-suki.com/sitemap.xml` は今夜も承認待ちで拒否され、本番を2回取って比べることはできていない。
  `src/app/sitemap.ts` は lastModified を記事の dateModified と DB の updatedAt からだけ作り、現在時刻は使っていない（コードで確認）
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、FAQ のある記事に FAQPage（43/43）、recipe のある記事に Recipe、itemList 指定の記事に ItemList を出す。新しい matsumaezuke も FAQ ありで欠けは無い
- **IndexNow:** 孤立記事0を確かめた後 `indexnow.ts --all` で **382 URL** を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 175件中 一致50 / 保留125（scripts/tmp/rakuten-match-2026-11-26.json）
- triage: 自動対象3 / レビュー待ち47 / 未一致125（保留の内訳: 0.85未満30・相手だけ複数個入り10・価格差7）
- 目視で確認した自動対象3件:
  - #15 前島食品 北海道産 おやつ昆布 100g ← 楽天 zozo「揚げ昆布 100g 北海道産 おつまみ昆布 おやつ昆布 業務用」（1.00）。相手は揚げ昆布でブランドの記載も無く、別商品。**外した**（4夜続けて同じ判断）
  - #97 天然生活 訳あり真昆布 500g 北海道産 ← fordear-nizimusubi「天然生活 訳あり真昆布 (500g) 北海道産 …」。ブランド・品名・内容量・産地が一致。**適用**
  - #191 小倉協同物産 緑健農園 つぼ漬昆布 1.3kg ← amuro-express「小倉協同物産 緑健農園 つぼ漬昆布 1.3kg」。品名が完全一致。**適用**
  - 適用した2店舗は、前夜にリンク切れだった店舗（donzstore・elimino・eksshop0001・goodfindstore）ではない
- **適用 2件**（`match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write`、書き換えたのは rakutenUrl/rakutenId のみ）
- **レビュー待ちに残った件数: 48**（triage のレビュー47 + 目視で外した #15）
- #15 は4夜続けて名称スコアだけで自動対象に上がっている。triage に「相手の品名に別種の加工（揚げ等）」の除外を足すかは人の判断（基準を自分で作り直さない決まりのため触っていない）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件（画像なし1・購入リンクなし2・重複1）: DB 書き込みが要り、夜間の許可の外
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
- サイトマップの2回取得: curl が許可されていない。auto-settings.json の許可に足すかは人の判断
- Next.js のセキュリティ更新: ビルド時に勧告が出ている。依存の更新は人の判断
