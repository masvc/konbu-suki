# 点検枠（2026-11-11 夜 / 実行は 11-12 未明）

inbox.md の未処理は無かった。next-actions の「高」はすべて済み（「中」の残りは七草がゆの資料探しで、この枠の役割外）。
この枠の役割（内部リンク・全体チェック・インデックス促進・楽天の再照合）を順に行った。

## 1. 内部リンク

**孤立記事: 0本**（35本すべて、どれかの記事の related に入っている）。
`site-check.ts --offline` に related の警告（孤立・存在しない slug・自己参照）は出ていない。guides.ts の related を記事ごとに数えて確かめた。

見直し前に被リンクが2本だった記事（yudofu-kombu・kobujime-chicken・kobujime-vegetables・kombu-history）と、
柱からつながっていなかった記事に、柱と近い記事から足した。

| 足したリンク元 | 足した related | 本文で触れた箇所 |
| --- | --- | --- |
| how-to-make-dashi（だしの柱） | yudofu-kombu・toshikoshi-soba-dashi | 「水出し（昆布水）の手順」に湯豆腐・年越しそばの記事への1文 |
| kombu-recipes（レシピの柱） | yudofu-kombu | 「昆布が主役の料理」に湯豆腐の記事への1文（協会レシピがある事実のみ） |
| kobujime-arrange | kobujime-chicken・kobujime-vegetables | 結論の節に「鶏むね肉・野菜を締める作り方」の1文 |
| kombu-types（種類の柱） | kombu-history | 「だし用の4種をどう選ぶか」に歴史と昆布ロードの記事への1文 |
| kombu-oyatsu-guide（おやつの柱） | kombu-processed-foods・kombu-nutrition | 本文はもともと両記事に触れているので変えていない |
| how-to-choose-kombu | kombu-storage | 本文はもともと保存方法の記事に触れているので変えていない |

見直し後の被リンク: yudofu-kombu 2→4、toshikoshi-soba-dashi 3→4、kobujime-chicken 2→3、kobujime-vegetables 2→3、
kombu-history 2→3、kombu-nutrition 3→4、kombu-storage 3→4、kombu-processed-foods 4→5。

- 11-10 に強化して「数日触らない」とした記事（kombumaki・kobujime-vegetables・昆布締めの Recipe 付き記事など）は、
  リンク先にはしたが本文・related は触っていない。リンク元は対象外の記事から選んだ
- 足した文は記事の案内だけで、新しい事実の主張は無い。dateModified は変えていない（本文の中身は変わっていないため）

コミット: b291f98

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（オンライン） | ERROR 0 / WARN 4。ページ58件OK、画像サンプル50件OK | 直していない（下に理由） |
| check-links.ts（全件） | sitemap 373 / 内部 480 / 外部 1106。切れは外部7件、確かめられなかった3件 | 直していない（下に理由） |
| check-article-links.ts --all | 記事35本・出典60件、切れ0・移転0 | なし |
| meta-check.ts | 51ページ、要修正0・改善推奨0 | なし |
| fact-audit.ts | 35記事、食い違いなし | なし |
| verify-affiliate-links.ts | 問題0（Amazon 直314 / 検索1、楽天 直140 / 検索175。適用前の値） | なし |
| images:optimize | ガイド画像35件、200KB超 0件 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY が未設定で、共有枠の1日の上限に当たった（0/3） | 記録のみ（lighthouse.md） |
| 構造化データ | page.tsx が全記事に Article、faq のある記事に FAQPage、recipe のある記事に Recipe を出す。FAQ付き35/35。新しい yudofu-kombu・toshikoshi-soba-dashi も欠けなし | なし |

### 直さなかった指摘と理由

- **site-check の WARN 4件**（画像なし1・購入リンクなし1・重複商品1「ヤマサ 昆布つゆ 1800ml」）— 商品データの直しで DB 書き込みが要る。
  この枠で許可されている書き込みは楽天の rakutenUrl / rakutenId（triage 経由）だけ。前夜から継続
