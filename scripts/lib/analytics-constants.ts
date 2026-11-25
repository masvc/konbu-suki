/**
 * 分析スクリプト共通定数
 *
 * CTA_EVENTS / AI_SOURCES の一元管理。
 * weekly.ts / funnel.ts / cta-tracking.ts / analyze.ts から参照。
 */

/**
 * CTAとして計測する全GA4イベント名。
 *
 * このサイトが実際に送っているのは layout.tsx の data-ga-event 経由の
 * 2種類だけ。別プロジェクト由来の発火しないイベント名が7件混ざっていたので
 * 落とした。イベントを増やしたらここにも足す。
 */
export const CTA_EVENTS = [
  // 商品ページの購入ボタン
  "amazon_click",
  "rakuten_click",
  // 記事の中の商品カード（2026-11-25 に追加）
  "article_product_click",
  "article_amazon_click",
  "article_rakuten_click",
  // 記事末尾の検索リンク（ShopCTA）。これまでイベントが無く測れていなかった
  "article_amazon_search",
  "article_rakuten_search",
];

/**
 * 記事を入口にしたクリック。**商品ページ起点と混ぜない。**
 *
 * 「記事からのクリックが0」なのか「測っていないから0に見える」のかを
 * 区別するために分けている（2026-11-25 まで後者だった）。
 */
export const ARTICLE_CTA_EVENTS = [
  "article_product_click",
  "article_amazon_click",
  "article_rakuten_click",
  "article_amazon_search",
  "article_rakuten_search",
];

/** CLI引数から日付範囲をパースする共通ヘルパー */
export function parseDateArgs(argv = process.argv.slice(2)): { startDate: string; endDate: string } {
  if (argv.length >= 2 && argv[0].includes("-")) return { startDate: argv[0], endDate: argv[1] };
  const days = argv.find((a) => /^\d+$/.test(a));
  return { startDate: `${days ? parseInt(days) : 28}daysAgo`, endDate: "today" };
}

/** pagePath フィルター式を生成（空文字なら undefined） */
export function pagePathFilter(pagePath: string) {
  return pagePath
    ? { filter: { fieldName: "pagePath", stringFilter: { value: pagePath } } }
    : undefined;
}

/** AI系と判定するソース/メディア */
export const AI_SOURCES = [
  "openai",
  "chatgpt.com",
  "chat.openai.com",
  "copilot.com",
  "copilot.microsoft.com",
  "perplexity.ai",
  "perplexity",
  "gemini.google.com",
  "claude.ai",
  "you.com",
];
