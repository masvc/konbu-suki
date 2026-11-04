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
import { batchCheckUrls, checkUrl, mapConcurrent, type UrlStatus } from "./lib/http";

const CONCURRENCY = 10;

/**
 * HTML の href は実体参照で書かれている。解除せずに投げると
 * "...&amp;tag=..." のような壊れた URL を叩くことになる。
 */
function decodeEntities(href: string): string {
  return href
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x0?27;/gi, "'");
}

/**
 * 結果の分類。
 *
 * 404/410 は確かに無い。403/429/503 はボット対策で弾かれているだけのことが
 * 多く（Amazon の検索URLが全部これになる）、リンク切れとして報告すると
 * 毎朝ノイズになる。タイムアウトも同様に確証がない。
 * 「切れている」と「確かめられなかった」を分けて扱う。
 */
type Verdict = "ok" | "broken" | "unverifiable";

function verdictOf(status: UrlStatus | undefined): Verdict {
  if (typeof status !== "number") return "unverifiable";
  if (status < 400) return "ok";
  if (status === 403 || status === 429 || status === 503) return "unverifiable";
  return "broken";
}

const isBroken = (status: UrlStatus | undefined) => verdictOf(status) !== "ok";

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
      const href = decodeEntities(m[1]);
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * HEAD で怪しかったものだけ GET で確かめ直す。
 *
 * さらに、それでも駄目だったものは間隔を置いて1件ずつ最終確認する。
 * 数百件を並列で叩くと相手側のレート制限に当たり、同じサイトでも実行ごとに
 * 異常件数が 4件 → 13件 と動いた。毎朝の通知をノイズにしないため、
 * 2回落ちたものだけを異常として報告する。
 */
async function checkWithGetFallback(urls: string[], label: string, confirm = false) {
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

  if (!confirm) return statuses;

  const stillBroken = urls.filter((u) => isBroken(statuses.get(u)));
  if (stillBroken.length === 0) return statuses;

  console.log(`  ${label}(最終確認): ${stillBroken.length}件を間隔を置いて再確認`);
  for (const url of stillBroken) {
    await sleep(1500);
    const status = await checkUrl(url, { method: "GET", timeoutMs: 15000 });
    statuses.set(url, status);
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
  const externalStatuses = await checkWithGetFallback(externalUrls, "外部リンク", true);
  const externalBroken = [...externalStatuses].filter(([, s]) => verdictOf(s) === "broken");
  const externalUnverifiable = [...externalStatuses].filter(
    ([, s]) => verdictOf(s) === "unverifiable"
  );
  for (const [url, status] of externalBroken) console.log(`  [${status}] ${url}`);
  console.log(`外部: ${externalUrls.length}件中 ${externalBroken.length}件が切れている`);
  if (externalUnverifiable.length > 0) {
    // ボット対策で弾かれたもの。切れているとは言えないので別に数える。
    const hosts = new Map<string, number>();
    for (const [url] of externalUnverifiable) {
      const host = (() => { try { return new URL(url).host; } catch { return url; } })();
      hosts.set(host, (hosts.get(host) || 0) + 1);
    }
    const top = [...hosts].sort((a, b) => b[1] - a[1]).slice(0, 5);
    console.log(
      `      確かめられなかった: ${externalUnverifiable.length}件` +
        `（${top.map(([h, n]) => `${h} ${n}`).join(", ")}）`
    );
  }
  console.log("");

  console.log("=".repeat(60));
  const totalBroken = brokenPages.length + internalBroken.length + externalBroken.length;
  console.log(
    `sitemap ${brokenPages.length} / 内部 ${internalBroken.length} / 外部 ${externalBroken.length} が切れている`
  );
  if (totalBroken === 0) console.log("切れているリンクは無い");
  console.log("");
  // health-report.ts が拾う要約行
  console.log(
    `SUMMARY: 切れ sitemap ${brokenPages.length} / 内部 ${internalBroken.length} / 外部 ${externalBroken.length}` +
      `（検査 ${pages.length}/${internalPaths.length}/${externalUrls.length}、` +
      `外部で確かめられなかったもの ${externalUnverifiable.length}）`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
