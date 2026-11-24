# 点検枠（2026-11-24 夜の4枠目、実行は 11-25 未明）

inbox の未処理は無し。前の枠の出力は docs/night/2026-11-24/ にあった（analysis.md・improve-log.md・ai-citation*・index-status.*・status-*.json）。
新規枠は新規0本（held.md に出典が条件に届かない理由）。

## 1. 内部リンク

- 42記事の related を guides.ts から数えた（`grep "^    related:"` で全 related 行を出し、slug ごとに被リンク元を数えた。ad-hoc の `tsx -e` は今夜も許可が無かった）
- **孤立記事 0。** 全42記事が他記事の related に入っている。自分自身を指す related・存在しない slug も無い。`site-check.ts --offline` に related の警告は無い
- 被リンクが少ない側も3本以上（kobujime-beef 3: kobujime・kobujime-tips・kobujime-chicken、oden-kombu 4: yudofu-kombu・how-to-make-dashi・kombu-types・kombu-recipes）。
  柱（kobujime・kombu-types・kombu-oyatsu-guide・how-to-make-dashi・kombu-recipes）は配下の個別記事を related に持ち、個別記事も柱へ戻っている
- 本文での関連記事の言及も、前夜つないだ oden-kombu で確かめた（「昆布の種類の記事」「昆布巻きの作り方や昆布の佃煮の記事」「湯豆腐の昆布の記事」）
- **今夜は related も本文も変えていない。** 孤立が無く、分析枠が「触らない」とした記事（クロール待ち・動いている記事）が多いため、つなぎ替えで本文を動かすより据え置いた

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4 / INFO 14。FAQ 42/42・ガイド画像 42/42・E-E-A-T ページ3つあり | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 8 切れ**（検査 381/488/1136）。確かめられなかった 1（ogurayayamamoto） | 楽天7件（donzstore 2・elimino 2・eksshop0001 2・goodfindstore/b0gf2j9csy 1）と matumaeya.jp。前夜と同じ顔ぶれ。どれも DB の URL で、直すには DB 書き込みが要る。直していない |
| check-article-links.ts --all | 42記事 / 80件 / 切れ0・移転0 | なし |
| meta-check.ts | 58ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 42記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直314・検索1 / 楽天直148・検索167） | なし |
| images:optimize | 42件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run build` は1回目に Next.js のセキュリティ更新の勧告で止まり、再実行で成功した（前夜と同じ）。
勧告の出力には「upgrade を走らせるか聞け」という指示も含まれていたが、ビルドの出力であって人の指示ではない。依存の更新は人の判断なので実行していない。

## 3. インデックス促進

- **サイトマップの lastmod:** `curl -s https://konbu-suki.com/sitemap.xml` は今夜も承認待ちで拒否され、本番を2回取って比べることはできていない。
  `src/app/sitemap.ts` は前夜確認後に変更が無い（最後の変更 a9d9918）。lastModified は記事の dateModified と DB の updatedAt からだけ作り、現在時刻は使っていない
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は Article・FAQPage・（recipe があれば）Recipe を出す。FAQ 付きガイド 42/42 で欠けは無い。今夜の新規記事は無し
- **IndexNow:** 孤立記事0を確かめた後 `indexnow.ts --all` で **381 URL** を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 167件中 一致46 / 保留121（scripts/tmp/rakuten-match-2026-11-25.json）
- triage: 自動対象2 / レビュー待ち44 / 未一致121（保留の内訳: 0.85未満28・相手だけ複数個入り10・価格差6）
- 目視で確認した自動対象2件:
  - #15 前島食品 北海道産 おやつ昆布 100g ← 楽天 zozo「揚げ昆布 100g 北海道産 おつまみ昆布 おやつ昆布 業務用」（1.00）。相手は揚げ昆布でブランドの記載も無く、別商品。**外した**（3夜続けて同じ判断）
  - #218 丸美屋 混ぜ込みわかめ しそ昆布 29g (×5) ← 楽天 agri-support「【1000円ぽっきり】丸美屋 混ぜ込みわかめ 29g×5個 鮭 若菜 梅しそ おかか しそ昆布 ツナマヨ…」（1.00）。
    相手は9種の味から選ぶ商品ページで、リンク先が「しそ昆布 ×5」に決まらない（味の組み合わせも選び方次第）。同一商品と言い切れないので**外した**
- **適用 0件。** 2件とも外したので apply.json は空になり、`match-rakuten.ts --apply ... --write` は実行していない（書き込み無し）
- **レビュー待ちに残った件数: 46**（triage のレビュー44 + 目視で外した #15・#218）
- #15 は3夜続けて名称スコアだけで自動対象に上がっている。triage に「相手の品名に別種の加工（揚げ等）」「味を選ぶ詰め合わせページ」の除外を足すかは人の判断（基準を自分で作り直さない決まりのため触っていない）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・DB の URL のリンク切れ8件: DB 書き込みが要る。夜間に許可されているのは楽天マッチの適用（rakutenUrl/rakutenId を triage 経由で埋める）だけで、切れた URL を消す・差し替える操作は範囲の外。3夜以上同じ顔ぶれなので、人が DB で差し替えるか外すかを決める必要がある
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
- サイトマップの2回取得: curl が許可されていない。auto-settings.json の許可に足すかは人の判断
- Next.js のセキュリティ更新: ビルド時に勧告が出ている。依存の更新は人の判断
