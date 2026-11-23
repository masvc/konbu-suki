# 夜間作業報告（2026-11-23）

今夜は分析（23:00）・改善（01:00）・新規（03:00）・点検（05:00）・仕上げ（07:00、この報告）の5枠が動いた。前の4枠はどれも exit 0 で、trouble の記録は無い。
held.md は無かった（保留したものは無い）。`docs/inbox.md` の未処理は無く、`- [!]` も無い。

## ■ 成果

- **公開した記事: 1本**（ガイドは 41 → 42本）
  - おでんの昆布（oden-kombu）: 日本昆布協会のおでんのレシピ5品から、だしの昆布と結び昆布の量（水1Lあたりに換算）・結び方・入れるタイミングを表にした。種類はぎょれんの用途（日高・長昆布）
- **直した記事: 3本**
  - 昆布締めの食べ方（kobujime-arrange）: 節の見出しを「食べるときの注意点」にし、厚労省のアニサキスの対策（冷凍・加熱の条件）とヨウ素の注意、FAQ 1問を足した（食の安全）
  - ヒラメの昆布締め（kobujime-hirame）: **クドアの注意と FAQ を足した。** 前夜は厚労省のページを開けず見送った分。今夜正しい URL を見つけて開き、「酢・塩・昆布締めでは対策にならない（記載が無い）」ことも書いた
  - 七草がゆのだし（nanakusa-gayu-dashi）: FAQ「七草がゆを食べるのはなぜ」を1問。北陸農政局・香川県の資料の原文の範囲だけで、体への働きの記述は入れていない
- **適用した楽天リンク: 1件**（#87 ダイホク 北海道天然日高昆布 300g）。自動対象2件のうち #15 は相手が揚げ昆布で別商品のため外した（2夜続けて）。レビュー待ちは45件
- **記事以外の修正**（前回の報告 b3b99d2 から今まで）
  - 仕組みの追加: **1件** — AI 引用の前夜比を `ai-citation-check.ts --diff` で出せるようにした（b587589）。7夜続けて未着手だった項目。チェックのたびに ai-citation-diff.md を自動で書き、4夜の並びと最終クロールを1表で見られる。分析枠が手で並べた表と一致した
  - 不具合の修正: **0件**（上のクドア・アニサキスの注意は記事の修正に含めた）
  - 内部リンク: 1コミットで **4記事をつないだ**（036097f）。新記事 oden-kombu を だし・種類・レシピ集の柱から本文と related で指し、被リンク 2 → 4。孤立記事は0
  - SNS: oden-kombu の X 投稿文案を置いた（7de403c）
  - IndexNow: 全件の 381 URL を送信し、受理された（HTTP 200）
  - 全体チェック: 出典79件はリンク切れ0・移転0、meta の要修正0、事実監査の食い違い0、アフィリリンクの問題0、200KB を超える画像0。サイト全体の ERROR は0
  - 見つかったが直していないもの: 外部リンク切れ8件（楽天7件・松前屋の URL）と商品 DB の WARN 4件。どれも DB への書き込みが要り、夜間に許可された範囲の外
  - 測れなかったもの: Core Web Vitals（PageSpeed API の共有枠が日次の上限）、サイトマップの lastmod の2回取得（curl が許可されていない）

## ■ 今夜わかったこと

1. **AI 引用で、このサイトで初めて「打ち手の効果」と言える語が出た。羅臼昆布**が 0/2 → 1/2 → 2/2 → **2/2**（11-20〜11-23）。直した版（旬・食べ方の FAQ）は 11-22 09:40Z にクロール済みで、決めておいた条件「2夜続けて 2/2、かつ変更後の版がクロール済み」を初めて満たした。どの打ち手が効いたかまでは1語では分けられない。全体は毎回引用 9 → 5語に減ったが、減った5語はどれも本文を変えていない揺れ
2. **再クロールされた記事は Search Console でも動いた。** 昆布の保存方法（kombu-storage）はクロール後7日で約11.6 → **7.5位**（サイト全体は 14.9 → 12.4位で、それより大きく上がった）。一方、まだクロールされていない塩昆布ガイドは **表示230・6.2位・クリック0**（前夜210）、「塩昆布 塩分」だけで57表示・**3.2位**でクリック0のまま（19夜目）。サイト全体は28日で表示 1,372 → **1,535**、クリック 33 → **36**
3. **「都こんぶ 酢こんぶ 違い」で11表示・4.9位・1クリックが付いていた**が、受けているのはおやつ昆布のまとめ記事（kombu-oyatsu-guide）だった。違いを詳しく書いた都こんぶの記事（miyako-kombu）は Google に未認識。サイト全クリック36のうち2がこの語。昆布巻き（kombumaki）は表示 37 → 41 と季節の立ち上がりが続くが、AI は13夜続けて引用なし、最終クロールは 11-07 のまま

