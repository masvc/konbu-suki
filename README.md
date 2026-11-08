# konbu-suki（コンブスキー）

昆布専門のキュレーションサイト。産地別の特徴から種類別の比較までを扱う。
開発上のルールは [CLAUDE.md](CLAUDE.md)、判断の記録は [todo.md](todo.md) を参照。

## 技術

- Next.js + Tailwind CSS v4
- Prisma + PostgreSQL (AWS RDS) / アダプタは `@prisma/adapter-pg`
- デプロイ: AWS Amplify（GitHub連携で自動デプロイ、`amplify.yml`）

## 別のPCで立ち上げる

```bash
git pull                # 複数のPCで触るので、作業前に必ず引く
npm ci                  # 依存を入れる（npm install ではなく ci を使う）
npx prisma generate     # src/generated/prisma を作る（gitignore 対象）
npm run env:pull        # .env と google-credentials.json を取得（下記）
npm run dev
```

`git pull` を先にやる理由: 古いまま作業すると、すでに直した箇所を
「未対応」と判断して二重に直したり、古い前提のメモを作ってしまう。
実際に一度それが起きている。

`.env` は git に入っていない。[.env.example](.env.example) のキーを埋める。
`DATABASE_URL` が無いと商品を扱うページとスクリプトは動かない。

複数のPCで使うなら、`.env` と `google-credentials.json` は
AWS SSM Parameter Store 経由で共有できる（下記）。手でコピーして回すと
片方だけ新しいキーが入っている状態になりやすい。

## .env の共有（SSM Parameter Store）

```bash
npm run env:status   # ローカルと保管先の差分を見る（値は表示しない）
npm run env:pull     # 保管先 → ローカル（既存は退避してから書く）
npm run env:push     # ローカル → 保管先（確認後 --yes を付けて実行）
```

対象は `.env` と `google-credentials.json`。保管先は
`/konbu-suki/env` と `/konbu-suki/google-credentials`（いずれも SecureString）。

Secrets Manager ではなく Parameter Store を使っている。標準の SecureString は
無料で 4KB まで入り、どちらのファイルも収まる。自動ローテーションが必要に
なったら Secrets Manager に移す。

`status` は値を出さず、SHA-256 の先頭8桁だけを比べて一致/相違を示す。
`push` は保管先を他の端末も参照するため、差分を表示して一度止まる。

必要な IAM 権限は `ssm:GetParameter` と `ssm:PutParameter`（対象は
`parameter/konbu-suki/*`）。SecureString の復号に `kms:Decrypt` も使う
（AWS 管理キー `alias/aws/ssm`）。リージョンは未設定なら `ap-northeast-1`。

### 初回だけ：保管先を作る

**値が一番揃っているPCから** push する。空の `.env` を push すると、
他のPCがそれを取得して壊れる。

```bash
git pull                    # env-sync.ts を取得
npm run env:status          # 「push で登録できる」と出るはず
npm run env:push            # 差分を表示してここで止まる
npm run env:push -- --yes   # 内容を確かめてから送る
```

以後は他のPCで `npm run env:pull`。キーを足したときは、足したPCで
`env:push` してから他のPCで `env:pull` する。

AWS CLI の認証情報が無いPCでは使えない（`aws configure` が必要）。
認証情報そのものは保管先に入れていない。鶏と卵になるため。

`npm ci` を使う理由: `npm install` を繰り返すとプラットフォーム固有の
ネイティブパッケージ（esbuild、Next.js の SWC、lightningcss など）の
バイナリが欠けることがある（npm の optional dependencies の既知の問題）。
`Cannot find native binding` や `Turbopack is not supported on this platform`
が出たら `rm -rf node_modules && npm ci` で直る。

## ビルド

```bash
npm run build           # prisma generate + next build（webpack）
```

webpack を明示している。Turbopack では lightningcss が動的 require を
使っているためバンドラが解決できず、`globals.css` の処理で失敗する。
`npm run dev` も同じ理由で webpack を指定している。

## 点検スクリプト

