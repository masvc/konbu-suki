# konbu-suki TODO

## ブロック中（外部待ち）
- [ ] ドメイン取得（ラッコ メンテ明け）
  - Vercel にドメイン追加 → Primary に設定（vercel.appから自動リダイレクト）
  - `NEXT_PUBLIC_SITE_URL` をドメインに変更 → 再デプロイ
  - Search Console にドメイン登録 → `/sitemap.xml` 送信 → トップだけ「インデックス登録をリクエスト」
  - `NEXT_PUBLIC_GOOGLE_VERIFICATION` 設定
  - ※ vercel.app でインデックスが進むとドメイン移行時に評価が分散するので、ドメイン取得後にまとめてやる
- [ ] GA4 プロパティ作成 → `NEXT_PUBLIC_GA_ID` 設定（ドメイン確定後が望ましい）
- [ ] 楽天：当面はリンクのクリック計測のみ（ID未設定）。もしもはドメイン取得後にサイト追加
- [ ] 本番の購入リンクに tag=konbu-suki-22 が付いているか確認

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
- [ ] /api/track 計測 + /ranking（GA4・Vercel Analyticsで代用中）
- [ ] Vercel Cron で価格日次更新 → JSON-LD offers 復活
- [ ] /shindan 昆布診断
- [ ] 口コミ投稿機能（PV増加後に検討。当面は運営者レビュー + X埋め込みで代用）
- [ ] 注文CSV取り込み（アソシエイトレポート）
- [ ] 色を @theme へ移行
- [ ] 旧品 #315 の販売状況確認（販売終了なら #149 へ301リダイレクト）

## 環境変数（Vercel に設定済み）
- `DATABASE_URL` - Neon接続URL
- `AMAZON_PARTNER_TAG` - konbu-suki-22
- `NEXT_PUBLIC_AMAZON_TAG` - konbu-suki-22
- `SLACK_WEBHOOK_URL` - Slack通知用（golfと共用）

## 環境変数（未設定・後で入れる）
- `NEXT_PUBLIC_SITE_URL` - 独自ドメイン取得後
- `NEXT_PUBLIC_GA_ID` - GA4プロパティ作成後
- `NEXT_PUBLIC_GOOGLE_VERIFICATION` - Search Console認証後
- `NEXT_PUBLIC_RAKUTEN_AFFILIATE_ID` - もしもサイト追加後

## 技術スタック
- Next.js 16 + Tailwind CSS v4 + Prisma 7 + Neon (PostgreSQL)
- デプロイ: Vercel（GitHub masvc/konbu-suki 連携、push時自動デプロイ）
- 画像: Amazon Creators API + Gemini生成 + sharp最適化
- ルール: CLAUDE.md 参照

## 完了済み
- [x] Next.js + Prisma + Neon + Tailwind プロジェクト作成
- [x] Amazon Creators APIで商品315件取得（画像カバー99.7%）
- [x] Vercelデプロイ（GitHub連携自動デプロイ）
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
