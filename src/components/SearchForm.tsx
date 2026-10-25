"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CATEGORIES, CATEGORY_SLUGS } from "@/lib/constants";

type Props = {
  initialQ?: string;
  initialCategory?: string;
  initialSort?: string;
};

export function SearchForm({ initialQ = "", initialCategory = "", initialSort = "newest" }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState(initialSort);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-0 sm:flex sm:gap-2">
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="昆布を検索 (例: 利尻昆布、塩昆布)"
        className="w-full sm:flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] outline-none"
      />
      <div className="flex gap-2">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex-1 sm:flex-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-[#52b788] outline-none"
        >
          <option value="">全カテゴリ</option>
          {CATEGORY_SLUGS.map((slug) => (
            <option key={slug} value={slug}>{CATEGORIES[slug].label}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="flex-1 sm:flex-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm bg-white focus:border-[#52b788] outline-none"
        >
          <option value="newest">新着順</option>
          <option value="price_asc">安い順</option>
          <option value="price_desc">高い順</option>
          <option value="rating">評価順</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b4332] transition shrink-0"
        >
          検索
        </button>
      </div>
    </form>
  );
}
