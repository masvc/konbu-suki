# 保留（2026-11-20 夜・改善枠 / 実行 2026-11-21）

## rausu-kombu の FAQ「だし以外にどう食べますか」 — コミット済み（0b34a00）・push していない

- なぜ保留: `npm run build` が最後に `SecurityFatalError`（next 16.4.3 の脆弱性の警告）で exit 1。
  コンパイル・型・静的生成は通っている。記事の変更とは関係ない（11-19 夜の held.md と同じ）
- meta-check は要修正0。出典3本は開き直して原文を確認済み
- **人にお願いしたいこと:** Next.js をパッチ版に上げるか判断する。ビルドが通れば、このコミットをそのまま push してよい
- push 後にやること: `npm run links`、`npx tsx scripts/indexnow.ts`
- 同じ症状で 1本目（kobujime-iwashi-katsuo の Recipe・f88fe2a）は見落として push してしまった（improve-log.md の注）

- 追記（点検枠）: 点検枠の開始時点で 0b34a00 は origin/main に入っていた（push 済み）。本番のサイトマップでも rausu-kombu の lastmod は 2026-11-21

## 2026-11-21 05:00:03 点検と内部リンク の開始前

未コミットの変更が残っていたので stash に退避した（`git stash list` で確認できる）。
退避名: night-2026-11-20-maintain の前に退避

```
M docs/night/2026-11-20/held.md
```
