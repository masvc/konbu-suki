import Link from "next/link";
import Image from "next/image";
import { CATEGORIES, type CategorySlug } from "@/lib/constants";

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
      className="group rounded-xl border border-gray-100 bg-white hover:border-green-300 hover:shadow-md p-4 transition-all"
    >
      {imageUrl && (
        <div className="relative w-full aspect-square mb-3 rounded-lg overflow-hidden bg-gray-50">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-2 group-hover:scale-105 transition-transform"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        </div>
      )}
      <div className="flex items-center gap-1.5 mb-1">
        {cat && <span className="text-[10px] text-green-600 font-medium">{cat.emoji} {cat.label}</span>}
        {origin && <span className="text-[10px] text-gray-400">/ {origin}</span>}
      </div>
      <p className="text-xs font-bold text-gray-900 group-hover:text-green-700 transition leading-snug line-clamp-2 mb-1">
        {name}
      </p>
      <p className="text-[10px] text-gray-500">{brand}</p>
      <div className="flex items-center justify-between mt-2">
        {price && (
          <span className="text-sm font-bold text-green-700">&yen;{price.toLocaleString()}</span>
        )}
        {rating && (
          <span className="text-xs text-amber-600 font-bold">{rating.toFixed(1)}</span>
        )}
      </div>
    </Link>
  );
}
