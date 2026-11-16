# 新規枠（2026-11-16 夜・3枠目、実施 2026-11-17）

## 前提

- `.stop` なし。inbox の未処理なし
- docs/night/2026-11-16/ に analysis.md・ai-citation.md は**無かった**（分析枠の出力なし）。競合の情報が無かった
- index-status.md も無かったので、この枠で `npx tsx scripts/index-status.ts` を回して作った（03:06 取得）
  - ガイド40ページで **登録30**・検出 - 未登録5・未認識5。**「クロール済み - インデックス未登録」は0件**
  - 指示にあった「47本中45本が未登録」とは数が合わない。index-status の対象は40ページ（トップ・/guide・ガイド38本）で、そのうち未登録は10
- `npx tsx scripts/fact-audit.ts` は開始時点で 要修正0・改善推奨0

## 新規: 出さなかった

理由は held.md。ホタテの昆布締め（4回目も出典なし）、昆布の食物繊維（kombu-nutrition と意図が被る）、昆布の等級（規格の原文なし）。
コミット cb9ba39。

## 強化（1本ずつ push）

1. **ma-kombu**（登録済み）— next-actions 中「旬」。北海道 fis087 を開き直し、「旬」の語が無いこと・漁獲時期6〜10月・
   「成長途中の春先に採れる身の柔らかいコンブ」の記載を確認。FAQ を「真昆布の旬（漁期）はいつですか」にし、本文の漁期の段落にも
   春先の記載を足した。4557830。check-article-links 切れ0、IndexNow 200
   - あわせて toshikoshi-soba-dashi の「関東 関西 違い」を探したが、公的資料が無く民間メディアだけだったので見送り（next-actions に `[!]`）
2. **scripts/indexnow.ts** — next-actions 中。変更行の行番号から記事を引く形に直し、`--url` はフルURLも受けるようにした。7672929
3. **gagome-kombu の related に kombu-seaweed-types** — 未認識の kombu-seaweed-types は被リンク3本で、うち1本（kombu-life-cycle）も未登録。
   登録済みで成分表の値を載せている gagome-kombu から張った（被リンク4本に）

## 人に頼むこと

- URL 検査の優先5本は index-status.md のとおり（kombu-processed-foods・toshikoshi-soba-dashi・kombu-comparison・kombu-life-cycle・nanakusa-gayu-dashi）
- 11-16 の分析枠が出力を残していない理由の確認（2枠目の記録と同じ）