```bash
npm run check           # 下の3つをまとめて実行し、要約を Slack に流す
npm run check:offline   # 本番サイトを叩かず、Slack にも流さない
npm run typecheck:scripts   # scripts/ の型チェック（tsconfig.json の対象外のため）
```

| スクリプト | 見るもの |
| --- | --- |
| `site-check.ts` | 商品データの欠損・重複、ガイド本文、主要ページの疎通、画像404 |
| `check-links.ts` | sitemap 起点の全ページとリンク切れ（内部・外部） |
| `meta-check.ts` | 全ページの meta title / description |
| `optimize-guide-images.ts` | ガイド画像の200KB超えを探して品質だけ落とす（`npm run images:optimize`、書き換えは `-- --write`） |
| `fact-audit.ts` | 記事をまたいだ事実の食い違い・出典ゼロの記事・古い版の引用・位置に頼る言い回し（`npm run facts`） |
| `check-article-links.ts` | 記事に書いた出典のリンクが生きているか（`npm run links`）。既定は直近のコミットで変わった記事だけ。`-- --all` で全記事 |
| `ai-citation-check.ts` | AI検索で引用されているかを見る（`npm run ai:citation`）。狙いキーワードごとに自サイトの引用有無・引用元ドメイン・AIが投げた検索クエリを残す |
| `post-slack.ts` | ファイルの中身を Slack に流す。夜間の最後の枠が報告に使う |
| `health-report.ts` | 上記をまとめて実行し、ログを残して Slack へ要約を投げる |

`site-check.ts` は `--offline` で本番サイトを叩かずローカルとDBだけを見る。
各スクリプトは最後に `SUMMARY:` の1行を出す。`health-report.ts` がそれを拾う。

通知先は `SLACK_OPS_WEBHOOK_URL`。お問い合わせ用の `SLACK_WEBHOOK_URL` とは
分けてある。同じキーを使い回すと、本番に設定した時点で問い合わせが点検
チャンネルに流れてしまう。どちらも未設定なら通知を飛ばして続行する。

## 定期実行

```bash
npm run launchd                                 # plist を生成して手順を表示
npx tsx scripts/install-launchd.ts --install    # 登録まで行う
npx tsx scripts/install-launchd.ts --uninstall  # 登録を外す
```

登録されるもの:

| ラベル | いつ | 中身 |
| --- | --- | --- |
| `com.konbusuki.checks` | 毎日 9:00 | 定期点検（サイト品質・リンク・meta） |
| `com.konbusuki.night.analysis` | 毎日 23:00 | 夜間 分析 |
| `com.konbusuki.night.improve` | 毎日 1:00 | 夜間 既存記事の改善 |
| `com.konbusuki.night.create` | 毎日 3:00 | 夜間 新規記事 |
| `com.konbusuki.night.maintain` | 毎日 5:00 | 夜間 点検と内部リンク |
| `com.konbusuki.night.wrapup` | 毎日 7:00 | 夜間 仕上げと報告 |

点検の時刻は `--hour 10` で変えられる。夜間の5枠の時刻は
`scripts/lib/night-slots.ts` が持つ。点検を9:00にしているのは、夜間の最後の枠
（7:00）と重なると本番サイトを同時に叩き、Slack にも2通届くため。

作業報告は**定時実行しない**。以前は `com.konbusuki.activity` が2時間ごとに
流していたが、時間で区切ると同じ成果が何度も報告される。作業が一通り終わった
時点で1回流す形にした（`auto-content.ts` が最後に `activity-report.ts` を呼ぶ）。
廃止したラベルは `--install` / `--uninstall` のどちらでも登録が外れる。

plist は実行環境から生成する。node のパスやプロジェクトの位置が機種ごとに
違うため、固定ファイルをリポジトリに置くと別のPCで動かない。
ログは `~/Library/Logs/konbu-suki/`。

手で動かして確かめるとき:

```bash
launchctl start com.konbusuki.checks
launchctl list com.konbusuki.checks   # PID があれば実行中
```

