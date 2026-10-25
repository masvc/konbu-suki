import { amazonSearchUrl, rakutenSearchUrl } from "@/lib/affiliates";

type Props = {
  keyword: string;
  amazonAsin?: string;
  rakutenId?: string;
  amazonLabel?: string;
  rakutenLabel?: string;
};

export function ShopCTA({
  keyword,
  amazonLabel = "Amazonで探す",
  rakutenLabel = "楽天で探す",
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={amazonSearchUrl(keyword)}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition"
      >
        {amazonLabel} ↗
      </a>
      <a
        href={rakutenSearchUrl(keyword)}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex items-center gap-1.5 rounded-full bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 transition"
      >
        {rakutenLabel} ↗
      </a>
    </div>
  );
}
