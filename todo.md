# konbu-suki TODO

## ブロック中（外部待ち）
- [ ] **楽天のアプリID発行** → `RAKUTEN_APP_ID` を .env に設定
  - https://webservice.rakuten.co.jp/ で無料・即時発行（審査なし）
  - これが無いと `scripts/match-rakuten.ts` が動かず、315件の楽天リンクが埋まらない
  - スクリプト専用。Amplify 側には不要
- [ ] **GA4 / Search Console の権限付与**
  - `google-credentials.json` のサービスアカウント（`client_email`）に付与する
  - GA4 プロパティ `562364481` の閲覧権限
  - Search Console `sc-domain:konbu-suki.com` のユーザー追加
  - 現状どちらも「権限なし」で弾かれる。コードは正しく動いている
  - 付与後に動くもの: weekly / ga4-report / search-console / seo-snapshot /
    seo-opportunities / monthly-report / ai-quality / ai-traffic
- [ ] **もしものIDを Amplify に設定**（ローカルだけでは本番に反映されない）
  - `NEXT_PUBLIC_MOSHIMO_A_ID` / `_P_ID` / `_PC_ID` / `_PL_ID` の4つ
  - 4つ揃っていないと ASP 経由にならず、素の楽天URL（無報酬）が出る

## 自分でやる
- [ ] ガイド8本（特に栄養記事）を一読
- [ ] 運営者リピート品のコメントを書く（小倉屋山本 梅入り塩ふき昆布 #149 など）
- [ ] ラッコキーワード前半（1〜500件）を docs/keywords に追加
- [ ] content-plan.md レビュー → OK出し（記事執筆のブロッカー）

## 開発（Claude Code）- レビュー待ち
- [ ] content-plan.md の記事構成案 → レビュー後に本文執筆
  - Priority 1: メーカー・老舗ランキング記事（アフィ本命）
  - Priority 2: 保存方法 / 利尻日高羅臼の違い / どこに売ってる
  - Priority 3: だしがら活用 / 昆布水 / わかめとの違い
- [ ] /about/author 運営者ページ + リピート品表示（コメントはユーザーが書く）

## 開発（Claude Code）- すぐ着手可
- [ ] 産地コラムの出典をさらに強化（北海道ぎょれん以外の公的出典を追加）

## 将来（シンプル優先で後回し）
- [ ] /tag/[slug] 食感・味タグ一覧ページ
- [ ] /api/track 計測 + /ranking（GA4 で代用中）
- [ ] 価格の日次更新 → JSON-LD offers 復活（launchd か Amplify 側の定期実行で）
- [ ] /shindan 昆布診断
- [ ] 口コミ投稿機能（PV増加後に検討。当面は運営者レビュー + X埋め込みで代用）
- [ ] 注文CSV取り込み（アソシエイトレポート）
- [ ] 色を @theme へ移行
- [ ] 旧品 #315 の販売状況確認（販売終了なら #149 へ301リダイレクト）

## 環境変数

キー名の一覧は [.env.example](.env.example)。`.env` は git 管理外なので、
別のPCでは手でコピーする（`google-credentials.json` も同様）。

### Amplify（本番）に設定済み
`DATABASE_URL` / `NEXT_PUBLIC_AMAZON_TAG` / `AMAZON_PARTNER_TAG` /
`AMAZON_CREATORS_CLIENT_ID` / `AMAZON_CREATORS_CLIENT_SECRET` /
`AMAZON_CREATORS_VERSION` / `GEMINI_API_KEY` / `NEXT_PUBLIC_GA_ID` /
`SLACK_WEBHOOK_URL`

### Amplify に未設定（要対応）
- `NEXT_PUBLIC_MOSHIMO_A_ID` / `_P_ID` / `_PC_ID` / `_PL_ID` — 楽天の成果計測
- `NEXT_PUBLIC_SITE_URL` — 未設定でも `lib/constants.ts` の既定値
  （`https://konbu-suki.com`）が使われるので表示は正しい。明示すると安全

### ローカルのみで使うもの（Amplify には不要）
- `RAKUTEN_APP_ID` — 商品照合スクリプト用
- `SLACK_OPS_WEBHOOK_URL` — 定期点検の通知先。お問い合わせ用の
  `SLACK_WEBHOOK_URL` とは分ける（同じにすると本番で問い合わせが
  点検チャンネルに流れる）
