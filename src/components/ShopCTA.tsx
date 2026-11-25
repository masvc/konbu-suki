import { amazonSearchUrl, rakutenSearchUrl } from "@/lib/affiliates";

type Props = {
  keyword: string;
  /** どの記事からのクリックかを GA4 に送る。記事ページから渡す */
  source?: string;
  amazonLabel?: string;
  rakutenLabel?: string;
};

/**
 * 検索で商品を探すリンク。
 *
 * **クリックを GA4 に送る**（`article_amazon_search` /
 * `article_rakuten_search`）。送っていなかったため、記事から商品へ出て
 * いった人がいたかどうかを、そもそも測れていなかった（2026-11-25 に追加）。
 */
export function ShopCTA({
  keyword,
  source,
  amazonLabel = "Amazonで探す",
  rakutenLabel = "楽天で探す",
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={amazonSearchUrl(keyword)}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        data-ga-event="article_amazon_search"
        data-ga-product={keyword}
        data-ga-product-id={source ?? ""}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff9900] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e68a00] transition shadow-sm"
      >
        {amazonLabel} ↗
      </a>
      <a
        href={rakutenSearchUrl(keyword)}
        target="_blank"
        rel="noopener noreferrer nofollow sponsored"
        data-ga-event="article_rakuten_search"
        data-ga-product={keyword}
        data-ga-product-id={source ?? ""}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#bf0000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#a00000] transition shadow-sm"
      >
        {rakutenLabel} ↗
      </a>
    </div>
  );
}