- **外部リンク切れ https://www.matumaeya.jp/（404）** — DB の生産者 id=7（松前屋）の url。DB 書き込みが要るので人の判断待ち（11-06 から継続）
- **外部リンク切れ: もしもアフィリエイト経由の楽天商品リンク6件（404）** — 前夜からの4件
  （donzstore b0gfm1s4kl・b0fr7q9hjb、elimino 9a00qoe23fq・2c01ibkqktu）に、**今夜新たに2件**
  （denitselect 4903850066294、net-o a-246-b0czrgg268-238-10）。楽天側で商品ページが消えている。
  rakutenUrl を外す・付け替える書き込みは許可の外（許可は triage が振り分けた分を付けることだけ）。人の判断待ち
- 確かめられなかった外部リンク3件（amazon.co.jp 2、ogurayayamamoto.co.jp 1）は切れとは判定されていない。記事の出典ではない

## 3. インデックス促進

- **サイトマップの lastmod:** curl は許可されていなかったので、WebFetch で `?check=1` と `?check=2` の2回取った（キャッシュを避けるため）。
  ルート・/guide・yudofu-kombu は 2026-11-12、how-to-make-dashi は 2026-11-11（dateModified どおり）、
  /category/snack は 2026-11-09T20:13:22.131Z、/product/315 は 2026-10-25T16:27:14.450Z。**2回で同じ値**だった。
  取得のたびに変わる値は無い。src/app/sitemap.ts も dateModified・商品の updatedAt から出している
- **IndexNow:** 孤立記事0を確かめてから `indexnow.ts --all` を実行。**373件を通知し、HTTP 200 で受理**された

## 4. 楽天マッチの再照合

- 下見: `match-rakuten.ts`（書き込みなし）。対象175件 / 一致48 / 保留127
  - 根拠: scripts/tmp/rakuten-match-2026-11-12.json
- 振り分け: `triage-rakuten.ts`。自動適用の対象2 / レビュー待ち46 / 未一致127
  - レビュー待ちの内訳: スコア0.85未満 27 / 相手だけ複数個入り 12 / 価格が離れている 7
- **目で確かめて1件を外した:** #14 中野物産「おしゃぶり昆布 梅 12g」（score 0.98）の相手は konbu-onomichi の
  「高級おしゃぶり昆布梅 120g 徳用」で、**メーカーが違い、内容量も12gと120gで10倍違う**。別の商品と判断した。
  外すのは許可の範囲を狭める側なので、triage の基準を作り直したことにはならない。
  triage の元の出力は scripts/tmp/rakuten-apply-triage-2026-11-12.json に残した
- **適用: 1件。** #125 源蔵屋「天然 北海道産 刻み昆布～なっとう～ 200g」→ konbu-genzouya「[大袋] 刻み昆布〜なっとう〜 200g … 源蔵屋」
  （店・品名・内容量が一致）。`match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write` で rakutenUrl / rakutenId のみ更新（1件を更新）
- **レビュー待ちに残った件数: 47件**（triage のレビュー待ち46 ＋ 外した #14）。一覧は scripts/tmp/review-rakuten.csv（#14 は CSV に入っていない）
- triage のしきい値は「名称一致0.90＋価格が近い」で内容量の違いを見ていない。12g と 120g のような量違いが 0.98 になる。
  スクリプトの基準を変えるのは人の判断に回す（次の分析枠・人向けの申し送り）

## 5. 前の枠の出力

2026-11-11 のディレクトリには improve-log.md・index-status・status-create/improve.json があった。
**analysis.md・ai-citation・status-analysis.json は無かった**（分析枠の出力が無い）。held.md も無かった。
新規枠は yudofu-kombu を公開済み（1870bbe）。分析枠が無かったので、next-actions.md は 11-10 夜のままのものに沿って進めた。