`start` は**すでに実行中なら黙って無視される**。1回の実行に1分以上かかるので、
走っている最中にもう一度投げても2回目は動かず、ログも1回分しか増えない。
`.env` を書き換えて試すときは、PID が消えてから `start` する
（`.env` は実行開始時に読まれるため、途中で書き換えてもその回には効かない）。

## 夜間実行（自動・10時間5枠）

23:00 から翌朝 7:00 までを5枠に分け、枠ごとに役割を変えて `claude -p` を走らせる。

| 時刻 | 枠 | やること |
| --- | --- | --- |
| 23:00 | `analysis` | GSC / GA4 / AI引用チェックを集め、伸びしろのある記事トップ10を出す |
| 1:00 | `improve` | その結果にそって既存記事を直す。変更前後を記録する |
| 3:00 | `create` | 新規記事を3本 |
| 5:00 | `maintain` | 内部リンクの見直し、全体点検、楽天マッチの再照合と適用 |
| 7:00 | `wrapup` | トピックマップの更新と Slack 報告 |

```bash
npm run night -- --list                  # 枠の一覧
npm run night -- --slot analysis --dry   # 渡すプロンプトを確認するだけ
npm run night -- --slot create           # 1枠を手で走らせる
npm run night -- --slot create --minutes 60
```

枠の定義（時刻・役割・プロンプト）は `scripts/lib/night-slots.ts` にまとめてある。
launchd への登録もそこを読むので、時刻を2箇所に書かない。

**毎回同じことをさせず、順番に意味を持たせている。** 分析 → 既存改善 → 新規 →
点検 → 仕上げの順なら、前の枠の結果を次の枠がそのまま使える。朝には
「数字を見て直した状態」になる。

**対話モードではなく `-p` を使う。** 対話モードは返事を返したところで一区切りに
なる作りで、夜通し走らせる用途に向かない（実際に途中で止まった）。1枠1起動に
区切る。会話が毎回まっさらになるので、文脈が膨らんで判断が重くなることもない。

### やることをどう決めるか

枠は次の順に見て決める。上にあるものを優先する。

| 順 | ファイル | 誰が書くか |
| --- | --- | --- |
| 1 | [docs/inbox.md](docs/inbox.md) | 人。思いついた指示をここに入れる |
| 2 | [docs/next-actions.md](docs/next-actions.md) | 分析枠（23:00）が、その夜の分析から自分で決める |
| 3 | [docs/topic-map.md](docs/topic-map.md) | 記事の計画 |

**指示を出さなくても回る。** 23:00 の枠が分析結果から次の一手を決めて
`next-actions.md` に書き、後の枠がそれを実行する。判断の基準は CLAUDE.md
「伸びしろの観点」（信頼性・構造化データ・収益導線・季節需要・技術SEO・SNS）。

`docs/inbox.md` は手で書いてもよいし、Slack から取り込んでもよい。
取り込みは各枠の開始前に `scripts/slack-inbox.ts` が自動で走る。

```bash
npm run inbox          # 手で取り込む
npm run inbox -- --dry # 拾える分だけ見る
```

Slack から取り込むには `.env` に `SLACK_BOT_TOKEN`（`xoxb-` で始まるボットトークン）と
`SLACK_INBOX_CHANNEL`（チャンネルID）が要る。通知に使っている
`SLACK_OPS_WEBHOOK_URL` は**送信専用で、履歴は読めない**。未設定のあいだは
`docs/inbox.md` を直接書く運用で回る（未設定でも枠は落ちない）。

### 枠をまたぐ受け渡し

`docs/night/YYYY-MM-DD/` に置く。日付は12時間戻して決めるので、23:00 の枠と
翌朝 7:00 の枠が同じフォルダに入る。詳細は [docs/night/README.md](docs/night/README.md)。

### 二重起動と後片付け

- 枠が重ならないよう `~/Library/Logs/konbu-suki/night.lock` で排他する。
  前の枠が打ち切り時間まで粘ると次の枠と重なり、claude が2つ同時にコミットして
  片方の変更を巻き込むため
