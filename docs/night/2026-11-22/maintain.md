# 点検枠（2026-11-22 夜の4枠目、実行は 11-23 未明）

inbox の未処理は無し。前の枠の出力は docs/night/2026-11-22/ にあった（analysis.md・improve-log.md・held.md・status-*.json）。

## 1. 内部リンク

- 41記事の related を guides.ts から数えた（被リンク = 他記事の related に入っている数）。
  一時スクリプトの実行は許可が無かったので、`grep` で related 行を全部出して手で数えた
- **孤立記事 0。** 開始時点で全記事が被リンク3本以上。`site-check.ts --offline` に related の警告は無い。存在しない slug は無い
- 本文で「〇〇の記事にまとめています」と名前を出しているのに related に入っていない組を全記事で洗い出し、15記事で揃えた（コミット「本文で触れている関連記事を related に揃え…」）:
  - kombu-recipes（柱）: how-to-make-dashi・kombu-water（本文の「昆布水とだしの使い道」で触れている。レシピ集から だしの柱へのリンクが無かった）
  - kobujime（柱）: kombu-history・kombu-recipes
  - kombu-history: kombu-recipes・ma-kombu。本文の「縁起物」の節に、レシピ集と真昆布の記事を案内する1文を足した（新しい事実は足していない）
  - toshikoshi-soba-dashi: how-to-choose-kombu・kombu-nutrition / nanakusa-gayu-dashi: kombu-nutrition
  - ma-kombu: kombu-comparison・kombu-nutrition / kombu-katsuo-dashi: kombu-storage・kombu-nutrition
  - kobujime-tai: kombu-comparison / kobujime-chicken: kombu-water・kombu-nutrition
  - tororo-oboro: how-to-choose-kombu / kombu-comparison: kombu-processed-foods・gagome-kombu・tororo-oboro・kombu-nutrition
  - kombu-types: kombu-processed-foods / kombu-production: how-to-choose-kombu
  - oshaburi-kombu: kombu-nutrition / otsumami-kombu: gagome-kombu・kombu-nutrition
- **分析枠が「触らない」とした記事（kombu-storage・kombu-water・shiokombu・kombumaki・kobujime-hare・kobujime-hirame・rausu・kobujime-tips・kobujime-beef・seaweed-types・life-cycle・iwashi-katsuo・miyako・yudofu）は related も変えていない。**
  yudofu-kombu も本文で栄養成分の記事に触れているが related に無い。クロール待ちが明けたら揃える候補
- 本文の変更は kombu-history の1文だけで、記事の中身は変わらないので dateModified は動かしていない

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（ライブ） | ERROR 0 / WARN 4。ページ64件 OK・画像サンプル50件 OK・FAQ 41/41・ガイド画像 41/41 | WARN は画像なし1・購入リンクなし1・重複商品1（ヤマサ 昆布つゆ 1800ml）。商品 DB の書き込みで夜間の許可の外。直していない |
| check-links.ts（全件） | sitemap 0 / 内部 0 / **外部 9 切れ**（検査 380/487/1132） | 前夜の8件に **Amazon `B0GF2J9CSY` の商品ページ 404** が増えた（同じ商品の楽天 goodfindstore/b0gf2j9csy は前夜から切れ）。楽天7件（donzstore 2・elimino 2・eksshop0001 2・goodfindstore 1）と matumaeya.jp は前夜と同じ。どれも DB の URL で、直すには DB 書き込みが要る。直していない。確かめられなかった1件（ogurayayamamoto） |
| check-article-links.ts --all | 41記事 / 77件 / 切れ0・移転0 | なし |
| meta-check.ts | 57ページ / 要修正0・改善推奨0（related を直したあとにも再実行して同じ） | なし |
| fact-audit.ts | 41記事 / 食い違い0 | なし |
| verify-affiliate-links.ts | 問題0（Amazon直314・検索1 / 楽天直146・検索169） | なし |
| images:optimize | 41件 / 200KB超0 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY 未設定で共有枠の上限（Queries per day）に当たった | lighthouse.md に記録 |

