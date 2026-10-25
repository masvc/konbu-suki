import Link from "next/link";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/constants";

type Props = {
  counts?: Record<string, number>;
  activeSlug?: string;
};

export function CategoryTabs({ counts, activeSlug }: Props) {
  return (
    <div className="flex gap-1 overflow-x-auto no-scrollbar py-2.5">
      {CATEGORY_SLUGS.map((slug) => {
        const meta = CATEGORIES[slug];
        const count = counts?.[slug];
        const isActive = slug === activeSlug;
        return (
          <Link
            key={slug}
            href={`/category/${slug}`}
            className={`shrink-0 flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
              isActive
                ? "border-[#52b788] bg-[#d8f3dc] text-[#1b4332]"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#52b788] hover:bg-[#d8f3dc] hover:text-[#1b4332]"
            }`}
          >
            <span>{meta.emoji}</span>
            <span>{meta.label}</span>
            {count !== undefined && <span className="text-gray-400">({count})</span>}
          </Link>
        );
      })}
    </div>
  );
}
