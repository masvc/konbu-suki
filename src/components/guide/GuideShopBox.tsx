import { ShopCTA } from "@/components/ShopCTA";

/** 記事末尾の「関連商品を探す」。searchKeyword が無い記事では出さない。 */
export function GuideShopBox({ keyword }: { keyword?: string }) {
  if (!keyword) return null;
  return (
    <div className="mt-10 rounded-xl border border-[#b7e4c7] bg-[#f8faf8] p-5">
      <p className="text-sm font-bold text-gray-900 mb-3">関連商品を探す</p>
      <ShopCTA keyword={keyword} />
    </div>
  );
}
