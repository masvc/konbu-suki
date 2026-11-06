import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { GUIDES } from "@/lib/guides";

export const metadata: Metadata = {
  title: `昆布ガイド | ${SITE_NAME}`,
  description:
    "昆布の種類と選び方、だしの取り方、昆布締め、保存方法、栄養成分まで。公的機関と業界団体の資料をもとにまとめた昆布の記事一覧です。",
  alternates: { canonical: "/guide" },
};

/**
 * 記事一覧。
 *
 * **一覧を手で書かない。** 以前はこのファイルに記事8本をベタ書きしていて、
 * 新しく足した12本がどこからも辿れなかった。トップからも一覧からも
 * リンクが無く、Search Console では「検出 - インデックス未登録／未クロール」に
 * なっていた。記事を足しても一覧に出ないので、画面を見ていても気付けない。
 *
 * src/lib/guides.ts の GUIDES をそのまま並べる。記事を足せば必ず出る。
 */
export default function GuidePage() {
  // 更新日の新しい順。古い記事が上に居座ると、新しい記事ほど深い位置になる。
  const guides = Object.entries(GUIDES).sort(
    ([, a], [, b]) => new Date(b.dateModified).getTime() - new Date(a.dateModified).getTime()
  );

  // 一覧ページであることと、そこに何が並んでいるかを構造化データで示す。
  // 記事の数と順序が機械で読めるので、まとめページとして扱われやすくなる。
  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "昆布ガイドの記事一覧",
    numberOfItems: guides.length,
    itemListElement: guides.map(([slug, g], i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/guide/${slug}`,
      name: g.title,
    })),
  };

  return (
    <main className="flex-1">
      <JsonLd data={itemListJsonLd} />
      <section className="bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <Breadcrumb items={[{ label: "昆布ガイド" }]} />
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">昆布ガイド</h1>
          <p className="mt-2 text-sm text-gray-600">
            昆布のことをもっと知る。種類・選び方・だしの取り方・昆布締め・保存・栄養まで、全{guides.length}記事。
          </p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {guides.map(([slug, g]) => (
            <Link
              key={slug}
              href={`/guide/${slug}`}
              className="group flex gap-4 rounded-xl border border-gray-100 bg-white p-4 hover:border-green-300 hover:shadow-md transition-all"
            >
              {g.image && (
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-[#f8faf8]">
                  <Image
                    src={g.image}
                    alt={g.imageAlt || g.title}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition mb-1 leading-snug">
                  {g.title}
                </h2>
                <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{g.description}</p>
                <p className="mt-1 text-[10px] text-gray-400">
                  <time dateTime={g.dateModified}>{g.dateModified}</time> 更新
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
