# 夜間作業報告（2026-11-24）

今夜は分析（23:00）・改善（01:00）・新規（03:00）・点検（05:00）・仕上げ（07:00、この報告）の5枠が動いた。前の4枠はどれも exit 0 で、trouble の記録は無い。
held.md は新規枠が書いた（雑煮の新規を出典不足で見送り）。`docs/inbox.md` の未処理は無く、`- [!]` も無い。

## ■ 成果

- **公開した記事: 0本**（ガイドは42本のまま）
  - 雑煮の昆布だしを探したが、日本昆布協会の検索で昆布の量・扱いが書かれたレシピが1品しか無く、条件（3品以上）に届かなかったので見送った
- **直した記事: 3本**
  - おでんの昆布（oden-kombu）: 見出しと FAQ を「昆布の役割」で引けるようにし、協会レシピ5品の材料欄から具材の表と FAQ 1問を足した。初回クロール前に直したので、登録されれば1回で載る
  - 野菜の昆布締め（kobujime-vegetables）: 協会の「菜の花の昆布〆」「焼きなすの昆布締め」を足した（茹でる例と焼く例、昆布の湿らせ方の違い）
  - 昆布茶の使い方（kombu-cha-uses）: 協会の「こぶじめ風お刺身サラダ」（刺身に昆布茶をまぶす）と、昆布茶8gぶんの塩分・ヨウ素の換算を足した
