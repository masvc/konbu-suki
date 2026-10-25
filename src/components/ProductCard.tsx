import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, type CategorySlug } from "@/lib/constants";
import { CategoryIcon } from "@/lib/category-icons";

type ProductCardProps = {
  id: number;
  name: string;
  brand: string;
  category: string;
  price?: number | null;
  imageUrl?: string | null;
  origin?: string | null;
  rating?: number | null;
};

export function ProductCard({ id, name, brand, category, price, imageUrl, origin, rating }: ProductCardProps) {
  const cat = CATEGORIES[category as CategorySlug];
  return (
    <Link
      href={`/product/${id}`}
      className="group rounded-xl border border-gray-100 bg-white hover:border-[#52b788] hover:shadow-md transition-all overflow-hidden"
    >
      {/* 画像エリア */}
      <div className="relative w-full aspect-square bg-gray-50 overflow-hidden">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full"><CategoryIcon slug={category} className="w-12 h-12 text-gray-200" /></div>
        )}
        {/* カテゴリバッジ */}
        {cat && (
          <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-medium text-[#2d6a4f] border border-[#d8f3dc]">
            <CategoryIcon slug={category} className="w-3 h-3 inline" /> {cat.label}
          </span>
        )}
      </div>

      {/* 情報エリア */}
      <div className="p-3">
        <p className="text-xs font-bold text-gray-900 group-hover:text-[#2d6a4f] transition leading-snug line-clamp-2 min-h-[2.5em]">
          {name}
        </p>
        <p className="text-[10px] text-gray-400 mt-1 truncate">{brand}</p>

        <div className="flex items-center justify-between mt-2">
          {price ? (
            <span className="text-xs font-bold text-[#2d6a4f]">&yen;{price.toLocaleString()}<span className="text-[8px] font-normal text-gray-400 ml-0.5">*</span></span>
          ) : (
            <span className="text-[10px] text-gray-300">--</span>
          )}
          {rating ? (
            <span className="flex items-center gap-0.5 text-[10px]">
              <span className="text-amber-400">★</span>
              <span className="font-bold text-gray-700">{rating.toFixed(1)}</span>
            </span>
          ) : null}
        </div>

        {origin && (
          <p className="mt-1.5 text-[10px] text-[#52b788] font-medium">{origin}</p>
        )}
      </div>
    </Link>
  );
}