## ■ 効果測定

**比較できたのは2本。** Search Console の最新日は 11-20。

| 記事 | 改善 | 直した版のクロール | 改善前 | 改善後 |
| --- | --- | --- | --- | --- |
| 昆布の保存方法（kombu-storage） | 11-10 冒頭の要点・11-11 長期保存の FAQ | 11-14 00:58Z | 11-07〜11-13: 50表示・1クリック・CTR 2.0%・約11.6位 | 11-14〜11-20: 97表示・2クリック・CTR 2.1%・**7.5位** |
| 羅臼昆布（rausu-kombu）※AI 引用 | 11-10 旬・11-20/11-21 食べ方の FAQ | 11-22 09:40Z | AI「羅臼昆布」11-20: 0/2 | 11-22: 2/2・11-23: 2/2（2回とも狙いのページ） |

- kombu-storage の数字は `search-console.ts pages 6` と `pages 13` の差から分析枠が出した（順位は表示で重みを付けた逆算）。表示の伸び（1.94倍）はサイト全体（1.76倍）とほぼ区別できない。**順位は約4.1位上がり、サイト全体（2.5位）より大きい。** CTR はクリックが1 → 2で、動いたとは言えない。本文も title も触らない判断
- rausu-kombu の GSC は 16表示・11.4位・1クリック（10-23〜11-20）。**GSC はまだ比較できない**（クロール後の日が GSC に入っていない）

ほかの記事は**まだ比較できない**。

- how-to-make-dashi は 11-19 14:14Z に再クロールされたが、クロール後の日が GSC に2日しか無い（9.9 → 14.6位に下がって見えるが判断しない。11-27 夜の分析で7日ぶん見る）
- kobujime-tips（11-22）・kobujime-vegetables（11-23）は直した版がクロールされたばかりで、GSC にクロール後の日が無い
- ほかに直した記事（shiokombu-guide・kombumaki・kobujime-hare・kobujime-hirame・kobujime-arrange・kombu-cha-uses・kombu-tsukudani・tororo-oboro など）は、最終クロールが直した日より前のまま。nanakusa-gayu-dashi・toshikoshi-soba-dashi・kombu-life-cycle・kombu-seaweed-types・miyako-kombu などはまだ一度もクロールされていない

## ■ Gemini API の利用

- **呼び出し82回・トークン 107,550**（docs/night/2026-11-23/ai-citation.md の記録。41語を2回ずつ）
- 取得の失敗は0件。402（残高切れ）も 429（上限）も出ていない
- 利用額は API から取得できないため書いていない

## ■ URL検査でリクエストする5本

Search Console の URL 検査にそのまま貼り、「インデックス登録をリクエスト」を押す。

1. https://konbu-suki.com/guide/kombu-processed-foods — URL が Google に認識されていません
2. https://konbu-suki.com/guide/kombu-comparison — URL が Google に認識されていません
3. https://konbu-suki.com/guide/nanakusa-gayu-dashi — 検出 - インデックス未登録（七草がゆ。12月上旬に登録されている必要がある。今夜 FAQ を足した）
4. https://konbu-suki.com/guide/toshikoshi-soba-dashi — 検出 - インデックス未登録（年越しそば。12月上旬に登録されている必要がある）
5. https://konbu-suki.com/guide/kombu-life-cycle — URL が Google に認識されていません

自動で選ぶ5本には入らないが、先にやると効果が大きいもの（登録済みで最終クロールが直した日より前、または検索の需要が見えているもの）:

