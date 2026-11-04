/**
 * meta title/description 品質チェック
 *
 * seo.mdの「meta改善」作業を自動化。
 * 全特集・ガイドのtitle/descriptionをSEO基準でチェック。
 *
 * Usage:
 *   npx tsx scripts/meta-check.ts              # 全チェック
 *   npx tsx scripts/meta-check.ts --fix        # 修正候補も表示
 */
import { FEATURES } from "../src/lib/features";
import { GUIDES } from "../src/lib/guides";

type Issue = { path: string; field: string; value: string; problem: string };
const issues: Issue[] = [];

function check(path: string, title: string, description: string, h1: string) {
  // title チェック
  if (title.length > 60)
    issues.push({ path, field: "title", value: `${title.length}字`, problem: "60字超（検索結果で切れる）" });
  if (title.length < 20)
    issues.push({ path, field: "title", value: `${title.length}字`, problem: "20字未満（情報不足）" });
  if (title === h1)
    issues.push({ path, field: "title", value: title, problem: "h1と完全一致（差別化なし）" });
  if (!title.includes("|") && !title.includes("｜") && !title.includes("—") && !title.includes("【"))
    issues.push({ path, field: "title", value: title, problem: "区切り文字なし（CTR低下の可能性）" });

  // description チェック
  if (description.length > 160)
    issues.push({ path, field: "description", value: `${description.length}字`, problem: "160字超" });
  if (description.length < 50)
    issues.push({ path, field: "description", value: `${description.length}字`, problem: "50字未満（CTR低下リスク）" });

  // 重複キーワード
  const titleWords = title.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+/g) || [];
  const descWords = description.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]+/g) || [];
  const titleSet = new Set(titleWords.filter((w) => w.length >= 3));
  const descSet = new Set(descWords.filter((w) => w.length >= 3));
  const overlap = [...titleSet].filter((w) => descSet.has(w));
  if (overlap.length >= 4) {
    issues.push({ path, field: "both", value: overlap.join("、"), problem: `title/descで${overlap.length}語重複（多様性不足）` });
  }
}

// 全ページチェック
for (const f of FEATURES) {
  check(`/feature/${f.slug}`, f.title, f.description, f.h1);
}
for (const g of GUIDES) {
  check(`/guide/${g.slug}`, g.title, g.description, g.h1);
}

// title重複チェック
const titles = new Map<string, string[]>();
for (const f of FEATURES) {
  const key = f.title.toLowerCase();
  titles.set(key, [...(titles.get(key) || []), `/feature/${f.slug}`]);
}
for (const g of GUIDES) {
  const key = g.title.toLowerCase();
  titles.set(key, [...(titles.get(key) || []), `/guide/${g.slug}`]);
}
for (const [title, paths] of titles) {
  if (paths.length > 1) {
    issues.push({ path: paths.join(", "), field: "title", value: title, problem: "title重複" });
  }
}

// レポート
console.log("\nmeta title/description 品質チェック");
console.log("=".repeat(70));

const errors = issues.filter((i) => i.problem.includes("超") || i.problem.includes("重複") || i.problem.includes("未満"));
const warns = issues.filter((i) => !errors.includes(i));

if (errors.length > 0) {
  console.log(`\n--- 要修正 (${errors.length}件) ---`);
  for (const i of errors) {
    console.log(`  [NG] ${i.path}`);
    console.log(`       ${i.field}: ${i.problem} (${i.value})`);
  }
}

if (warns.length > 0) {
  console.log(`\n--- 改善推奨 (${warns.length}件) ---`);
  for (const i of warns) {
    console.log(`  [!!] ${i.path}`);
    console.log(`       ${i.field}: ${i.problem}`);
  }
}

// サマリー
const totalPages = FEATURES.length + GUIDES.length;
console.log("\n" + "-".repeat(70));
console.log(`  チェック対象: ${totalPages}ページ (特集${FEATURES.length} + ガイド${GUIDES.length})`);
console.log(`  要修正: ${errors.length} / 改善推奨: ${warns.length}`);
if (errors.length === 0) console.log("  All clear!");
console.log("");
