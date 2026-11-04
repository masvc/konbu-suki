import {
  AMAZON_ASSOCIATE_TAG,
  RAKUTEN_AFFILIATE_ID,
  MOSHIMO_A_ID,
  MOSHIMO_P_ID,
  MOSHIMO_PC_ID,
  MOSHIMO_PL_ID,
} from "./constants";

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
 * 楽天リンクの成果経路。
 *
 * もしものIDが揃っていればクリック計測URLで包む。無ければ楽天直営
 * アフィリエイトのID、それも無ければ素のURLを返す。
 *
 * DBには素の楽天URLを保存してある。ASPを変えてもDBを書き換えずに済むよう、
 * 成果リンクへの変換はここだけで行う。
 */
function moshimoWrap(targetUrl: string): string | null {
  if (!MOSHIMO_A_ID || !MOSHIMO_P_ID || !MOSHIMO_PC_ID || !MOSHIMO_PL_ID) return null;
  const params = new URLSearchParams({
    a_id: MOSHIMO_A_ID,
    p_id: MOSHIMO_P_ID,
    pc_id: MOSHIMO_PC_ID,
    pl_id: MOSHIMO_PL_ID,
    url: targetUrl,
  });
  return `https://af.moshimo.com/af/c/click?${params.toString()}`;
}

function withRakutenAffiliate(targetUrl: string): string {
  const moshimo = moshimoWrap(targetUrl);
  if (moshimo) return moshimo;
  if (RAKUTEN_AFFILIATE_ID) {
    return `https://hb.afl.rakuten.co.jp/hgc/${RAKUTEN_AFFILIATE_ID}/?pc=${targetUrl}`;
  }
  return targetUrl;
}

/**
 * 楽天商品リンク生成
 *
 * DB の rakutenUrl（素の商品URL）をそのまま渡せる。itemCode
 * （"ショップコード:商品ID"）を渡した場合は商品URLに組み直す。
 */
export function rakutenProductUrl(rakutenUrlOrItemCode: string): string {
  const target = rakutenUrlOrItemCode.startsWith("http")
    ? rakutenUrlOrItemCode
    : `https://item.rakuten.co.jp/${rakutenUrlOrItemCode.replace(":", "/")}/`;
  return withRakutenAffiliate(target);
}

/**
 * 楽天検索リンク生成
 */
export function rakutenSearchUrl(keyword: string): string {
  return withRakutenAffiliate(
    `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keyword)}/`
  );
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
