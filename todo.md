# konbu-suki TODO

## ブロック中（外部待ち）
- [ ] ドメイン取得（ラッコ メンテ明け）→ Vercel に追加 → NEXT_PUBLIC_SITE_URL 設定
- [ ] Search Console 登録（ドメイン後）→ NEXT_PUBLIC_GOOGLE_VERIFICATION 設定
- [ ] GA4 プロパティ作成 → NEXT_PUBLIC_GA_ID 設定
- [ ] 楽天アフィ：つなぎで楽天直のIDを設定 → ドメイン後にもしもへサイト追加
- [ ] 本番の購入リンクに tag=konbu-suki-22 が付いているか確認
- [ ] Vercel の Production が最新コミットを指しているか確認（ロゴ反映問題）

## 自分でやる
- [ ] ガイド8本（特に栄養記事）を一読
- [ ] 運営者リピート品のコメントを書く（小倉屋山本 梅入り塩ふき昆布 など）
- [ ] ラッコキーワード前半（1〜500件）を docs/keywords に追加
- [ ] （任意）ラッコキーワード有料で検索ボリューム取得
- [ ] （任意）Neon / Amazon Creators の認証情報ローテーション

## 開発（Claude Code）
- [ ] docs/content-plan.md 記事構成案 → レビュー後に本文
- [ ] メーカー・老舗ランキング記事
- [ ] 産地コラム（名産の理由）を /origin/[slug] に
- [ ] /tag/[slug] 食感・味タグ一覧（タグはDB保存）
- [ ] /api/track 計測 + /ranking
- [ ] Vercel Cron で価格日次更新 → JSON-LD offers 復活
- [ ] /about/author 運営者ページ + リピート品フラグ
- [ ] llms.txt
- [ ] 商品ごとの動的OGP
- [ ] こんぶBOX 事前登録フォーム
- [ ] 生産者掲載募集フォーム
- [ ] /shindan 昆布診断
- [ ] 共通化の残り：トップ・商品・カテゴリにも Breadcrumb/FaqAccordion/JsonLd 適用、色を @theme へ
- [ ] sitemap に guide・origin・tag・ranking 追加

## 完了済み
- [x] Next.js + Prisma + Neon + Tailwind プロジェクト作成
- [x] Amazon Creators APIで商品315件取得（画像カバー99.7%）
- [x] Vercelデプロイ（GitHub連携自動デプロイ）
- [x] サイト名「コンブスキー」+ ゆらゆらロゴ
- [x] カテゴリ/産地/検索/商品ページ
- [x] ガイド記事8本 + Geminiアイキャッチ画像
- [x] 共通コンポーネント（Breadcrumb, FaqAccordion, JsonLd, CategoryIcon 等）
- [x] SEO基盤（robots.txt, sitemap, OGP, 構造化データ）
- [x] 食感・味わいタグ自動生成
- [x] GA4クリック計測イベント
- [x] ハンバーガーメニュー
- [x] Amazon トラッキングID konbu-suki-22 に統一
- [x] フォーチュンボックス / スナックミー D2Cリサーチ
- [x] CLAUDE.md ルール整備
- [x] 画像最適化（sharp）
- [x] コンテンツ計画（content-plan.md）
