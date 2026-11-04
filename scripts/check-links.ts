/**
 * サイトマップ起点の全ページリンクチェック
 * Usage: npx tsx scripts/check-links.ts
 */

const SITE_URL = "https://konbu-suki.com";

async function fetchSitemapUrls(): Promise<string[]> {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return urls;
}

async function extractLinks(url: string): Promise<{ internal: string[]; external: string[] }> {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) return { internal: [], external: [] };
    const html = await res.text();
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);

    const internal: string[] = [];
    const external: string[] = [];

    for (const href of hrefs) {
      if (href.startsWith("/_next/") || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
      if (href.endsWith(".css") || href.endsWith(".js") || href.endsWith(".woff2") || href.endsWith(".ico") || href.endsWith(".png")) continue;

      if (href.startsWith("/")) {
        internal.push(href);
      } else if (href.startsWith("http")) {
        external.push(href);
      }
    }

    return { internal: [...new Set(internal)], external: [...new Set(external)] };
  } catch {
    return { internal: [], external: [] };
  }
}

async function checkUrl(url: string, method: "GET" | "HEAD" = "GET"): Promise<{ url: string; status: number | string }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(url, { method, redirect: "follow", signal: controller.signal });
    clearTimeout(timeout);
    return { url, status: res.status };
  } catch (e) {
    return { url, status: e instanceof Error ? e.message : "error" };
  }
}

async function main() {
  console.log("Fetching sitemap...");
  const sitemapUrls = await fetchSitemapUrls();
  console.log(`Found ${sitemapUrls.length} URLs in sitemap\n`);

  // Check all sitemap URLs
  console.log("=== Checking sitemap URLs ===");
  const sitemapResults: { url: string; status: number | string }[] = [];
  for (const url of sitemapUrls) {
    const result = await checkUrl(url);
    sitemapResults.push(result);
    if (result.status !== 200) {
      console.log(`  [${result.status}] ${url}`);
    }
  }
  const sitemapBroken = sitemapResults.filter((r) => r.status !== 200);
  console.log(`Sitemap: ${sitemapResults.length} checked, ${sitemapBroken.length} broken\n`);

  // Crawl all pages for internal + external links
  console.log("=== Crawling pages for links ===");
  const allInternalLinks = new Set<string>();
  const allExternalLinks = new Set<string>();

  for (const url of sitemapUrls) {
    const { internal, external } = await extractLinks(url);
    internal.forEach((l) => allInternalLinks.add(l));
    external.forEach((l) => allExternalLinks.add(l));
  }

  console.log(`Found ${allInternalLinks.size} unique internal links, ${allExternalLinks.size} unique external links\n`);

  // Check internal links
  console.log("=== Checking internal links ===");
  const internalBroken: { url: string; status: number | string }[] = [];
  for (const path of allInternalLinks) {
    const result = await checkUrl(`${SITE_URL}${path}`);
    if (result.status !== 200) {
      internalBroken.push(result);
      console.log(`  [${result.status}] ${path}`);
    }
  }
  console.log(`Internal: ${allInternalLinks.size} checked, ${internalBroken.length} broken\n`);

  // Check external links (HEAD first, fallback to GET)
  console.log("=== Checking external links ===");
  const externalBroken: { url: string; status: number | string }[] = [];
  for (const url of allExternalLinks) {
    let result = await checkUrl(url, "HEAD");
    if (typeof result.status === "number" && result.status >= 400) {
      result = await checkUrl(url, "GET");
    }
    if (typeof result.status === "number" && result.status >= 400) {
      externalBroken.push(result);
      console.log(`  [${result.status}] ${url}`);
    } else if (typeof result.status === "string") {
      externalBroken.push(result);
      console.log(`  [${result.status}] ${url}`);
    }
  }
  console.log(`External: ${allExternalLinks.size} checked, ${externalBroken.length} broken\n`);

  // Summary
  console.log("=== Summary ===");
  console.log(`Sitemap pages: ${sitemapResults.length} (${sitemapBroken.length} broken)`);
  console.log(`Internal links: ${allInternalLinks.size} (${internalBroken.length} broken)`);
  console.log(`External links: ${allExternalLinks.size} (${externalBroken.length} broken)`);

  if (sitemapBroken.length + internalBroken.length + externalBroken.length === 0) {
    console.log("\nAll links OK!");
  }
}

main().catch(console.error);
