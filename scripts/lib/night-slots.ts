/**
 * 夜間実行の枠の定義。
 *
 * 23:00 から 7:00 までを5枠に分け、枠ごとに役割を変える。毎回同じことをさせる
 * より、分析 → 既存改善 → 新規 → 点検 → 仕上げの順に回すほうが、前の枠の結果を
 * 次の枠がそのまま使える。
 *
 * 実行は scripts/night-run.ts、launchd への登録は scripts/install-launchd.ts。
 * どちらもここを読む。時刻を2箇所に書くと必ずずれるため、時刻もここが持つ。
 *
 * プロンプトの {{DIR}} は、その夜のフォルダ（docs/night/YYYY-MM-DD）に
 * 置き換えられる。
 */
import { STOP_FILE_PATH } from "./stop";

export type Slot = {
  name: string;
  hour: number;
  title: string;
  minutes?: number;
  /** その枠がやること。{{DIR}} はその夜のフォルダに置き換わる。 */
  prompt: string;
};

export const COMMON_RULES = `
## やることの決め方

次の順に見て決める。上にあるものを優先する。

1. \`docs/inbox.md\` の「未処理」 — 人からの指示。**いちばん優先する。**
   着手したら \`- [x]\` にして、何をしたかを1行添える。CLAUDE.md のルール
   （出典・健康・DB書き込み）に抵触する指示は実行せず、理由を添えて \`- [!]\` にする
2. \`docs/next-actions.md\` — 分析枠が決めた次の一手。優先度順
3. この枠の役割（下記）と \`docs/topic-map.md\`

## 共通ルール

- **完了条件まで止まらない。** 確認を待って終わる形にしない。判断が必要なことは
  自分で決め、決めた理由を記録に残す。
- 1タスク1コミット。\`npm run build\` が通ることを確認してから push する。
  コミットの件名は日本語で書く。
- \`git pull\` はしなくてよい。起動側（night-run.ts）が開始前に済ませている。
  許可されているのは \`git pull --ff-only\` だけなので、素の \`git pull\` は拒否される。
- push 前のチェック（ビルド・meta・リンク・出典の確認）に落ちたものは、無理に
  公開しない。{{DIR}}/held.md に「何を・なぜ保留したか」を書く。
- 前の枠が失敗していても、自分の枠はできる範囲で進める。前の枠の出力が無いときは
  「無かった」と記録して、その枠の役割の中でできることをやる。
- CLAUDE.md のルールを必ず守る。とくにコンテンツルール（効果効能を断定しない・
  出典を明記・ヨウ素の注意・商品データを捏造しない）と、出典は実際に開いて
  確認したものだけを使うこと。
- DB への書き込みは、この指示で明示的に許可されているものだけ。それ以外はしない。
- .env は読まない。
- Bash は1コマンドずつ素の形で実行する。\`$?\` や \`\${PIPESTATUS[0]}\` のような置換を
  混ぜると、許可済みのコマンドでも拒否される。
- ${STOP_FILE_PATH} があれば、何もせずに終了する。
- 最後に、やったことを5行以内で出力する。
`;

