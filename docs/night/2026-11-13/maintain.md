# 点検枠（2026-11-13 夜 / 実行は 11-14 未明）

inbox.md の未処理は無かった。この枠の役割（内部リンク・全体チェック・インデックス促進・楽天の再照合）を順に行った。

## 1. 内部リンク

**孤立記事: 0本**（37本すべて、どれかの記事の related に入っている）。
`site-check.ts --offline` に related の警告は出ていない。guides.ts の related 行を grep で数えて確かめた（存在しない slug も無し）。

見直し前の被リンクの最少は kombu-life-cycle の2本（ma-kombu・kombu-production から）。ほかは全記事3本以上。

| 足したリンク元 | 足した related | 本文で触れた箇所 |
| --- | --- | --- |
| kombu-history（11-05 から未変更、related 3本と少なかった） | kombu-life-cycle・kombu-types・kombumaki | 結論の節に「昆布が海でどう育ちいつ採られるかは昆布の育ち方の記事に、道内のどこで採れるかは昆布の産地の記事に、種類ごとの用途は昆布の種類と選び方の記事に」の1文。縁起物の節に「北海道と富山の昆布巻きの作り方と違いは、おせちの昆布巻きの作り方の記事に」の1文 |
| kombu-types（柱） | kombu-life-cycle | related のみ（下記の理由で本文は触っていない） |
| kombumaki | toshikoshi-soba-dashi（年末年始の季節クラスタを相互に） | related のみ（同上） |

見直し後の被リンク: kombu-life-cycle 2→4、kombumaki 4→5、kombu-types 10→11、toshikoshi-soba-dashi 4→5。全記事3本以上。

- 最初は kombu-types と kombumaki の本文にも案内の1文を入れて push した（b98089e）が、next-actions に
  「11-10〜11-13 に強化した記事（kombumaki 等）は、クロールされるまで本文を触らない」とあったため、
  両記事の本文の追記は戻した（7236ab0）。related は本文の外のナビなので残した。
  本文での案内は、この決まりに当たらない kombu-history に置いた
- 足した文は記事の案内だけで、新しい事実の主張は無い
- 本文が変わったので kombu-history の dateModified を 2026-11-14 にした

コミット: b98089e / 7236ab0

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（オンライン） | ERROR 0 / WARN 4。ページ60件OK、画像サンプル50件OK、FAQ付き 37/37 | 直していない（下に理由） |
| check-links.ts（全件） | sitemap 375 / 内部 482 / 外部 1112。切れは外部6件、確かめられなかった1件 | 直していない（下に理由） |
| check-article-links.ts --all | 記事37本・出典64件、切れ0・移転0 | なし |
| meta-check.ts | 53ページ、要修正0・改善推奨0 | なし |
| fact-audit.ts | 37記事、食い違いなし | なし |
| verify-affiliate-links.ts | 問題0（Amazon 直314 / 検索1、楽天 直142 / 検索173。適用前の値） | なし |
| images:optimize | ガイド画像37件、200KB超 0件 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY が未設定で、共有枠の1日の上限に当たった（0/3） | 記録のみ（lighthouse.md） |
| 構造化データ | page.tsx が Article、faq のある記事に FAQPage、recipe のある記事に Recipe を出す。FAQ付き 37/37 で、新しい記事にも欠けなし（コード上の確認） | なし |

### 直さなかった指摘と理由

- **site-check の WARN 4件**（画像なし1・購入リンクなし1・重複商品1「ヤマサ 昆布つゆ 1800ml」）— 商品データの直しで DB 書き込みが要る。
  この枠で許可されている書き込みは楽天の rakutenUrl / rakutenId（triage 経由）だけ。前夜から継続
- **外部リンク切れ https://www.matumaeya.jp/（404）** — DB の生産者 id=7（松前屋）の url。人の判断待ち（11-06 から継続）
- **外部リンク切れ: もしも経由の楽天商品リンク5件（404）** — donzstore b0gfm1s4kl・b0fr7q9hjb、elimino 9a00qoe23fq・2c01ibkqktu、
  net-o a-246-b0czrgg268-238-10。前夜の6件から denitselect 4903850066294 が消えた（前夜の適用で付け替わったと見られる）。
  rakutenUrl を外す・付け替える書き込みは許可の外。人の判断待ち
- 確かめられなかった外部リンク1件（ogurayayamamoto.co.jp）は切れと判定されていない。記事の出典ではない

## 3. インデックス促進

- **サイトマップの lastmod:** `curl` は許可されておらず、本番の sitemap.xml を2回取って比べることはできなかった。
  代わりに src/app/sitemap.ts を確かめた。lastmod は記事の dateModified と商品の updatedAt（カテゴリ等はその最大値）から作っており、
  `new Date()` を入れている箇所は無い（取得のたびに変わる作りではない）。前夜は WebFetch で2回取り、同じ値だったことを確かめている
- **IndexNow:** 孤立記事0を確かめてから `indexnow.ts --all` を実行。**375件を通知し、HTTP 200 で受理**された

## 4. 楽天マッチの再照合

- 下見: `match-rakuten.ts`（書き込みなし）。対象173件 / 一致48 / 保留125
  - 根拠: scripts/tmp/rakuten-match-2026-11-14.json
- 振り分け: `triage-rakuten.ts`。自動適用の対象1 / レビュー待ち47 / 未一致125
  - レビュー待ちの内訳: スコア0.85未満 28 / 相手だけ複数個入り 12 / 価格が離れている 7
- 目で確かめた: #144「食いしん坊侍 化学調味料を使わない北海道塩吹き昆布 ×徳用大袋270g」→ denitselect の同名商品
  （score 1.00。品名・内容量270gが一致、価格が近い、候補1件）。外すものは無かった
- **適用: 1件。** `match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write` で rakutenUrl / rakutenId のみ更新（1件を更新）
- **レビュー待ちに残った件数: 47件**。一覧は scripts/tmp/review-rakuten.csv（前夜と同じ件数・内訳）

## 5. 前の枠の出力

2026-11-13 のディレクトリには analysis.md・ai-citation・index-status・improve-log.md・status-analysis/create/improve.json があった。held.md は無かった。
