# 点検と内部リンク（4枠目）

実行: 2026-11-07 未明。`docs/inbox.md` の未処理は無し。

## 内部リンク

- 孤立記事（どの記事の related にも入っていない記事）: **0本**
  - `site-check.ts --offline` の孤立記事警告は無し。`src/lib/guides.ts` の related を手で数えても同じ結果
- 被リンクが1本だけだった2記事を補強した（14f4173）
  - `kombu-katsuo-dashi`（how-to-make-dashi からのみ）→ `kombu-water` の related に追加。
    昆布水の本文「だしとの違いと使い分け」に「昆布だしの取り方」「昆布だしと鰹だしの違い」の記事名を入れた
  - `kobujime-chicken`（kobujime からのみ）→ `kobujime-tips` の related に追加。
    本文は元から「鶏むね肉の昆布締めの記事」に触れていた
- 被リンク2本の記事（kobujime-vegetables / kombu-nutrition / shiokombu-guide / kombu-history）はそのまま。
  related は1記事3〜4本の方針で、これ以上足すと関係の薄い記事を入れることになるため

## 全体チェック

| 点検 | 結果 | 対応 |
|---|---|---|
| site-check（全項目） | ERROR 0 / WARN 4 | 直さなかった（下記） |
| check-links（全件） | sitemap 361 / 内部 468 / 外部 1068。切れは外部1件 | 直さなかった（下記） |
| check-article-links --all | 記事23 / URL39 / 切れ0 / 移転0 | なし |
| meta-check | 39ページ 要修正0 / 改善推奨0 | なし |
| fact-audit | 食い違い0 | なし |
| verify-affiliate-links | 問題0（楽天 直138 / 検索177、Amazon 直314 / 検索1） | なし |
| images:optimize | 23件中 200KB超 0 | なし |
| lighthouse | **測れなかった**。PAGESPEED_API_KEY 未設定で共有枠の日次上限 | 記録のみ |
| 構造化データ | `guide/[slug]/page.tsx` が全ガイドに Article と FAQPage を出す。FAQ付き 23/23 | なし |

### 直さなかった指摘と理由

- **site-check の WARN 4件**（画像なし1・購入リンクなし1・重複商品「ヤマサ 昆布つゆ 1800ml」2件）。
  いずれも商品データの修正で DB 書き込みになる。今夜許可されているのは楽天マッチだけなので触らない
- **外部リンク切れ `https://www.matumaeya.jp/`（404）**。DB の生産者 id=7 の url。
  next-actions の「人の判断が要る」に既に載っている（DB 書き込み）
- 確かめられなかった外部リンク28件（Amazon 26 / ogurayayamamoto 1 / maff 1）はボット対策による応答で、切れではない扱い
- `npm run links`（直近コミットの出典確認）は許可の都合で実行できなかったが、同じ確認を
  `check-article-links --all` で全記事に対して済ませている。今回の変更は外部リンクを足していない

## 楽天マッチ

- 下見: `match-rakuten.ts`（書き込みなし）。対象177件（楽天直リンクの無い商品）→ 一致48 / 保留129。
  判定の根拠は `scripts/tmp/rakuten-match-2026-11-07.json`
- 振り分け: `triage-rakuten.ts` → 自動適用の候補1 / レビュー待ち47 / 未一致129
  （レビュー待ちの内訳: スコア0.85未満 28 / 相手だけ複数個入り 13 / 価格が離れている 6）
- **適用: 0件。** 候補1件を目で確かめたところ、別の商品だった
  - #14「おしゃぶり昆布 梅 12g」（中野物産）← 楽天「高級おしゃぶり昆布梅 120g 徳用」（konbu-onomichi、score 0.98）
  - 内容量が12gと120gで10倍違い、楽天側の商品名に中野物産の名前が無い。名称の類似と価格だけで高得点になっていた
  - 書き込みを減らす方向なので許可の範囲内。`--apply` は実行していない
- **レビュー待ちに残った件数: 48件**（triage のレビュー待ち47 + 上の1件）。一覧は `scripts/tmp/review-rakuten.csv`
- 気づいたこと（判断は人に任せる）: triage の除外条件は「相手だけ複数個入り」を見ているが、
  内容量（g）の違いは見ていない。今回のように1袋どうしでも量が違うと通ってしまう。
  基準の変更は夜間ではしない（指示どおり）。次に人が triage-rakuten.ts を触るときの候補
