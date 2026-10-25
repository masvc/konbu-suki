import { AMAZON_ASSOCIATE_TAG, RAKUTEN_AFFILIATE_ID } from "./constants";

/**
 * Amazon商品リンク生成
 */
export function amazonProductUrl(asin: string): string {
  return `https://www.amazon.co.jp/dp/${asin}?tag=${AMAZON_ASSOCIATE_TAG}`;
}

/**
 * Amazon検索リンク生成
 */
export function amazonSearchUrl(keyword: string): string {
  return `https://www.amazon.co.jp/s?k=${encodeURIComponent(keyword)}&tag=${AMAZON_ASSOCIATE_TAG}`;
}

/**
 * 楽天商品リンク生成
 */
export function rakutenProductUrl(itemId: string): string {
  if (RAKUTEN_AFFILIATE_ID) {
    return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=https://item.rakuten.co.jp/${itemId}`;
  }
  return `https://item.rakuten.co.jp/${itemId}`;
}

/**
 * 楽天検索リンク生成
 */
export function rakutenSearchUrl(keyword: string): string {
  if (RAKUTEN_AFFILIATE_ID) {
    return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
  }
  return `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`;
}

/**
 * ショップCTAリンク（Amazon + 楽天）
 */
export function getShopLinks(keyword: string, asin?: string, rakutenId?: string) {
  return {
    amazon: asin ? amazonProductUrl(asin) : amazonSearchUrl(keyword),
    rakuten: rakutenId ? rakutenProductUrl(rakutenId) : rakutenSearchUrl(keyword),
  };
}