- 未コミットの変更が残っていたら `git stash` に退避してから始める。捨てないが、
  claude の変更と混ぜない。退避したことは `held.md` に書く
- `git pull --ff-only` が通らないときは、その枠を見送って Slack に流す。
  履歴が分かれた状態で無人のまま進めるとこじれるため

### 初回だけ：権限ファイルを作る

```bash
cp auto-settings.example.json auto-settings.json
```

`-p` では権限を都度聞けないため、許可していない操作は黙って拒否される。
許可・禁止はこのファイルに書く。`auto-settings.json` は gitignore 対象。
雛形では次を禁止している。

- 商品を取り込む系のスクリプトと `prisma`、`.env` と `google-credentials.json` の読み取り
- `git push --force` / `git reset --hard` / `rm` / `git stash drop`
- 自分自身の登録を変えること（`install-launchd.ts` / `launchctl` / `night-run.ts`）

楽天マッチの適用だけは例外で許可している（CLAUDE.md「楽天マッチの自動適用」）。
`--write` 単体は `NIGHT_RUN=1` のときスクリプト側が拒否するので、
`triage-rakuten.ts` が絞った分しか入らない。

### 報告

報告は最後の枠（7:00）が `docs/night/<日付>/report.md` を書いて
`scripts/post-slack.ts` で流す。途中の枠は、打ち切られたときと異常終了した
ときだけ理由を流す。

あわせて、要点3行を**メンション付き**でもう1通送る（`summary.md`）。
報告の全文は長く、スマホの通知では読めないため。宛先は `.env` の
`SLACK_MENTION`。未設定なら `<!channel>`（チャンネル全員に通知）になるので、
人が複数いるチャンネルなら自分のメンバーIDを入れる。

メンションは `escapeSlack` に通さない。`<!channel>` の山括弧が `&lt;` に
変換されると、ただの文字列になって通知が飛ばない。

### 止めたいとき

```bash
touch .stop   # 次の枠から何もしない
rm .stop      # 再開
```

### 動かないときに見るところ

- ログ: `~/Library/Logs/konbu-suki/com.konbusuki.night.<枠>.{out,err}.log`
- launchd の PATH には Homebrew が入っていない。`claude` と `node` の場所は
  スクリプト側で解決して渡している（手では通るのに定時実行だけ落ちる形を避ける）
- Mac がスリープしていると定時に起動しない。AC電源で `pmset -g custom` の
  `sleep 0` を確認する
- Slack に出ない場合は `.env` の `SLACK_OPS_WEBHOOK_URL` が未設定

## 技術SEO

方針は [docs/seo-aio.md](docs/seo-aio.md)。実測した数字と、やらないことも書いてある。

```bash
npm run images:og          # 記事の OGP 画像（1200x630）をアイキャッチから作る
npm run indexnow           # 直近のコミットで変わった記事を検索エンジンに通知
npm run indexnow -- --all  # 全ページ
npm run meta:generate      # meta description の案を作る
                           # 反映は npx tsx scripts/generate-meta.ts --apply <案のJSON>
npm run sns                # 記事ごとの X 投稿文案を3つずつ docs/sns/ に作る（投稿はしない）
npm run lighthouse         # Core Web Vitals（PAGESPEED_API_KEY が要る）
npm run index:status       # Search Console でインデックス状況を取り、未登録の理由別に数える
                           # URL検査でリクエストする優先5本も選ぶ（API からはリクエストできない）
```

`/llms.txt` は記事一覧から組み立てて配信している（`src/app/llms.txt/route.ts`）。
固定ファイルにすると必ず古くなるため、記事を足せば自動で反映される。
出典の一覧も載せている。出典を開いて確認したものだけを書くという作り方そのものが、
引用先としての判断材料になるため。

meta description の生成は、作るのと反映するのを分けてある。1回の実行で生成して
そのまま書き込む形にすると、目を通した案と実際に入る案が別物になる（生成のたびに
文面が変わるため）。案は JSON に残し、それを読んで反映する。

