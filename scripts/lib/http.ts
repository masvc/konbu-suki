/**
 * URL の疎通確認。
 *
 * site-check.ts と check-links.ts が同じ実装を使う。以前は site-check 側だけが
 * 並列化されていて、check-links は数百URLを逐次に投げていたため実用にならない
 * 速さだった（sitemap 344件を全文 GET で2周し、さらに内部・外部リンクも逐次）。
 * 共通化して、どちらも並列で回す。
 */
import { PUBLIC_SITE_HOST } from "./site";

export type UrlStatus = number | "timeout" | "error";

const DEFAULT_USER_AGENT = `SiteCheck/1.0 (${PUBLIC_SITE_HOST} quality checker)`;

export type CheckOptions = {
  /** 既定は HEAD。本文が必要なときだけ GET にする。 */
  method?: "HEAD" | "GET";
  timeoutMs?: number;
  userAgent?: string;
};

export async function checkUrl(url: string, opts: CheckOptions = {}): Promise<UrlStatus> {
  const { method = "HEAD", timeoutMs = 8000, userAgent = DEFAULT_USER_AGENT } = opts;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method,
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": userAgent },
    });
    return res.status;
  } catch {
    return "timeout";
  } finally {
    clearTimeout(timer);
  }
}

/** 並列で順不同に処理し、入力と同じ並びで結果を返す。 */
export async function mapConcurrent<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  opts: { concurrency?: number; label?: string } = {}
): Promise<R[]> {
  const { concurrency = 8, label } = opts;
  const results = new Array<R>(items.length);
  let next = 0;
  let done = 0;

  async function worker() {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i]);
      done++;
      // 進捗の上書き表示は端末のときだけ。launchd などのログに流すと
      // \r が効かず1行に全部つながってしまう。
      if (label && process.stdout.isTTY && done % 20 === 0) {
        process.stdout.write(`  ${label}: ${done}/${items.length}\r`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.max(1, Math.min(concurrency, items.length)) }, () => worker())
  );
  if (label) console.log(`  ${label}: ${items.length}件チェック完了`);
  return results;
}

export async function batchCheckUrls(
  urls: string[],
  opts: CheckOptions & { concurrency?: number; label?: string } = {}
): Promise<Map<string, UrlStatus>> {
  const { concurrency, label, ...checkOpts } = opts;
  const statuses = await mapConcurrent(urls, (u) => checkUrl(u, checkOpts), {
    concurrency,
    label,
  });
  return new Map(urls.map((u, i) => [u, statuses[i]]));
}
