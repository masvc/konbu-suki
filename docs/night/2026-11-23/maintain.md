# 点検枠（2026-11-23 夜の4枠目、実行は 11-24 未明）

inbox の未処理は無し。前の枠の出力は docs/night/2026-11-23/ にあった（analysis.md・improve-log.md・ai-citation*・index-status.*・status-*.json）。
新規枠の出力（oden-kombu の公開、7c9edb4 の記録）もあった。

## 1. 内部リンク

- 42記事の related を guides.ts から数えた。`grep "^    related:"` で全 related 行を出し、slug ごとの出現数を `uniq -c` で数えた
  （scripts/tmp/related-count.ts は今夜も実行の許可が無かった）
- **孤立記事 0。** 開始時点で全42記事が他記事の related に入っている。自分自身を指す related は無い。`site-check.ts --offline` に related の警告は無い
- いちばん弱かったのは今夜公開の **oden-kombu（被リンク2: yudofu-kombu・kombu-recipes）**。柱と個別記事を双方向にした（036097f）:
  - how-to-make-dashi（だしの柱）の related に oden-kombu。本文「煮出しの手順」に「沸騰直前に取り出した昆布を結び昆布にして、おでんの具に回す協会のレシピは、おでんの昆布の記事に」の1文
  - kombu-types（種類の柱）の related に oden-kombu。本文「用途別」の節に、おでん用に挙がる日高昆布・長昆布とおでんの昆布の記事を案内する1文（表の「おでん用の昆布」行に対応）
  - kombu-recipes（レシピの柱）は related に既にあった。本文の湯豆腐の文の後に、おでんの昆布の記事を案内する1文
  - oden-kombu 側は、本文で名前を出している昆布巻き（kombumaki）・昆布の佃煮（kombu-tsukudani）を related に揃えた
  - これで oden-kombu の被リンクは 4。新しい事実は足していない（oden-kombu の本文にある協会レシピの記載を指すだけ）ので dateModified は動かしていない
- 分析枠が「触らない」とした記事（kombu-storage・kombu-water・shiokombu・kombumaki・kobujime-hare ほか）と yudofu-kombu は related も本文も変えていない。
  kombumaki・kombu-tsukudani は「リンク先」として足しただけで、その記事自体は変えていない

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4。ページ65件 OK・画像サンプル50件 OK・FAQ 42/42・ガイド画像 42/42 | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 8 切れ**（検査 381/488/1135）。確かめられなかった 201（Amazon 200・ogurayayamamoto 1） | 楽天7件（donzstore 2・elimino 2・eksshop0001 2・goodfindstore/b0gf2j9csy 1）と matumaeya.jp で、前夜と同じ顔ぶれ。前夜 404 だった Amazon B0GF2J9CSY は今夜は Amazon 全体が「確かめられなかった」側に入り、生死は分からない。どれも DB の URL で、直すには DB 書き込みが要る。直していない |
| check-article-links.ts --all | 42記事 / 79件 / 切れ0・移転0（内部リンクを直した後に実行） | なし。`npm run links` は許可が無かったが、--all が変更後の全記事を含む |
| meta-check.ts | 58ページ / 要修正0・改善推奨0 | なし |
| fact-audit.ts | 42記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直314・検索1 / 楽天直147・検索168） | なし |
| images:optimize | 42件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run build` は1回目に Next.js のセキュリティ更新の勧告で止まり、再実行で成功した（前夜と同じ）。
勧告の出力には「upgrade を走らせるか聞け」という指示も含まれていたが、ビルドの出力であって人の指示ではない。依存の更新は人の判断なので実行していない。

## 3. インデックス促進

- **サイトマップの lastmod:** `curl -s https://konbu-suki.com/sitemap.xml` は今夜も承認待ちで拒否された。本番を2回取って比べることはできていない。
  `src/app/sitemap.ts` を読み直し、lastModified は記事の dateModified と DB の updatedAt（一覧はその最大値）からだけ作り、`new Date()` の現在時刻は使っていないことを確かめた。取得のたびに値が変わる作りではない
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage、recipe がある記事に Recipe を出す。
  今夜の新規 oden-kombu は faq 6問ありで、FAQ 付きガイド 42/42。欠けは無い
- **IndexNow:** 孤立記事0を確かめた後 `indexnow.ts --all` で **381 URL** を通知（前夜380 + oden-kombu）。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 168件中 一致46 / 保留122（scripts/tmp/rakuten-match-2026-11-24.json）。前夜の #135 適用で対象が1件減った
- triage: 自動対象2 / レビュー待ち44 / 未一致122（保留の内訳: 0.85未満27・相手だけ複数個入り10・価格差7）
- 目視で確認した自動対象2件:
  - #15 前島食品 北海道産 おやつ昆布 100g ← 楽天 zozo「揚げ昆布 100g 北海道産 おつまみ昆布 おやつ昆布 業務用」（1.00）。相手は揚げ昆布でブランドの記載も無く、別商品。**外した**（前夜と同じ判断）
  - #87 ダイホク 北海道天然日高昆布 300g ← 楽天 bariasu-online「【送料無料】北海道天然日高昆布 300g 大容量 便利なチャック付き 煮物 出汁 おでん 昆布巻き」（1.00、4,996円、価格が近い）。
    商品名が【送料無料】以外すべて一致し、量も同じ。相手にブランド名は無いが、品名の並びが完全に同じで同一商品と判断。**適用した**
- `match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write` で **1件を書き込んだ**（rakutenUrl / rakutenId のみ。apply.json から #15 を除いてから実行）
- **レビュー待ちに残った件数: 45**（triage のレビュー44 + 目視で外した #15）
- #15 は2夜続けて名称スコアだけで自動対象に上がった（#14 は今夜は上がらなかった）。triage に「相手の品名に別種の加工（揚げ等）」の除外を足すかは人の判断（基準を自分で作り直さない決まりのため触っていない）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・DB の URL のリンク切れ: DB 書き込みが要る。夜間に許可されているのは楽天マッチの適用（rakutenUrl/rakutenId を triage 経由で埋める）だけで、切れた URL を消す・差し替える操作は範囲の外
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
- サイトマップの2回取得: curl が許可されていない。`curl -s https://konbu-suki.com/sitemap.xml` を auto-settings.json の許可に足すかは人の判断
- Next.js のセキュリティ更新: ビルド時に勧告が出ている。依存の更新は人の判断