反映は自動で絞られる。**検査を通っても、元が100字以上あるものは置き換えない。**
実測では98字の手書き文に対する案が104字で、良くなった分がほとんど無かった。
効くのは61〜86字しか無い記事を120字前後に伸ばすところ。

IndexNow のキーは `src/lib/indexnow.ts` と `public/<キー>.txt` の2か所にある。
公開して問題ない値で、所有確認はこの2つが一致するかで行われる。
**どちらか一方だけ変えると通らない。**

## 分析スクリプト

`weekly.ts` `ga4-report.ts` `search-console.ts` `seo-snapshot.ts`
`seo-opportunities.ts` `monthly-report.ts` `ai-quality.ts` `ai-traffic.ts`

GA4 と Search Console を読む。`google-credentials.json` のサービスアカウントに
対象プロパティの閲覧権限が必要。権限が無いと該当項目だけ飛ばして動く。

## 商品データの取得・更新

DB に書き込むため、実行前にユーザーの確認を取る（CLAUDE.md）。

| スクリプト | 役割 |
| --- | --- |
| `fetch-amazon-kombu.ts` | Amazon から昆布商品を取得 |
| `add-product.ts` | ASIN を指定して1件追加 |
| `fetch-missing-images.ts` | 画像が無い商品の画像を補う |
| `match-rakuten.ts` | 既存商品に対応する楽天の商品を探してリンクを埋める |

`match-rakuten.ts` は既定では書き込まない。判定の根拠を `scripts/tmp/` に
JSON で残すので、内容を確認してから `--write` を付ける。

### 楽天の商品検索API

2026年5月に刷新されている。古い情報が多く出回っているので注意。

- エンドポイント: `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701`
  （旧 `app.rakuten.co.jp/services/api/...` は廃止済み）
- `applicationId`（UUID）と `accessKey`（`pk_` で始まる）の**両方**をクエリに付ける
- アプリ登録時の Application type は **API/Backend Service**。
  Allowed IP addresses に `0.0.0.0` を入れる。
  「Web Application」でドメイン指定にすると、ローカルから叩いたときに
  `CLIENT_IP_NOT_ALLOWED` で弾かれる

`wrong_parameter` が返るときは古いエンドポイントか accessKey 欠落、
`CLIENT_IP_NOT_ALLOWED` が返るときは Application type と IP 許可の設定を見る。

## アフィリエイトリンク

リンクの組み立ては [src/lib/affiliates.ts](src/lib/affiliates.ts) に集約する。
DB には素の商品URLを保存し、成果リンクへの変換はここだけで行う。
ASP を変えてもDBを書き換えずに済むようにしてある。

楽天は ASP 経由。次の**4つすべて**が揃っているときだけ ASP のクリック計測URLで
包む。1つでも欠けると素の楽天URL（無報酬）が出るだけで、エラーにはならない。

- `NEXT_PUBLIC_MOSHIMO_A_ID` — 落としやすい。ASP の管理画面が出すリンクの `a_id`
- `NEXT_PUBLIC_MOSHIMO_P_ID` — `p_id`
- `NEXT_PUBLIC_MOSHIMO_PC_ID` — `pc_id`
- `NEXT_PUBLIC_MOSHIMO_PL_ID` — `pl_id`（「どこでもリンク」のもの。バナーのとは別）

`NEXT_PUBLIC_` を付けているのはクライアント側でも値が必要なため。
Amplify の環境変数にも設定しないと本番に反映されない。

Amplify に環境変数を足すときは注意。`aws amplify update-app
--environment-variables` は**渡した内容でまるごと置き換える**ので、
既存の分も一緒に渡さないと消える（一度消して復元した）。先に
`aws amplify get-app --app-id <id> --query 'app.environmentVariables'` で
現状を取り、それに足した全量を渡す。コンソールから足すほうが安全。

`NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID` は楽天**直営**アフィリエイト用。
ASP 経由ではここに値を入れない。入れると直営形式の壊れたリンクになる。
