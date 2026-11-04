/**
 * サイトマップ起点の全ページリンクチェック
 *
 * Usage: npx tsx scripts/check-links.ts
 *
 * 疎通確認と並列処理は lib/http.ts を使う。以前は全URLを逐次に投げたうえ、
 * 疎通確認とリンク抽出で同じページを2回取得していたため実用にならない速さ
 * だった。1回の取得で両方をこなし、全フェーズを並列で回す。
 *
 * HEAD を返さない経路もあるので、HEAD で怪しかったものだけ GET で確かめる。
 */
import "dotenv/config";
import { PUBLIC_SITE_URL } from "./lib/site";
import { batchCheckUrls, mapConcurrent, type UrlStatus } from "./lib/http";

const CONCURRENCY = 10;

const isBroken = (status: UrlStatus | undefined) =>
  typeof status !== "number" || status >= 400;

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(`${PUBLIC_SITE_URL}/sitemap.xml`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

type PageResult = {
  url: string;
  status: UrlStatus;
  internal: string[];
  external: string[];
};

/** ページを1回取得して、疎通とリンク抽出をまとめて済ませる。 */
async function fetchPage(url: string): Promise<PageResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, { redirect: "follow", signal: controller.signal });
    if (!res.ok) return { url, status: res.status, internal: [], external: [] };

    const html = await res.text();
    const internal = new Set<string>();
    const external = new Set<string>();

    for (const m of html.matchAll(/href="([^"]+)"/g)) {
      const href = m[1];
      if (
        href.startsWith("/_next/") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:")
      ) continue;
      if (/\.(css|js|woff2?|ico|png|jpe?g|webp|svg|xml)$/.test(href)) continue;

      if (href.startsWith("/")) internal.add(href);
      else if (href.startsWith("http")) external.add(href);
    }

    return { url, status: res.status, internal: [...internal], external: [...external] };
  } catch (e) {
    return {
      url,
      status: e instanceof Error && e.name === "AbortError" ? "timeout" : "error",
      internal: [],
      external: [],
    };
  } finally {
    clearTimeout(timer);
  }
}

/** HEAD で怪しかったものだけ GET で確かめ直す。 */
async function checkWithGetFallback(urls: string[], label: string) {
  const statuses = await batchCheckUrls(urls, { concurrency: CONCURRENCY, label });
  const suspects = urls.filter((u) => isBroken(statuses.get(u)));
  if (suspects.length > 0) {
    const retried = await batchCheckUrls(suspects, {
      concurrency: CONCURRENCY,
      method: "GET",
      label: `${label}(GETで再確認)`,
    });
    for (const [u, s] of retried) statuses.set(u, s);
  }
  return statuses;
}

async function main() {
  console.log(`\nリンクチェック — ${PUBLIC_SITE_URL}`);
  console.log("=".repeat(60));

  const sitemapUrls = await fetchSitemapUrls();
  console.log(`sitemap: ${sitemapUrls.length} URL\n`);

  // ── sitemap の全ページを1回ずつ取得（疎通 + リンク抽出）──
  const pages = await mapConcurrent(sitemapUrls, fetchPage, {
    concurrency: CONCURRENCY,
    label: "ページ",
  });

  const brokenPages = pages.filter((p) => isBroken(p.status));
  for (const p of brokenPages) console.log(`  [${p.status}] ${p.url}`);
  console.log(`sitemap: ${pages.length}件中 ${brokenPages.length}件が異常\n`);

  const internalPaths = [...new Set(pages.flatMap((p) => p.internal))];
  const externalUrls = [...new Set(pages.flatMap((p) => p.external))];
  console.log(`内部リンク ${internalPaths.length}種 / 外部リンク ${externalUrls.length}種\n`);

  // ── 内部リンク ──
  const internalStatuses = await checkWithGetFallback(
    internalPaths.map((p) => `${PUBLIC_SITE_URL}${p}`),
    "内部リンク"
  );
  const internalBroken = [...internalStatuses].filter(([, s]) => isBroken(s));
  for (const [url, status] of internalBroken) {
    console.log(`  [${status}] ${url.replace(PUBLIC_SITE_URL, "")}`);
  }
  console.log(`内部: ${internalPaths.length}件中 ${internalBroken.length}件が異常\n`);

  // ── 外部リンク ──
  const externalStatuses = await checkWithGetFallback(externalUrls, "外部リンク");
  const externalBroken = [...externalStatuses].filter(([, s]) => isBroken(s));
  for (const [url, status] of externalBroken) console.log(`  [${status}] ${url}`);
  console.log(`外部: ${externalUrls.length}件中 ${externalBroken.length}件が異常\n`);

  console.log("=".repeat(60));
  console.log(`sitemap ${brokenPages.length} / 内部 ${internalBroken.length} / 外部 ${externalBroken.length} が異常`);
  if (brokenPages.length + internalBroken.length + externalBroken.length === 0) {
    console.log("すべて正常");
  }
  console.log("");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