- `GOOGLE_APPLICATION_CREDENTIALS` — 相対パス指定なのでPC間で問題なし

### 使っていないもの
- `NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID` — 楽天**直営**アフィリエイト用。
  もしも経由なのでここには入れない。入れると直営形式の壊れたリンクになる
- `NEXT_PUBLIC_GOOGLE_VERIFICATION` — Route 53 の TXT レコードで認証済みのため不要

## 技術スタック / インフラ
- Next.js 16 + Tailwind CSS v4 + Prisma 7 + PostgreSQL
- デプロイ: AWS Amplify（GitHub masvc/konbu-suki 連携、push時自動デプロイ）
  - App ID `d36m7ufdpelzgy` / ブランチ `main` / `amplify.yml`
- DB: AWS RDS `konbu-suki-db`（PostgreSQL, db.t4g.micro, 20GB, Multi-AZ なし）
- DNS: Route 53 ホストゾーン `konbu-suki.com`（apex と www を CloudFront へ）
- AWS CLI: アカウント `903036621317` / IAM `masato-cli` / `ap-northeast-1`
- 画像: Amazon Creators API + Gemini生成 + sharp最適化
- ビルドは webpack 固定（Turbopack は lightningcss の動的 require で失敗する）
- ルール: CLAUDE.md 参照 / 立ち上げ手順: README.md 参照

### 既知の小さな引っかかり
- Amplify のドメイン関連付けで apex（`konbu-suki.com`）の `verified` が false。
  Route 53 の A(Alias) は CloudFront を正しく指しており配信はできている。
  コンソール上の検証ステータスだけ未完了で、実害は確認されていない

## 完了済み
- [x] 独自ドメイン取得・公開（konbu-suki.com、sitemap 344URL）
- [x] GA4 プロパティ作成・導入（G-W0GQH84L2G、本番で計測中）
- [x] Search Console 認証（Route 53 の TXT）
- [x] AWS 移行（Vercel/Neon → Amplify/RDS）
- [x] 本番の購入リンクに tag=konbu-suki-22 が付いていることを実機確認
- [x] 楽天アフィリエイト開通（もしも経由）とリンク生成の実装
- [x] scripts/ の総点検（型エラー117件→0、別プロジェクト由来の残骸を整理）
- [x] 定期点検の仕組み（site-check / check-links / meta-check + Slack通知 + launchd）
- [x] Next.js + Prisma + Tailwind プロジェクト作成
- [x] Amazon Creators APIで商品315件取得（画像カバー99.7%）
- [x] 初期デプロイ（当時は Vercel。のち AWS Amplify に移行）
- [x] サイト名「コンブスキー」+ ゆらゆらロゴ
- [x] カテゴリ/産地/検索/商品ページ
- [x] ガイド記事8本 + Geminiアイキャッチ画像
- [x] 共通コンポーネント（Breadcrumb, FaqAccordion, JsonLd, CategoryIcon 等）
- [x] SEO基盤（robots.txt, sitemap, OGP, 構造化データ, llms.txt）
- [x] 食感・味わいタグ自動生成
- [x] GA4クリック計測イベント
- [x] ハンバーガーメニュー（ESC/外側クリックで閉じる）
- [x] Amazon トラッキングID konbu-suki-22 に統一（DB 314件更新済み）
- [x] フォーチュンボックス / スナックミー D2Cリサーチ（docs/）
- [x] CLAUDE.md ルール整備（シンプル優先/健康系/絵文字禁止/出典必須）
- [x] 画像最適化（sharp、全画像200KB以下）
- [x] コンテンツ計画（docs/content-plan.md）
- [x] 産地コラム（なぜ名産か、出典URL確認済み）
- [x] aboutページ コンセプト反映（出会う・知る・応援する）
- [x] 商品ごとの動的OGP（テキストのみ、Noto Sans JPサブセット）
- [x] DB migrate（priceFetchedAt/listPrice/isOwnerPick/ownerComment）
- [x] こんぶBOX事前登録フォーム（Subscriber + Slack通知 + ハニーポット）
- [x] 生産者掲載募集フォーム（Slack通知のみ + ハニーポット）
- [x] ファビコン（昆布アイコン、32/180/256px）
- [x] ヒーロー画像トリミング + scale-110 + SVG波模様
- [x] リニューアル版導線（#315 → #149 直書き）
- [x] 価格に取得日時表示（priceFetchedAt, Asia/Tokyo）
