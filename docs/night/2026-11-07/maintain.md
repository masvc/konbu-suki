# 点検枠（2026-11-07 夜 / 実行は 11-08 未明）

inbox.md の未処理は無かった。この枠の役割（内部リンク・全体チェック・楽天の再照合）を順に行った。

## 1. 内部リンク

**孤立記事: 0本**（26本すべて、どれかの記事の related に入っている）。
`site-check.ts --offline` に related の警告は出ていない。guides.ts の related を数えて確かめた。

見直す前は、被リンクが1本だけの記事が3本あった。

| 記事 | 見直し前の被リンク | 足したリンク元 | 見直し後 |
| --- | --- | --- | --- |
| kombu-processed-foods（加工品一覧） | tororo-oboro | shiokombu-guide（加工品の柱）、gagome-kombu | 3 |
| kombu-production（生産と産地・産地の柱） | kombu-history | kombu-types（種類の柱）、ma-kombu | 3 |
| kombu-history（歴史と昆布ロード） | kombu-production | kombumaki | 2 |

柱と個別記事の抜けも埋めた。
- 柱7 加工品: shiokombu-guide → kombu-processed-foods が無かった。足した
- 柱1 種類・産地: kombu-production → rausu-kombu / ma-kombu を足した。kombu-types → kombu-production を足した
- 柱9 昆布締めは、柱が個別記事7本をすべて並べ、個別記事7本が柱を含んでいた。変更なし
- 柱2 だし、柱10 季節も相互につながっていた。変更なし

本文にも、足したリンク先の記事タイトルを書いた（kombu-types・shiokombu-guide・ma-kombu・gagome-kombu・
kombumaki・kombu-production の6本）。新しい事実は書いていない。どれも記事の中ですでに出典を示している内容
（ぎょれんの用途の表など）に、記事への案内を添えただけ。

コミット: 9db312f

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（オンライン） | ERROR 0 / WARN 4 | 直していない（下に理由） |
| check-links.ts（全件） | sitemap 364 / 内部 471 / 外部 1080。切れは外部1件 | 直していない（下に理由） |
| check-article-links.ts --all | 記事26本・出典49件、切れ0・移転0 | なし |
| meta-check.ts | 42ページ、要修正0・改善推奨0 | なし |
| fact-audit.ts | 改善推奨1件（kobujime-tips の「下の表」） | **直した**（2c17ddb）。節の名前で指すようにした |
| verify-affiliate-links.ts | 問題0（楽天直リンク138 / 検索177） | なし |
| images:optimize | 200KB超 0件 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY が未設定で、共有枠の1日の上限に当たった（0/3） | 記録のみ（lighthouse.md） |
| 構造化データ | page.tsx が全記事に Article、faq のある記事に FAQPage を出す。FAQ付きは26/26 | 欠けなし |

### 直さなかった指摘と理由

- **site-check の WARN 4件**（画像なし1・購入リンクなし1・重複商品1「ヤマサ 昆布つゆ 1800ml」）—
  どれも商品データの直しで DB への書き込みが要る。この枠で許可されている書き込みは楽天の rakutenUrl / rakutenId
  だけなので触らない。前の夜と同じ指摘
- **外部リンク切れ https://www.matumaeya.jp/（404）** — DB の生産者 id=7（松前屋）の url。直すには DB 書き込みが要る。
  todo.md に「要判断」として載っている。人の判断待ち
- 確かめられなかった外部リンク2件（ogurayayamamoto.co.jp 1、maff.go.jp 1）は、切れとは判定されていない。そのまま

## 3. 楽天マッチの再照合

- 下見: `match-rakuten.ts`（書き込みなし）。対象177件 / 一致48 / 保留129
  - 根拠: scripts/tmp/rakuten-match-2026-11-08.json
  - 検索失敗6件: 商品名が長く、楽天APIが「keyword must be under 128 length」で 400 を返した。スクリプト側で検索語を切り詰めれば拾える
- 振り分け: `triage-rakuten.ts`。自動適用の対象2 / レビュー待ち46 / 未一致129
  - レビュー待ちの内訳: スコア0.85未満 28 / 相手だけ複数個入り 12 / 価格が離れている 6
- **適用: 0件。** 自動適用の対象2件は、目で見て同じ商品とは言えなかったので外した
  - #14「おしゃぶり昆布 梅 12g」（中野物産）← 楽天は別の店（konbu-onomichi）の「高級おしゃぶり昆布梅 **120g** 徳用」。
    内容量が10倍で作り手も違う。価格が近いのはたまたま
  - #310「しあわせ昆布 プレーン 65g（**3袋セット**）」← 楽天は「（**1袋**）」の商品。数量の違う別の商品で、
    リンク先の価格と表示が食い違う
  - 外すことは許可の範囲を狭めるだけで、広げてはいない。`match-rakuten.ts --apply` は実行していない
- **レビュー待ちに残った件数: 48件**（triage のレビュー待ち46 + 今回外した2）。一覧は scripts/tmp/review-rakuten.csv

### triage の基準について（人が判断すること）

基準はこの枠で作り直さない決まりなので、気づいた点だけ書く。
- 内容量の数字（12g と 120g）が違うものを見分けていない
- 「相手だけ複数個入り」は見ているが、逆向き（こちらがセットで相手が1個）は見ていない
- 2件とも「価格が近い +0.08」でしきい値を越えている。量が違うのに価格が近いのは、むしろ別商品の手がかりになる

## 4. 前の枠の出力

analysis.md・improve-log.md・held.md・status-create.json はあった。前の枠の出力が欠けていたものは無い。