- https://konbu-suki.com/guide/kombumaki — **おせちの締め切り（11月末）まで残り6日。** 11-10 の強化と 11-22 の FAQ が1回の依頼で載る
- https://konbu-suki.com/guide/shiokombu-guide — 表示230・6.2位・クリック0。11-14 に直した title を見せるための再クロール
- https://konbu-suki.com/guide/miyako-kombu — 未認識。「都こんぶ 酢こんぶ 違い」で 11表示・4.9位・1クリックが別記事に付いている
- https://konbu-suki.com/guide/kobujime-hare — 11-19 に作り置きの FAQ を直した（食の安全）。正月の季節記事
- https://konbu-suki.com/guide/kobujime-arrange ・ https://konbu-suki.com/guide/kobujime-hirame — 今夜アニサキス・クドア・ヨウ素の注意を足した（食の安全）
- 余裕があれば https://konbu-suki.com/guide/kombu-cha-uses ・ https://konbu-suki.com/guide/kobujime ・ https://konbu-suki.com/guide/tororo-oboro （11-23 に title と健康・安全の注意を直した）

## ■ インデックス

- **登録済み 34件 / 全43件**（URL 検査 API、11-23 23:06。エラー0で1回で取れた）
- 未登録9件の内訳
  - 検出 - インデックス未登録: **5**（kobujime-iwashi-katsuo・kombu-seaweed-types・toshikoshi-soba-dashi・nanakusa-gayu-dashi・otsumami-kombu）
  - クロール済み - インデックス未登録: **0**（中身を見て見送られた記事は無い）
  - URL が Google に認識されていません: **4**（kombu-life-cycle・kombu-processed-foods・kombu-comparison・miyako-kombu）
- 前夜からの増減: 登録 **+1**（33 → 34。**kombu-katsuo-dashi が登録**）、検出 6 → 5（-1）、クロール済み 0 → 0（±0）、未認識 4 → 4（±0）。
  toshikoshi・otsumami が未認識 → 検出、life-cycle・processed-foods・comparison が検出 → 未認識と入れ替わったが、最終クロールはどれも「未」なので揺れとして読む。
  登録済みのうち kobujime-vegetables（11-23 02:22Z）とトップページ（11-23 08:08Z）が再クロールされた
- 今夜公開の oden-kombu は URL 検査の取得（23:06）より後の公開なので、上の43件に入っていない

## ■ 朝やること

1. **上の URL を URL 検査からリクエストする。** 先に kombumaki・shiokombu-guide・miyako-kombu・kobujime-hare、次に優先5本、余裕があれば kobujime-arrange・kobujime-hirame ほか。この依頼は19夜続いている。kombumaki はおせちの締め切りまで残り6日。済んだら inbox か todo.md に1行残してもらえると、効果を測れる
2. **Next.js 16.4.3 の脆弱性の告知で、`npm run build` の1回目が毎回 exit 1 になる。** 今夜も改善・点検の枠で起き、2回目で通った。`npm audit` で advisory を見て、Next.js を上げるか決める（夜間は依存を更新しない）
3. **楽天の自動適用で #15（前島食品 おやつ昆布）が2夜続けて「揚げ昆布」と score 1.00 で上がった。** 目視で外しているが、triage に「相手の品名に別の加工（揚げ等）」の除外を足すか決める
4. 季節の SNS: おせち・昆布締めの投稿時期（12月上旬）まで約1週間。文案は `docs/sns/kombumaki.md`・`docs/sns/kobujime-hare.md` にある
5. 前回から持ち越し: 楽天の商品リンクの404が7件と松前屋の URL（DB 書き込み）、Amazon B0GF2J9CSY の販売終了の扱い、`.env` の `PAGESPEED_API_KEY`、夜間に `npm run links` と `curl`（サイトマップの確認）を許可するか、serai.jp を出典に残すか、`git stash list` の退避3件、`scripts/tmp/page-queries.ts` の扱い、ガイドに DB の商品カードを出す仕組み、/product/259（六彩だし 119表示・9.2位、「六彩だし」56表示でクリック0）の説明文の取り込み、特商法ページの電話番号
