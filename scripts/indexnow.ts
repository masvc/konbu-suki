/**
 * 公開・更新したページを IndexNow で通知する。
 *
 * Usage:
 *   npx tsx scripts/indexnow.ts                 # 直近のコミットで変わった記事
 *   npx tsx scripts/indexnow.ts --all           # 全ページ
 *   npx tsx scripts/indexnow.ts --url /guide/x  # 個別に指定
 *   npx tsx scripts/indexnow.ts --dry           # 送らずに対象だけ出す
 *
 * サイトマップは出しているが、取りに来るのを待つ形になる。IndexNow は
 * こちらから知らせるので、公開直後に拾われやすくなる。
 *
 * 所有確認は public/<キー>.txt が同じ値を返すかで行われる。キーは
 * src/lib/indexnow.ts にある（公開してよい値）。
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { GUIDES } from "../src/lib/guides";
import { INDEXNOW_KEY } from "../src/lib/indexnow";
import { PUBLIC_SITE_URL, PUBLIC_SITE_HOST } from "./lib/site";
import { CATEGORY_SLUGS, ORIGINS } from "../src/lib/constants";
import { createPrisma } from "./lib/db";

const ENDPOINT = "https://api.indexnow.org/indexnow";
const PROJECT_ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const all = args.includes("--all");
const urlArg = (() => {
  const i = args.indexOf("--url");
  return i === -1 ? null : args[i + 1] || null;
})();

/** 直近のコミットで guides.ts が変わっていたら、変わった記事を拾う。 */
function changedGuideSlugs(): string[] {
  try {
    const diff = execFileSync("/usr/bin/git", ["diff", "HEAD~1", "HEAD", "--", "src/lib/guides.ts"], {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
    });
    const slugs = new Set<string>();
    for (const m of diff.matchAll(/^\+\s*"([a-z0-9-]+)":\s*\{/gm)) slugs.add(m[1]);
    // 既存記事の編集は slug 行が出ないので、変更行の近くから拾う
    for (const slug of Object.keys(GUIDES)) {
      if (diff.includes(`"${slug}"`)) slugs.add(slug);
    }
    return [...slugs];
  } catch {
    return [];
  }
}

async function main() {
  let paths: string[];
  if (urlArg) {
    paths = [urlArg];
  } else if (all) {
    // sitemap と同じ範囲: 静的 + カテゴリ + 産地 + ガイド + 商品
    const staticPaths = ["/", "/guide", "/producers", "/kombu-box", "/about", "/about/editorial-policy", "/about/data"];
    const categoryPaths = CATEGORY_SLUGS.map((s: string) => `/category/${s}`);
    const originPaths = Object.keys(ORIGINS).map((s) => `/origin/${s}`);
    const guidePaths = Object.keys(GUIDES).map((s) => `/guide/${s}`);
    let productPaths: string[] = [];
    try {
      const prisma = createPrisma();
      const products = await prisma.product.findMany({ select: { id: true } });
      productPaths = products.map((p: { id: number }) => `/product/${p.id}`);
      await prisma.$disconnect();
    } catch { /* DB接続できない場合は商品ページをスキップ */ }
    paths = [...staticPaths, ...categoryPaths, ...originPaths, ...guidePaths, ...productPaths];
  } else {
    const slugs = changedGuideSlugs();
    paths = slugs.map((s) => `/guide/${s}`);
    if (paths.length > 0) paths.push("/guide", "/");
  }

  if (paths.length === 0) {
    console.log("通知する対象が無い（直近のコミットで記事は変わっていない）。");
    return;
  }

  const urlList = paths.map((p) => `${PUBLIC_SITE_URL}${p}`);
  console.log(`\nIndexNow に通知: ${urlList.length}件`);
  for (const u of urlList) console.log(`  ${u}`);

  if (dry) {
    console.log("\n--dry のため送らない。");
    return;
  }

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: PUBLIC_SITE_HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${PUBLIC_SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });

  // 200 と 202 がどちらも受理。202 は「受け取ったがキーの確認はこれから」。
  if (res.status === 200 || res.status === 202) {
    console.log(`\n受理された (HTTP ${res.status})`);
  } else {
    console.log(`\n受理されなかった (HTTP ${res.status}): ${await res.text().catch(() => "")}`);
    process.exitCode = 1;
  }
  console.log(`SUMMARY: 通知 ${urlList.length}件 / HTTP ${res.status}`);
}

main();
