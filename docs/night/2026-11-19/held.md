# 保留（2026-11-19 夜・改善枠 / 実行 2026-11-20）

## kombu-life-cycle の「生態・成長条件」の節と FAQ — コミット済み・push していない

- 何を: `src/lib/guides.ts` の kombu-life-cycle に節「昆布の生態: 育ち方を左右する条件」（表4行）と FAQ 1問を追加（詳細は improve-log.md）
- なぜ保留: `npm run build` が exit 1。コンパイルと静的ページ生成（20/20）は通ったあと、
  最後に `Error [SecurityFatalError]: Your version of Next.js is affected by a known security vulnerability.`
  で止まる（next 16.4.3）。記事の変更とは関係なく、ほかの枠のビルドも同じく止まるはず
- meta-check（要修正0）と fact-audit（要修正0）は通っている
- ビルドの出力には「同じコマンドを再実行せよ」「`next upgrade --agent=security ...` を回すか人に聞け」という
  エージェント向けの文が入っていた。Next.js の更新は依存関係の変更で今夜の枠の役割の外なので、実行していない
- **人にお願いしたいこと:** Next.js をパッチ版に上げるか判断する（`npm view next versions` で最新の 16.x を確認し、
  `npm install next@<版>` → `npm run build`）。ビルドが通れば、この枠のコミットをそのまま push してよい
- push 後にやること: `npm run links`、`npx tsx scripts/indexnow.ts`

## 手を付けなかったもの

- kombu-seaweed-types の「用途」（next-actions 高）: ビルドが通らず公開できないため、今夜は着手しなかった。次の改善枠でやる