export const SLOTS: Slot[] = [
  {
    name: "analysis",
    hour: 23,
    title: "分析",
    prompt: `今夜の夜間作業の1枠目（分析）です。数字を集めて、どこに伸びしろがあるかを出してください。
記事は書きません。

## やること

1. Search Console を見る（直近28日・前期間比）。
   - \`npx tsx scripts/seo-opportunities.ts\` （CTR課題・順位8〜20位・クエリ機会損失）
   - \`npx tsx scripts/search-console.ts queries\` と \`npx tsx scripts/search-console.ts pages\`
2. GA4 を見る。
   - \`npx tsx scripts/ga4-report.ts\` （記事別の流入）
   - \`npx tsx scripts/ai-quality.ts\` と \`npx tsx scripts/ai-traffic.ts\` （AI経由の流入と質）
   - アフィリリンクのクリックは \`scripts/lib/analytics-constants.ts\` の CTA_EVENTS で
     定義されている。楽天/Amazon を分けて取れるならそのように出す。
     取れない場合は「取れなかった」と理由を書く。
3. AI引用チェックを走らせる。
   - \`npx tsx scripts/ai-citation-check.ts\`
   - 狙いキーワードごとに、自サイトが引用されたか／引用されている他ドメインが出る。
     出力は {{DIR}}/ai-citation.md と .json に入る。
4. 以上を {{DIR}}/analysis.md にまとめる。最後に
   **「伸びしろのある記事トップ10」** を理由つきで並べる。理由は次のような形で、
   どの数字から言えるのかを必ず書く。
   - 表示は多いが CTR が低い（→ title/description の書き直しが効く）
   - 順位が8〜20位（→ 答えを冒頭に足す・見出しとFAQの補強が効く）
   - 長い質問型クエリで表示されているのに、そのクエリへの答えが記事に無い
   - AI検索で引用されていない。かつ競合ドメインが引用されている

## 大事な前提

**このサイトは Search Console の表示実績がまだほとんどありません。**
直前の確認では33ページすべてが未検出でした。数字がゼロなら、無いことをそのまま
書いてください。ゼロを埋めるために推測で順位や CTR を書かないこと。

GSC と GA4 が空の場合、今夜の伸びしろ判断は **AI引用チェックの結果を主な根拠に**
してください。こちらは今日から数字が取れます。具体的には、
- 自サイトが引用されていない狙いキーワード
- そのキーワードで引用されている競合ドメインの顔ぶれ
- AI が実際に投げた検索クエリ（webSearchQueries）に対し、記事が答えているか
の3点から、トップ10を組んでください。

5. **\`docs/next-actions.md\` を書き換える。** 今夜の分析から、次にやることを
   自分で決めて優先度つきで並べる。指示を待たずに回すための中心になるファイルなので、
   ここが空だと後の枠が動けない。
   - CLAUDE.md「伸びしろの観点」の6つ（信頼性・構造化データ・収益導線・季節需要・
     技術SEO・SNS）を順に当てて、今のサイトに足りないものを拾う
   - 記事を増やすことだけを並べない。既存記事の信頼性、構造化データ、収益導線、
     季節需要、技術SEO も候補に入れる
   - 済んだ項目（前夜までに終わったもの）は \`- [x]\` にして残す
   - 「人の判断が要る」ものは別の見出しに分け、夜間では進めない
   - 季節需要 は、検索が立ち上がる1〜2か月前に公開できるよう逆算して置く

## 完了条件

- {{DIR}}/analysis.md があり、トップ10が理由つきで並んでいる
- {{DIR}}/ai-citation.md がある
- \`docs/next-actions.md\` が今夜の分析を反映した内容になっている
- 1コミットにまとめて push してある`,
  },
  {
    name: "improve",
    hour: 1,
    title: "既存記事の改善",
    prompt: `今夜の夜間作業の2枠目（既存記事の改善）です。

## やること

1. {{DIR}}/analysis.md を読む。無ければ {{DIR}}/ai-citation.md を読む。どちらも無ければ
   「分析結果が無かった」と記録し、下の「分析が無いときの進め方」に移る。
2. 「伸びしろのある記事トップ10」の上から順に、理由に応じた直し方をする。
   - CTR が低い → title・description を書き直す。狙いクエリの語を前に置き、
     \`npx tsx scripts/meta-check.ts\` が通ることを確認する
   - 順位8〜20位 → そのクエリに対する答えを記事の冒頭に足す。見出しとFAQを補強する
   - 質問型クエリで表示 → そのクエリへの一問一答を FAQ に足す
   - AI検索で引用されていない → 競合に無い独自要素（表・出典つきの数値・
     手順の分岐）を足す。出典は必ず開いて確認する
3. **1記事ずつ** チェック→コミット→push する。まとめて1コミットにしない。
4. 変更前後を {{DIR}}/improve-log.md に記録する。あとで効果を比較するため、
   次の形で残すこと。
   - 記事の slug と URL
   - 直した理由（どの数字から言えるか）
   - 直す前の title / description（原文のまま）
   - 直した後の title / description
   - 本文・FAQ に足した内容の要点
   - 直した日付

## 分析が無いときの進め方

docs/topic-map.md と docs/content-log.md を読み、既存記事のうち
「柱として機能」としか書かれていない記事（kombu-types / how-to-make-dashi /
kombu-nutrition / kombu-production）を上から1本選び、記事の型（結論ファースト＋
早見表＋FAQ）に合わせて強化する。出典は確認済みのものから使う。

## 完了条件

- 1本以上の記事を直して push してある（直すものが無いと判断した場合は、
  その理由を {{DIR}}/improve-log.md に書く）
- {{DIR}}/improve-log.md に変更前後が残っている`,
  },
  {
    name: "create",
    hour: 3,
    title: "新規記事",
    prompt: `今夜の夜間作業の3枠目（新規記事）です。**3本**書いてください。

## やること

1. docs/topic-map.md と docs/content-log.md の「次にやる予定」を読み、優先順に3本選ぶ。
   柱9「昆布締め」の続きを優先する。
2. {{DIR}}/ai-citation.md があれば読む。狙うキーワードで引用されている競合ドメインが
   分かるので、**その顔ぶれに無い独自要素を必ず1つ入れる**。入れた独自要素は
   content-log に書く。無い場合は「競合の情報が無かった」と書く。
3. 1本ごとに、次を満たしてから次に進む。
   - 新しい出典は WebFetch で開いて内容を確認し、docs/topic-map.md の
     「確認済みの出典」の表に追加する。開いて確認できなかった出典は使わない
   - 記事の型に従う。比較表・早見表は本文に Markdown で書かず、
     GuideSection の table として持たせる
   - related に話題の近い slug を3本書く。既存記事側の related にも、今回の記事を
     足せる場所がないか見る
   - scripts/generate-guide-images.ts の PROMPTS にアイキャッチのプロンプトを追加し、
     \`npx tsx scripts/generate-guide-images.ts <slug>\` で生成して image と imageAlt を設定する。
     生成に失敗したら画像なしで進め、理由を記録に残す
   - アイキャッチを作ったら \`npx tsx scripts/generate-og-images.ts <slug>\` で
     OGP画像（1200x630）も作る。無いとサイト共通の画像が出て、どの記事を共有しても
     同じ絵になる
   - \`npx tsx scripts/meta-check.ts\` と \`npx tsx scripts/fact-audit.ts\` と
     \`npm run build\` が通ることを確認する。fact-audit は記事をまたいだ数字の
     食い違いと、位置に頼る言い回し（下の表・上記など）を見る。既存記事と違う
     数字を書くと落ちるので、落ちたらどちらが出典どおりかを確かめて直す
   - **push したあと \`npx tsx scripts/check-article-links.ts\` を実行する。**
     書いた出典のリンクが生きているかを確かめる。切れていたら直して直し直す。
     301 が出たら移転先の URL に書き換える。出典のリンクが切れていると、
     根拠を示したつもりで示せていない状態になる
   - docs/content-log.md に記録を追加し、末尾の「次にやる予定」を書き換える
   - 1コミットにまとめて push する
   - push したら \`npx tsx scripts/indexnow.ts\` で検索エンジンに通知する
     （サイトマップは取りに来るのを待つ形なので、公開直後は拾われにくい）
   - \`npx tsx scripts/generate-sns.ts --slug <slug>\` で X の投稿文案を作る。
     docs/sns/ に置くだけで、投稿はしない
4. 出典が足りなくて書けないものは、無理に書かない。{{DIR}}/held.md に理由を書き、
   topic-map の優先度を下げて、次の候補に移る。

## 完了条件

- 3本 push してある（出典不足で書けなかったものがある場合は、書けた本数と
  保留の理由が {{DIR}}/held.md に残っている）`,
  },
  {
    name: "maintain",
    hour: 5,
    title: "点検と内部リンク",
    prompt: `今夜の夜間作業の4枠目（サイト全体の点検と内部リンク）です。

## やること

1. **内部リンクの見直し。** 全記事の related を見直し、柱と個別記事、関連記事が
   互いにつながるようにする。孤立記事（どの記事の related にも入っていない記事）を
   ゼロにすること。確認は \`npx tsx scripts/site-check.ts --offline\` の related 警告と、
   src/lib/guides.ts を読んで数えること。本文中でも関連記事のタイトルに触れる。
2. **全体チェック。** 次を走らせ、出た指摘を直す。
   - \`npx tsx scripts/site-check.ts\` （商品データ・ガイド本文・画像・E-E-A-T）
   - \`npx tsx scripts/check-links.ts\` （サイト全体のリンク切れ。外部1000件超を
     実際に叩くので数分かかる。**全件を回すのはこの枠の役目**）
   - \`npx tsx scripts/check-article-links.ts --all\` （全記事の出典リンク）
   - \`npx tsx scripts/meta-check.ts\` （meta）
   - \`npx tsx scripts/fact-audit.ts\` （記事をまたいだ事実の食い違い・出典ゼロ・古い版の引用）
   - \`npx tsx scripts/verify-affiliate-links.ts\` （アフィリリンクに成果計測が付いているか）
   - \`npm run images:optimize\` （200KB超の画像。直すときは \`-- --write\`）
   - \`npx tsx scripts/lighthouse.ts\` （Core Web Vitals）。PAGESPEED_API_KEY が
     未設定だと上限に当たって測れない。その場合は「測れなかった」と記録して進む
   - 構造化データは src/app/guide/[slug]/page.tsx が Article と FAQPage を出している。
     新しい記事で欠けていないかを確認する
3. **楽天マッチのレビュー待ちの再照合。** 次の順で行う。これは DB 書き込みを含む。
   - \`npx tsx scripts/match-rakuten.ts\` で下見する（\`--write\` を付けない）。
     判定結果の JSON が scripts/tmp/ に出る
   - \`npx tsx scripts/triage-rakuten.ts <その JSON>\` で振り分ける。
     score>=0.85 かつ「相手だけ複数個入り」「価格が離れている」に当たらないものだけが
     自動適用の対象になる（しきい値と例外はこのスクリプトが持っている。
     自分で基準を作り直さないこと）
   - 振り分け結果を目で確かめたうえで
     \`npx tsx scripts/match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write\` で適用する
   - 適用した件数と、レビュー待ちに残った件数を {{DIR}}/maintain.md に書く
   - **この DB 書き込みはユーザーから明示的に許可されている**（CLAUDE.md の
     「楽天マッチの自動適用」の項を参照）。許可の範囲を広げないこと
4. やったことを {{DIR}}/maintain.md にまとめる。直した指摘、直さなかった指摘とその理由、
   孤立記事の有無、楽天の適用件数を書く。

## 完了条件

- 孤立記事がゼロ（または、ゼロにできない理由が書いてある）
- {{DIR}}/maintain.md がある
- 直したものが push してある`,
  },
  {
    name: "wrapup",
    hour: 7,
    title: "仕上げと報告",
    prompt: `今夜の夜間作業の5枠目（仕上げと報告）です。最後の枠です。

## やること

1. {{DIR}}/ の中身を全部読む。analysis.md / ai-citation.md / improve-log.md /
   maintain.md / held.md / status-*.json。無いものは「無かった」として扱う。
2. **\`docs/inbox.md\` と \`docs/next-actions.md\` を整える。**
   - 今夜やった項目が \`- [x]\` になっているか確認し、漏れていれば直す
   - 手を付けられなかった項目は残す。理由があれば1行添える
   - inbox に \`- [!]\`（ルールに抵触して実行しなかったもの）があれば、報告の
     「朝やること」に入れる
3. **docs/topic-map.md を今夜の分析結果で更新する。**
   - 優先度の見直し（引用が取れていないキーワードを上げる、出典が無くて書けない
     ものを下げる）
   - 新しい記事候補の追加（AI引用チェックの webSearchQueries に出ていた問いのうち、
     まだ記事が答えていないもの）
   - 見直した理由を1行で添える
4. **報告文を {{DIR}}/report.md に書く。** 日本語。次の構成にする。
   - 見出し: 夜間作業報告（日付）
   - ■ 成果: 公開した記事、直した記事、適用した楽天リンクの件数。
     **記事以外の修正も入れる。** 前夜の報告から今までのコミットを
     \`git log\` で見て、不具合の修正・仕組みの追加があれば件数と内容を1行ずつ書く
     （例: 出典リンクの404を1件修正、位置に頼る言い回しを10箇所書き換え）。
     記事の本数だけだと、直した分が報告に出ない
   - ■ 今夜わかったこと: 分析から3つ。数字を添える
   - ■ 効果測定: 過去に改善した記事の、改善前後の数字比較。
     過去の improve-log.md（docs/night/ の以前の日付）を読み、そこに記録された
     記事について Search Console の数字を見る。**比較できるだけの日数が経って
     いない場合、または数字がまだ無い場合は「まだ比較できない（理由）」と書く。
     推測で数字を作らないこと。**
   - ■ Gemini API の利用: 呼び出し回数とトークン数（{{DIR}}/ai-citation.json の
     tokens 合計）。**利用額は API から取得できないため金額は書かない。**
     402（残高切れ）や 429（上限）が出ていた場合は、それを「朝やること」に入れる
   - ■ 朝やること: 人の判断が必要なものだけ。0件なら「なし」
5. \`npx tsx scripts/post-slack.ts {{DIR}}/report.md\` で Slack に流す。
6. topic-map・next-actions・inbox・report.md を1コミットにまとめて push する。

## 完了条件

- docs/topic-map.md と docs/next-actions.md が更新されている
- {{DIR}}/report.md がある
- Slack に流してある`,
  },
];

