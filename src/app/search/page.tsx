import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, type CategorySlug, SITE_NAME } from "@/lib/constants";
import { ProductCard } from "@/components/ProductCard";
import { SearchForm } from "@/components/SearchForm";

export const metadata: Metadata = {
  title: `昆布を探す | ${SITE_NAME}`,
  description: "Amazon・楽天の昆布商品を横断検索。だし昆布、塩昆布、とろろ昆布、昆布茶など全カテゴリから探せます。",
};

type Props = {
  searchParams: Promise<{ q?: string; category?: string; origin?: string; sort?: string; page?: string }>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = params.q || "";
  const category = params.category || "";
  const origin = params.origin || "";
  const sort = params.sort || "newest";
  const page = parseInt(params.page || "1");
  const limit = 24;

  const where: Record<string, unknown> = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { brand: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { contains: q, mode: "insensitive" } },
    ];
  }
  if (category) where.category = category;
  if (origin) where.origin = { contains: origin, mode: "insensitive" };

  const orderBy =
    sort === "price_asc" ? { price: "asc" as const } :
    sort === "price_desc" ? { price: "desc" as const } :
    sort === "rating" ? { rating: "desc" as const } :
    { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.product.count({ where }),
  ]);
  const totalPages = Math.ceil(total / limit);

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">昆布を探す</h1>
          <SearchForm initialQ={q} initialCategory={category} initialSort={sort} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            {total}件の昆布商品{q && <>（「{q}」の検索結果）</>}
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map((p) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>

            {/* ページネーション */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  const params = new URLSearchParams();
                  if (q) params.set("q", q);
                  if (category) params.set("category", category);
                  if (sort !== "newest") params.set("sort", sort);
                  params.set("page", String(p));
                  return (
                    <a
                      key={p}
                      href={`/search?${params.toString()}`}
                      className={`px-3 py-1.5 text-sm rounded-lg transition ${
                        p === page
                          ? "bg-green-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-green-50 hover:text-green-700"
                      }`}
                    >
                      {p}
                    </a>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-500 text-sm">該当する商品が見つかりませんでした</p>
            {q && <p className="text-gray-400 text-xs mt-2">別のキーワードで検索してみてください</p>}
          </div>
        )}
      </section>
    </main>
  );
}
