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

plist は実行環境から生成する。node のパスやプロジェクトの位置が機種ごとに
違うため、固定ファイルをリポジトリに置くと別のPCで動かない。
ログは `~/Library/Logs/konbu-suki/`。

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

`NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID` は楽天**直営**アフィリエイト用。
ASP 経由ではここに値を入れない。入れると直営形式の壊れたリンクになる。