- **適用した楽天リンク: 0件**。自動対象2件はどちらも目視で外した（#15 は相手が揚げ昆布で3夜続けて同じ、#218 は相手が9種の味から選ぶ詰め合わせページで「しそ昆布 ×5」に決まらない）。レビュー待ちは46件
- **記事以外の修正**（前回の報告 d1cd992 から今まで）
  - 仕組みの追加: **1件** — カテゴリページ（/category/*）に、並んでいる商品を ItemList の構造化データで出すようにした（9e4b63d）。順位・評価は付けていない
  - 不具合の修正: **1件** — おでんの昆布の本文の「下の表」を、位置に頼らない言い方に書き換えた（0d84e53）
  - 内部リンク: 変更なし。42記事とも他記事から指されていて孤立記事は0
  - IndexNow: 全件の 381 URL を送信し、受理された（HTTP 200）
  - 全体チェック: 出典80件はリンク切れ0・移転0、meta の要修正0、事実監査の食い違い0、アフィリリンクの問題0、200KB を超える画像0。サイト全体の ERROR は0
  - 見送ったもの: 昆布の育ち方（kombu-life-cycle）に「寿命」を足す件は、記事の出典2本を開き直したが寿命の記載が無かったので足していない
  - 見つかったが直していないもの: 外部リンク切れ8件（楽天7件・松前屋の URL）と商品 DB の WARN 4件。どれも DB への書き込みが要り、夜間に許可された範囲の外
  - 測れなかったもの: Core Web Vitals（PageSpeed API の共有枠が日次の上限）、サイトマップの lastmod の2回取得（curl が許可されていない）

## ■ 今夜わかったこと

1. **前夜「AI 引用で最初の効果」とした羅臼昆布は、3夜目に 2/2 → 0/2 に戻った**（1/2 → 2/2 → 2/2 → 0/2。本文は 11-21 から同じ）。効果とは言い切れず、揺れの範囲だった可能性があると読み直した。打ち手なしで 2/2 が続く語（サーモン 昆布締め）もあるので、**効果の条件を「直した版がクロール済み、かつ 2/2 が3夜続く（または3夜で 5/6 以上）」に厳しくした**。今夜「打ち手の効果」と言える語は0。全体は毎回引用 5 → 8語・引用なし 31語（42語中）
2. **クロールされていない塩昆布ガイドの取りこぼしが続いて大きくなっている。** 表示 230 → **253**・6.1位・クリック0。「塩昆布 塩分」だけで **66表示・3.2位・0クリック**（20夜目、最終クロール 11-07）。サイト全体は28日で表示 1,535 → **1,711**、クリック 36 → **37**、平均13.2位
3. **アフィリクリックは28日で12件（楽天6・Amazon6）で、すべて商品ページが入口。記事を入口にしたクリックは11夜続けて0件。** 記事から商品への導線が無いことの裏付けが続いている。昆布巻き（kombumaki）は表示 41 → 44 と季節の立ち上がりが続くが、55.2位・AI は14夜続けて引用なし

## ■ 効果測定

**比較できたのは1本。** Search Console の最新日は 11-21。

| 記事 | 改善 | 直した版のクロール | 改善前 | 改善後 |
| --- | --- | --- | --- | --- |
| 昆布の保存方法（kombu-storage） | 11-10 冒頭の要点・11-11 長期保存の FAQ | 11-14 00:58Z | 11-07〜11-13: 50表示・1クリック・約11.6位 | 11-14〜11-21: 114表示・2クリック・**7.9位**（CTR 1.8%） |

- kombu-storage の改善前の数字は前夜の分析（docs/night/2026-11-23/analysis.md）、改善後は今夜の `search-console.ts pages` の直近7日。順位はクロール後も7〜8位台を保っている。CTR は動いたと言えない
- 羅臼昆布（rausu-kombu）の AI 引用は、上のとおり 11-24 に 0/2 に戻ったので、効果の比較からは外した。GSC はクロール（11-22）後の日がまだ入っていないので**まだ比較できない**

ほかの記事は**まだ比較できない**。

- how-to-make-dashi は 11-19 14:14Z に再クロールされたが、クロール後の日が GSC にまだ足りない（14.6 → 22.5位に下がって見えるのは、頭の語に71〜95位で出始めた分。11-27 夜の分析で前後7日を比べる）
- kobujime-tips（11-22 クロール）・kobujime-vegetables（11-23 クロール）は、クロール後の日が GSC に入っていない
- ほかに直した記事（shiokombu-guide・kombumaki・kobujime-hare・kobujime-hirame・kobujime-arrange・kombu-cha-uses・kombu-tsukudani・kobujime・tororo-oboro など）は、最終クロールが直した日より前のまま。oden-kombu・nanakusa-gayu-dashi・toshikoshi-soba-dashi・kombu-life-cycle・miyako-kombu などはまだ一度もクロールされていない
- kombu-katsuo-dashi（昆布だし 鰹だし 違い）の AI 0/2 → 2/2 は、登録（11-23）の翌夜に起きたもので本文は変えていない。打ち手の効果には数えない

## ■ Gemini API の利用

- **呼び出し84回・トークン 112,954**（docs/night/2026-11-24/ai-citation.json の tokens 合計。42語を2回ずつ）
- 取得の失敗は0件。402（残高切れ）も 429（上限）も出ていない
- 利用額は API から取得できないため書いていない

## ■ URL検査でリクエストする5本

Search Console の URL 検査にそのまま貼り、「インデックス登録をリクエスト」を押す。

1. https://konbu-suki.com/guide/kombu-processed-foods — URL が Google に認識されていません
2. https://konbu-suki.com/guide/kombu-comparison — 検出 - インデックス未登録
3. https://konbu-suki.com/guide/nanakusa-gayu-dashi — URL が Google に認識されていません（七草がゆ。12月上旬に登録されている必要がある）
4. https://konbu-suki.com/guide/toshikoshi-soba-dashi — URL が Google に認識されていません（年越しそば。12月上旬に登録されている必要がある）
5. https://konbu-suki.com/guide/kombu-life-cycle — URL が Google に認識されていません

自動で選ぶ5本には入らないが、先にやると効果が大きいもの:

- https://konbu-suki.com/guide/kombumaki — **おせちの締め切り（11月末）まで残り5日。** 11-10 の強化と 11-22 の FAQ が1回の依頼で載る（最終クロール 11-07）
- https://konbu-suki.com/guide/shiokombu-guide — 表示253・6.1位・クリック0。11-14 に直した title を見せるための再クロール
- https://konbu-suki.com/guide/oden-kombu — 未認識。おでんの季節の最中。今夜「役割」「具材」の FAQ を足し終えたので、いま依頼すると1回で載る
- https://konbu-suki.com/guide/kobujime-hare — 正月の季節記事。11-19 に作り置きの FAQ を直した（食の安全）
- https://konbu-suki.com/guide/miyako-kombu — 未認識。「都こんぶ 酢こんぶ 違い」11表示・4.9位・1クリックが別記事に付いている
- 余裕があれば https://konbu-suki.com/guide/kobujime-arrange ・ https://konbu-suki.com/guide/kobujime-hirame （11-24 にアニサキス・クドアの注意）、 https://konbu-suki.com/guide/kombu-cha-uses （11-23 の title と今夜のレシピ）

## ■ インデックス

- **登録済み 34件 / 全44件**（URL 検査 API、11-24 23:06。エラー0で1回で取れた）
- 未登録10件の内訳
  - 検出 - インデックス未登録: **3**（kombu-seaweed-types・kombu-comparison・otsumami-kombu）
  - クロール済み - インデックス未登録: **0**（中身を見て見送られた記事は無い）
  - URL が Google に認識されていません: **7**（oden-kombu・kobujime-iwashi-katsuo・kombu-life-cycle・toshikoshi-soba-dashi・nanakusa-gayu-dashi・kombu-processed-foods・miyako-kombu）
- 前夜からの増減: 登録 **±0**（34 → 34。全体は oden-kombu が入って 43 → 44）、検出 5 → 3（-2）、クロール済み 0 → 0（±0）、未認識 4 → 7（+3）。
  iwashi-katsuo・toshikoshi・nanakusa が検出 → 未認識、comparison が未認識 → 検出に入れ替わったが、最終クロールはどれも「未」なので揺れとして読む。実質の増えは oden-kombu の1本。
  今夜は新しい登録も再クロールも0件だった

## ■ 朝やること

1. **上の URL を URL 検査からリクエストする。** 先に kombumaki（締め切りまで残り5日）・shiokombu-guide・oden-kombu・kobujime-hare・miyako-kombu、次に優先5本。この依頼は20夜続いている。済んだら inbox か todo.md に1行残してもらえると、効果を測れる
2. **カテゴリページの ItemList を Rich Results テストで確かめる。** https://konbu-suki.com/category/shiokombu を https://search.google.com/test/rich-results に貼る。動的ページで、夜間には中身を確かめられなかった
3. **楽天の自動適用の除外条件を決める。** #15（前島食品 おやつ昆布 ← 楽天の「揚げ昆布」）が3夜続けて score 1.00 で上がり、今夜は #218（丸美屋 しそ昆布 ×5 ← 9種の味から選ぶ詰め合わせページ）も上がった。どちらも目視で外している。triage に「相手の品名に別の加工（揚げ等）」「味を選ぶ詰め合わせ」の除外を足すか
4. **Next.js 16.4.3 の脆弱性の告知で、`npm run build` の1回目が毎回 exit 1 になる。** 今夜も改善・点検の枠で起き、2回目で通った。`npm audit` で advisory を見て、Next.js を上げるか決める（夜間は依存を更新しない）
5. ~~`docs/night/2026-11-24/.count.sh` を消す~~ — 仕上げ枠が確かめたら、フォルダにはもう無かった。改善枠の開始前の退避（stash）に未追跡ファイルとして入ったと見られる（中身の確認は許可が無くできなかった）。下の stash の整理と一緒に見ればよい。Slack に流した版ではこの項目が「消す」のままになっている
6. 季節の SNS: おせち・正月の昆布締めの投稿時期（12月上旬）まで約1週間。文案は `docs/sns/kombumaki.md`・`docs/sns/kobujime-hare.md`。おでん（`docs/sns/oden-kombu.md`）は季節の最中なのでいつ出してもよい
7. 前回から持ち越し: 楽天の商品リンクの404が7件と松前屋の URL（DB 書き込み）、`.env` の `PAGESPEED_API_KEY`、夜間に `npm run links` と `curl`（サイトマップの確認）を許可するか、serai.jp を出典に残すか、`git stash list` の退避（3 → **5件**。今夜の改善枠・新規枠の開始前に1件ずつ増えた。新規枠の分は held.md の未コミット分）、`scripts/tmp/page-queries.ts` の扱い、ガイドに DB の商品カードを出す仕組み、/product/259（六彩だし 131表示・8.9位、「六彩だし」62表示でクリック0）の説明文の取り込み、特商法ページの電話番号
