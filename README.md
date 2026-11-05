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
| `com.konbusuki.checks` | 毎日 7:00 | 定期点検（サイト品質・リンク・meta） |
| `com.konbusuki.content` | 毎日 1:00 / 3:00 / 5:00 | 夜間の記事作成（1起動で1本） |

時刻は `--hour 9`（点検）、`--night 1,4`（記事作成）で変えられる。

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

## 夜間の記事作成（自動）

`scripts/auto-content.ts` が `claude -p` を1回呼んで、記事を1本書かせる。
`docs/topic-map.md` と `docs/content-log.md` の「次にやる予定」を見て対象を決め、
ビルドが通ることを確認してから1コミットで push する。

記事が書けた回は、最後に `activity-report.ts` を呼んで Slack に報告する。
書けなかった回・打ち切られた回だけ、理由を `auto-content.ts` 側から流す
（`activity-report.ts` は「公開物の変更はなし」としか言えず、打ち切りが伝わらない）。
1回の作業で報告が2通にならないよう、どちらか一方だけが流れる。

```bash
npm run auto:content -- --dry        # 渡すプロンプトと引数を確認するだけ
npm run auto:content                 # 1回分を手で走らせる
npm run auto:content -- --minutes 60 # 打ち切り時間（既定45分）
```

**対話モードではなく `-p` を使う。** 対話モードは返事を返したところで一区切りに
なる作りで、夜通し走らせる用途に向かない（実際に途中で止まった）。1起動で1本に
区切り、launchd から何回か呼ぶ。会話が毎回まっさらになるので、文脈が膨らんで
判断が重くなることもない。

### 初回だけ：権限ファイルを作る

```bash
cp auto-settings.example.json auto-settings.json
```

`-p` では権限を都度聞けないため、許可していない操作は黙って拒否される。
許可・禁止はこのファイルに書く。`auto-settings.json` は gitignore 対象
（機種ごとに変えられるようにするため）。雛形では次を禁止している。

- DB書き込み系のスクリプトと `prisma`（CLAUDE.md の「DB書き込みは事前確認」を自動実行でも守る）
- `.env` と `google-credentials.json` の読み取り
- `git push --force` / `git reset --hard` / `rm`

### 止めたいとき

```bash
touch .stop   # 次の起動から何もしない
rm .stop      # 再開
```

### 動かないときに見るところ

- ログ: `~/Library/Logs/konbu-suki/com.konbusuki.content.{out,err}.log`
- 未コミットの変更が残っていると、AIの変更と混ざるため走らずに見送る
- launchd の PATH には Homebrew が入っていない。`claude` と `node` の場所は
  スクリプト側で解決して渡している（手では通るのに定時実行だけ落ちる形を避ける）
- Slack に出ない場合は `.env` の `SLACK_OPS_WEBHOOK_URL` が未設定

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
