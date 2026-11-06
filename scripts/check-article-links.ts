/**
 * 記事に書いた出典のリンクが生きているかを確かめる。
 *
 * Usage:
 *   npx tsx scripts/check-article-links.ts            # 直近のコミットで変わった記事
 *   npx tsx scripts/check-article-links.ts --all      # 全記事
 *   npx tsx scripts/check-article-links.ts --slug kobujime
 *
 * check-links.ts はサイトマップ起点で全ページ・全リンク（1000件超）を見るので
 * 数分かかる。こちらは記事の出典だけに絞るので、公開前に毎回回せる。
 *
 * 出典のリンクが切れていると、根拠を示したつもりで示せていない状態になる。
 * 実際に、URL の直後に全角括弧を置いたせいでリンクが404になっていたことがあり、
 * 全件検査を回すまで気付けなかった。
 */
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { GUIDES } from "../src/lib/guides";
import { collectReferences } from "../src/lib/guide-references";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const TIMEOUT_MS = 15000;
/** 同じ相手に続けて投げない。 */
const INTERVAL_MS = 400;

const args = process.argv.slice(2);
const all = args.includes("--all");
const onlySlug = (() => {
  const i = args.indexOf("--slug");
  return i === -1 ? null : args[i + 1] || null;
})();

/**
 * 直近のコミットで変わった記事を拾う。
 *
 * 差分に slug の文字列が出るかで判定すると、本文だけ直したときに拾えない
 * （slug の行は変わらないため）。変わった行番号を取り、その行がどの記事の
 * 範囲に入るかで判定する。
 */
function changedSlugs(): string[] {
  try {
    const file = readFileSync(path.join(PROJECT_ROOT, "src/lib/guides.ts"), "utf8");
    const lines = file.split("\n");

    // 記事ごとの開始行（1始まり）
    const starts: { slug: string; line: number }[] = [];
    lines.forEach((l, i) => {
      const m = l.match(/^  "([a-z0-9-]+)": \{/);
      if (m && Object.prototype.hasOwnProperty.call(GUIDES, m[1])) {
        starts.push({ slug: m[1], line: i + 1 });
      }
    });
    if (starts.length === 0) return [];

    const diff = execFileSync(
      "/usr/bin/git",
      ["diff", "-U0", "HEAD~1", "HEAD", "--", "src/lib/guides.ts"],
      { cwd: PROJECT_ROOT, encoding: "utf8" }
    );
    const changed = new Set<string>();
    for (const m of diff.matchAll(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm)) {
      const from = Number(m[1]);
      const count = m[2] === undefined ? 1 : Number(m[2]);
      for (let line = from; line < from + Math.max(count, 1); line++) {
        // その行を含む記事＝開始行が行番号以下で最も近いもの
        let found: string | null = null;
        for (const s of starts) {
          if (s.line <= line) found = s.slug;
          else break;
        }
        if (found) changed.add(found);
      }
    }
    return [...changed];
  } catch {
    return [];
  }
}

async function head(url: string): Promise<{ status: number; location?: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // 先に HEAD。許さない相手がいるので、405/501 は GET で確かめ直す。
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "manual",
      signal: ctrl.signal,
      headers: { "User-Agent": "konbu-suki link check (+https://konbu-suki.com)" },
    });
    if (res.status === 405 || res.status === 501 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        signal: ctrl.signal,
        headers: { "User-Agent": "konbu-suki link check (+https://konbu-suki.com)" },
      });
    }
    return { status: res.status, location: res.headers.get("location") ?? undefined };
  } catch (e) {
    return { status: 0, location: e instanceof Error ? e.message.slice(0, 60) : undefined };
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const slugs = onlySlug
    ? [onlySlug]
    : all
      ? Object.keys(GUIDES)
      : changedSlugs();

  if (slugs.length === 0) {
    console.log("直近のコミットで変わった記事は無い。");
    console.log("SUMMARY: 記事 0 / リンク 0 / 切れ 0");
    return;
  }

  // 同じ出典を複数の記事が使う。URLごとにまとめて1回だけ叩く。
  const byUrl = new Map<string, string[]>();
  for (const slug of slugs) {
    const g = GUIDES[slug as keyof typeof GUIDES];
    if (!g) continue;
    for (const ref of collectReferences(g.sections)) {
      if (!ref.url) continue;
      byUrl.set(ref.url, [...(byUrl.get(ref.url) ?? []), slug]);
    }
  }

  console.log(`\n出典リンクの確認: 記事${slugs.length}本 / URL${byUrl.size}件\n`);

  const broken: string[] = [];
  const moved: string[] = [];
  let i = 0;
  for (const [url, used] of byUrl) {
    const { status, location } = await head(url);
    i++;
    const where = used.join(", ");
    if (status === 404 || status === 410) {
      console.log(`  [${status}] ${url}  ← ${where}`);
      broken.push(`${status} ${url}（${where}）`);
    } else if (status >= 300 && status < 400 && location) {
      console.log(`  [${status}] ${url}\n        → ${location}  ← ${where}`);
      moved.push(`${status} ${url} → ${location}（${where}）`);
    } else if (status === 0) {
      console.log(`  [確認できず] ${url}  ${location ?? ""}  ← ${where}`);
    }
    if (i < byUrl.size) await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  if (broken.length === 0 && moved.length === 0) console.log("  切れているリンクは無い。\n");
  console.log(`SUMMARY: 記事 ${slugs.length} / リンク ${byUrl.size} / 切れ ${broken.length} / 移転 ${moved.length}`);
  process.exit(broken.length > 0 ? 1 : 0);
}

main();
