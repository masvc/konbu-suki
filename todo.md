# konbu-suki TODO

## ブロック中（外部待ち）
- [ ] ドメイン取得（ラッコ メンテ明け）→ Vercel に追加 → NEXT_PUBLIC_SITE_URL 設定
- [ ] Search Console 登録（ドメイン後）→ NEXT_PUBLIC_GOOGLE_VERIFICATION 設定
- [ ] GA4 プロパティ作成 → NEXT_PUBLIC_GA_ID 設定
- [ ] 楽天：当面はリンクのクリック計測のみ（ID未設定）。もしもはドメイン取得後にサイト追加
- [ ] 本番の購入リンクに tag=konbu-suki-22 が付いているか確認

## 自分でやる
- [ ] ガイド8本（特に栄養記事）を一読
- [ ] 運営者リピート品のコメントを書く（小倉屋山本 梅入り塩ふき昆布 など）
- [ ] ラッコキーワード前半（1〜500件）を docs/keywords に追加
- [ ] content-plan.md レビュー → OK出し

## 開発（Claude Code）
- [ ] docs/content-plan.md 記事構成案 → レビュー後に本文
- [ ] メーカー・老舗ランキング記事
- [ ] /about/author 運営者ページ + リピート品表示
- [ ] 産地コラムの出典確認・表現修正

## 将来（シンプル優先で後回し）
- [ ] /tag/[slug] 食感・味タグ一覧ページ
- [ ] /api/track 計測 + /ranking（GA4・Vercel Analyticsで代用中）
- [ ] Vercel Cron で価格日次更新
- [ ] /shindan 昆布診断
- [ ] 口コミ投稿機能（PV増加後に検討）
- [ ] 注文CSV取り込み
- [ ] 色を @theme へ移行

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
- [x] ハンバーガーメニュー
- [x] Amazon トラッキングID konbu-suki-22 に統一
- [x] フォーチュンボックス / スナックミー D2Cリサーチ
- [x] CLAUDE.md ルール整備
- [x] 画像最適化（sharp）
- [x] コンテンツ計画（content-plan.md）
- [x] 産地コラム（なぜ名産か）
- [x] aboutページ コンセプト反映（3つの柱・紹介基準）
- [x] 商品ごとの動的OGP
- [x] DB migrate（priceFetchedAt/listPrice/isOwnerPick/ownerComment）
- [x] こんぶBOX事前登録フォーム（Subscriber + Slack通知）
- [x] ファビコン設定
