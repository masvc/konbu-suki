/**
 * 分析スクリプト共通定数
 *
 * CTA_EVENTS / AI_SOURCES の一元管理。
 * weekly.ts / funnel.ts / cta-tracking.ts / analyze.ts から参照。
 */

/** CTAとして計測する全GA4イベント名 */
export const CTA_EVENTS = [
  "amazon_click",
  "rakuten_click",
  "yahoo_click",
  "uriel_click",
  "partner_click",
  "feature_affiliate_click",
  "guide_affiliate_click",
  "school_click",
  "sticky_ad_click",
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