`npm run build` は1回目に Next.js のセキュリティ更新の勧告で止まり、再実行で成功した。前夜と同じ。依存の更新は人の判断なので実行していない。

## 3. インデックス促進

- **サイトマップの lastmod:** `curl` は今夜も許可されなかった（`curl -s https://konbu-suki.com/sitemap.xml` 単体でも承認待ちで拒否）。本番を2回取って比べることはできていない。
  `src/app/sitemap.ts` を読み直し、lastModified は記事の dateModified と DB の updatedAt（商品・一覧はその最大値）からだけ作り、分からないページには入れない作りであることを確かめた。`new Date()` の現在時刻は使っていないので、取得のたびに値が変わることは無いと判断した（前夜の WebFetch での確認とも一致）
- **構造化データ:** `src/app/guide/[slug]/page.tsx` は全記事に Article、faq がある記事に FAQPage（41/41）、recipe がある記事（14本）に Recipe を出す。今夜の新規記事は無いので欠けは無い
- **IndexNow:** 孤立記事0を確かめたあと `indexnow.ts --all` で **380 URL** を通知。HTTP 200

## 4. 楽天マッチの再照合

- 下見: 169件中 一致47 / 保留122（scripts/tmp/rakuten-match-2026-11-23.json）
- triage: 自動対象3 / レビュー待ち44 / 未一致122（保留の内訳: 0.85未満27・相手だけ複数個入り10・価格差7）
- 目視で確認した自動対象3件:
  - #14 おしゃぶり昆布 梅 12g ← 楽天「高級おしゃぶり昆布梅 120g 徳用」（0.98）。量が10倍違う別商品。**外した**（前夜までと同じ）
  - #15 前島食品 北海道産 おやつ昆布 100g ← 楽天 zozo「揚げ昆布 100g 北海道産 おつまみ昆布 おやつ昆布 業務用」（1.00）。
    相手は揚げ昆布でブランドの記載も無く、別商品と判断。**外した**（今夜初めて自動対象に上がった）
  - #135 マツモト 塩こんぶ ニセコ 業務用 500g ← 楽天 ecmikiya「マツモト 塩こんぶ ニセコ 業務用 チャック袋 500g」（1.00、4,980円）。ブランド・品名・量が一致。**適用した**
- `match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write` で **1件を書き込んだ**（rakutenUrl / rakutenId のみ）
- **レビュー待ちに残った件数: 46**（triage のレビュー44 + 目視で外した #14・#15）
- #14 は毎晩、#15 は今夜、名称スコアだけで自動対象に上がった。triage に「重さ（g）の食い違い」「相手の品名に別種の加工（揚げ等）」の除外を足すかは人の判断（基準を自分で作り直さない決まりのため触っていない）

## 直さなかったもの（理由）

- 商品 DB の WARN 4件・楽天リンク切れ7件・Amazon B0GF2J9CSY・松前屋 URL: すべて DB 書き込みが要る。夜間に許可されているのは楽天マッチの適用（rakutenUrl/rakutenId を triage 経由で埋める）だけで、切れた URL を消す・差し替える操作は範囲の外。
  B0GF2J9CSY は Amazon・楽天の両方が切れたので、販売終了の可能性が高い。扱い（非公開にするか、別の商品に差し替えるか）は人の判断
- Core Web Vitals: API の上限で測れなかった。PAGESPEED_API_KEY を `.env` に入れれば毎晩測れる（キー名だけ。値は人が入れる）
- サイトマップの2回取得: curl が許可されていない。毎晩この確認が指示にあるので、`curl -s https://konbu-suki.com/sitemap.xml` を auto-settings.json の許可に足すかは人の判断
- Next.js のセキュリティ更新: ビルド時に勧告が出ている。依存の更新は人の判断
