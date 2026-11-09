# 点検枠（2026-11-09 夜 / 実行は 11-10 未明）

inbox.md の未処理は無かった（「（なし）」）。この枠の役割（内部リンク・全体チェック・インデックス促進・楽天の再照合）を順に行った。

## 1. 内部リンク

**孤立記事: 0本**（33本すべて、どれかの記事の related に入っている）。
`site-check.ts --offline` に related の警告は出ていない。guides.ts の related を1本ずつ数えて確かめた
（related に出てくる slug は重複を除いて33種＝全記事。存在しない slug を指す related も無い）。

今夜の新しい記事 kobujime-arrange（昆布締めの食べ方とアレンジ）は、kobujime・kobujime-tai・kobujime-salmon・
kobujime-tips・kobujime-chicken・kobujime-hirame の6本から入れる。

見直しで足したリンク:

| 記事 | 見直し前の被リンク | 足したリンク元 | 見直し後 |
| --- | --- | --- | --- |
| shiokombu-guide（塩昆布の使い方とレシピ） | 3（processed-foods・tororo-oboro・otsumami-kombu） | kombu-recipes（レシピの柱） | 4 |
| nanakusa-gayu-dashi（七草がゆのだし） | 2（kombumaki・kombu-katsuo-dashi） | kombu-recipes（レシピの柱） | 3 |

レシピの柱から、料理の使い方の表にした塩昆布の記事と、季節需要の七草がゆ（1月7日。1〜2か月前の今が公開・導線の時期）へ
入る道が無かった。kombu-recipes の本文（昆布が主役の料理の節）にも「塩昆布の使い方とレシピの記事」への案内を1文足した。
七草がゆは同じ節で既に本文から案内している。新しい事実は書いていない。dateModified は変えていない（案内の1文を足しただけ）。

コミット: 昆布レシピ集の関連記事に塩昆布の使い方と七草がゆのだしを足した

## 2. 全体チェック

| チェック | 結果 | 対応 |
| --- | --- | --- |
| site-check.ts（オンライン） | ERROR 0 / WARN 4。ページ56件OK、画像サンプル50件OK | 直していない（下に理由） |
| check-links.ts（全件） | sitemap 371 / 内部 478 / 外部 1103。切れは外部5件 | 直していない（下に理由） |
| check-article-links.ts --all | 記事33本・出典56件、切れ0・移転0 | なし |
| meta-check.ts | 49ページ、要修正0・改善推奨0 | なし |
| fact-audit.ts | 33記事、食い違いなし | なし |
| verify-affiliate-links.ts | 問題0（Amazon 直314 / 検索1、楽天 直138 / 検索177） | なし |
| images:optimize | ガイド画像28件、200KB超 0件 | なし |
| lighthouse.ts | **測れなかった。** PAGESPEED_API_KEY が未設定で、共有枠の1日の上限に当たった（0/3） | 記録のみ（lighthouse.md） |
| 構造化データ | page.tsx が全記事に Article、faq のある記事に FAQPage を出す。FAQ付きは33/33。新しい記事 kobujime-arrange も欠けなし | なし |

### 直さなかった指摘と理由

- **site-check の WARN 4件**（画像なし1・購入リンクなし1・重複商品1「ヤマサ 昆布つゆ 1800ml」）—
  商品データの直しで DB 書き込みが要る。この枠で許可されている書き込みは楽天の rakutenUrl / rakutenId（triage 経由）だけ。前夜と同じ
- **外部リンク切れ https://www.matumaeya.jp/（404）** — DB の生産者 id=7（松前屋）の url。DB 書き込みが要るので人の判断待ち（11-06 から継続）
- **外部リンク切れ: もしもアフィリエイト経由の楽天商品リンク4件（404）** — donzstore（b0gfm1s4kl・b0fr7q9hjb）、
  elimino（9a00qoe23fq・2c01ibkqktu）。楽天側で商品ページが消えている。DB の rakutenUrl を直す（検索リンクへ戻す・
  別の候補に付け替える）必要があるが、許可されている経路は「match-rakuten の --apply で triage が振り分けた分を付ける」
  だけで、切れたリンクを外す書き込みは許可の外。人の判断待ちとして記録する
- 確かめられなかった外部リンク2件（ogurayayamamoto.co.jp 1、maff.go.jp 1）は切れとは判定されていない。記事の出典は
  check-article-links で全件生きているので、記事の出典ではない
- ガイド画像 28件 / 記事33本 — おやつ5本が kombu-processed-foods の画像を流用している（next-actions に既出）。画像の用意は人の作業

## 3. インデックス促進

- **サイトマップの lastmod:** 2回取って同じ値だった（ルート・/guide・kobujime-arrange は 2026-11-10、kombu-recipes は 2026-11-09、
  /category/snack は 2026-11-04T18:16:52.518Z、/product/315 は 2026-10-25T16:27:14.450Z）。取得のたびに変わる値は無い
  - curl が許可されていなかったので、WebFetch で `?f=1` `?f=2` を付けて2回取った（キャッシュを避けるため）
- **IndexNow:** 孤立記事0を確かめてから `indexnow.ts --all` を実行。371件を通知し、HTTP 200 で受理された

## 4. 楽天マッチの再照合

- 下見: `match-rakuten.ts`（書き込みなし）。対象177件 / 一致51 / 保留126
  - 根拠: scripts/tmp/rakuten-match-2026-11-10.json
  - 前夜直した検索語の切り詰め（128文字）が効いたかは、出力の末尾しか残していないので確かめられていない。次の点検で全出力を残して見る
- 振り分け: `triage-rakuten.ts`。自動適用の対象2 / レビュー待ち49 / 未一致126
  - レビュー待ちの内訳: スコア0.85未満 30 / 相手だけ複数個入り 12 / 価格が離れている 7
- **適用: 2件。** 目で見て、どちらも同じ商品・同じ規格だったので `--apply scripts/tmp/rakuten-apply.json --write` で適用した（更新2件）
  - #93「お徳用 天然 日高昆布（切）500g 長さ15cm」（坂昆）← 楽天 bariasu-online「【送料無料】お徳用 天然 日高昆布（切） 500g 長さ15cm …」。
    前夜は「長さ35cm」の別規格が候補で外したが、今夜は「（切）」「15cm」まで一致する候補に変わっていた
  - #310「しあわせ昆布 プレーン 65g …（3袋セット）」（丸市岡田商店）← 楽天 zozo の同名商品「…（3袋セット）」。内容量・袋数とも一致
  - 書き換えたのは rakutenUrl / rakutenId だけ（スクリプトの経路のまま）。許可の範囲は広げていない
- **レビュー待ちに残った件数: 49件**。一覧は scripts/tmp/review-rakuten.csv
- 前夜外した #14（おしゃぶり昆布 梅 12g ← 120g 徳用）は今夜の自動適用の対象に入っていない

## 5. 前の枠の出力

analysis.md・improve-log.md・ai-citation・index-status・status-*.json はあった。new-content-log.md と held.md は無かった。
新規記事の枠は status-create.json に9件のコミット（kobujime-arrange の追加、昆布締め系への Recipe 付与など）と
exit 0 を残しており、作業自体は済んでいる。held.md が無いのは保留が無かったためと読む。
