# 4枠目: サイト全体の点検と内部リンク（2026-11-05 夜 / 実行 2026-11-06）

前の枠（分析・既存記事の改善・新規記事）はいずれも exit 0 で、出力あり。

## 1. 内部リンク

### 孤立記事: ゼロ

直す前から、20本すべてが少なくとも1本の記事の related に入っていた（guides.ts を読んで数えた）。
ただし被リンク1本だけの記事が4本あった（kobujime-salmon / kobujime-chicken / kombu-nutrition / kombu-history）。
また、昆布締めの柱（kobujime）が配下の鯛・サーモン・失敗とコツに関連記事でつながっていなかった。

### 直したこと

| 記事 | related の変更 | 本文で触れた記事 |
| --- | --- | --- |
| kobujime（柱） | 配下6本すべて（tips / hirame / tai / salmon / chicken / vegetables） | 結論の節で6本のタイトルに触れた |
| kobujime-tai | 柱 kobujime を追加 | 既に本文で柱に触れていた |
| kobujime-tips | kobujime-salmon を追加 | アニサキスの節でサーモンの記事に触れた |
| kombu-types（柱） | gagome-kombu を追加 | 4種の違い・生産と流通の記事に触れた |
| kombu-comparison | kombu-history を追加（柱 kombu-types を先頭に） | だしの取り方・選び方・歴史の記事に触れた |
| how-to-make-dashi（柱） | kombu-nutrition を追加 | 既に本文で栄養成分の記事に触れていた |

- 昆布水の記事が「昆布の基本レシピの記事」という実在しない記事名を案内していたので、
  「昆布を使ったレシピ集の記事」に直した
- 方針を guides.ts の型コメントに書いた（柱は配下をすべて並べる、個別記事は柱を含める）
- site-check.ts に「孤立記事」の warn を足した。直したあとの `--offline` で related 関連の warn は 0
- 直したあとの被リンク数の最小は2本（ゼロ・1本の記事なし）

本文の追記は案内文だけで、新しい事実は書いていない。

## 2. 全体チェック

| チェック | 結果 |
| --- | --- |
| site-check（ライブ） | ERROR 0 / WARN 4（すべて商品データ。下記） |
| check-links | sitemap 0 / 内部 0 / 外部 1 切れ（下記） |
| meta-check | 36ページ 要修正 0 / 改善推奨 0 |
| verify-affiliate-links | 問題 0（楽天直リンク 137→138） |
| images:optimize | 200KB 超え 0 件。`--write` 不要 |
| 構造化データ | page.tsx が全記事で Article、faq があれば FAQPage を出す。新規3本（salmon / tai / tips）は faq あり |

### 直さなかった指摘と理由

- **画像なし1 / 購入リンクなし1 / 重複商品1（ヤマサ 昆布つゆ 1800ml）**: 直すには DB の書き込みが要る。
  今夜許可されている書き込みは楽天の rakutenUrl / rakutenId だけなので触っていない。todo.md に既載
- **外部リンク切れ `https://www.matumaeya.jp/`（404）**: todo.md で「ボット対策による誤検知」と判断済みのもの。
  リンク元は DB の生産者データ（コードでは prisma/seed.ts のみ）。DB 書き込みが要るうえ、
  ブラウザで開けるかを夜間には確かめられないため保留。人が開いて確かめる
- **確かめられなかった3件**（ogurayayamamoto / maff / amazon）: ボット対策・タイムアウトの分類。切れではない
- **FAQ なしのガイド1本（kombu-production）**: 出典が URL なしの書名だけで、本文の「約95%が北海道産」は
  kombu-types の「約90%」（北海道ぎょれん、URL 確認済み）と食い違っている。FAQ を足すと未確認の数値を
  広げることになるため、記事の書き直し（改善枠）に回す。次の改善枠の候補

## 3. 楽天マッチの再照合

- 下見: `match-rakuten.ts`（書き込みなし）→ `scripts/tmp/rakuten-match-2026-11-06.json`。対象178件（rakutenUrl 未設定）、一致49 / 保留129
- 振り分け: `triage-rakuten.ts` → 自動適用1 / レビュー待ち48 / 未一致129
  - レビュー待ちの内訳: スコア 0.85 未満 29 / 相手だけ複数個入り 13 / 価格が離れている 6
- 目視: 適用分は #246「前島食品 梅こぶ茶 300g」→ 楽天「前島食品 梅こぶ茶 300g」（score 1.00、名称完全一致、価格が近い）。誤りなし
- 適用: `match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write` → **1件を更新**
- **レビュー待ちに残った件数: 48件**（`scripts/tmp/review-rakuten.csv`）
- 適用後に verify-affiliate-links を再実行し、成果計測の欠けは 0
