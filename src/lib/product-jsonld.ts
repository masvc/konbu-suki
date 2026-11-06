/**
 * 商品ページの構造化データ。
 *
 * Search Console から「『offers』、『review』、または『aggregateRating』を指定する
 * 必要があります」という重大な問題が報告された（2026-11-05）。Product を出して
 * いながら、そのどれも入れていなかった。重大な問題が付くとリッチリザルトに
 * 出なくなる。
 *
 * 入れられるのは offers だけ。
 * - review: このサイトにレビューは無い（0件）
 * - aggregateRating: ratingValue だけでは足りず reviewCount か ratingCount が要る。
 *   商品315件のうち rating があるのは41件、reviewCount は0件なので出せない。
 *   数を作って入れるのは商品データの捏造にあたる（CLAUDE.md）
 *
 * 価格が無い商品（6件）には Product そのものを出さない。offers を欠いた Product を
 * 出すと、また同じ重大な問題が付く。
 */
import { SITE_URL } from "./constants";

export type ProductForJsonLd = {
  id: number;
  name: string;
  brand: string;
  description?: string | null;
  imageUrl?: string | null;
  price?: number | null;
};

/**
 * 商品の構造化データを組み立てる。出せないときは null。
 *
 * price はページに表示している参考価格と同じ値を使う。構造化データと
 * 画面の値が違うと、それ自体が問題として報告される。
 */
export function buildProductJsonLd(product: ProductForJsonLd): Record<string, unknown> | null {
  if (product.price == null) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    brand: { "@type": "Brand", name: product.brand },
    description: product.description || `${product.brand}の${product.name}`,
    ...(product.imageUrl ? { image: product.imageUrl } : {}),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "JPY",
      url: `${SITE_URL}/product/${product.id}`,
      // availability は入れない。在庫の情報を持っていないので、
      // InStock と書くと持っていない情報を断定することになる。
    },
  };
}
