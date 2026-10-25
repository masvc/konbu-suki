import { amazonSearchUrl, rakutenSearchUrl } from "@/lib/affiliates";

type Props = {
  keyword: string;
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
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#ff9900] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#e68a00] transition shadow-sm"
      >
        {amazonLabel} ↗
      </a>
      <a
        href={rakutenSearchUrl(keyword)}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#bf0000] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#a00000] transition shadow-sm"
      >
        {rakutenLabel} ↗
      </a>
    </div>
  );
}
