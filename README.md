# konbu-suki（コンブスキー）

昆布専門のキュレーションサイト。産地別の特徴から種類別の比較までを扱う。
開発上のルールは [CLAUDE.md](CLAUDE.md)、判断の記録は [todo.md](todo.md) を参照。

## 技術

- Next.js + Tailwind CSS v4
- Prisma + PostgreSQL (AWS RDS) / アダプタは `@prisma/adapter-pg`
- デプロイ: AWS Amplify（GitHub連携で自動デプロイ、`amplify.yml`）

## 別のPCで立ち上げる

```bash
npm ci                  # 依存を入れる（npm install ではなく ci を使う）
npx prisma generate     # src/generated/prisma を作る（gitignore 対象）
npm run dev
```

`.env` は git に入っていない。[.env.example](.env.example) のキーを埋める。
`DATABASE_URL` が無いと商品を扱うページとスクリプトは動かない。

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

楽天は ASP 経由。`NEXT_PUBLIC_MOSHIMO_*` が4つ揃っているときだけ ASP の
クリック計測URLで包む。`NEXT_PUBLIC_` を付けているのはクライアント側でも
値が必要なため。Amplify の環境変数にも設定しないと本番に反映されない。
