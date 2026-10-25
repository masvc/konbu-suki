import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { SITE_NAME } from "@/lib/constants";

export const revalidate = 21600;

export const metadata: Metadata = {
  title: `昆布の生産者 | ${SITE_NAME}`,
  description: "全国の昆布生産者・メーカー一覧。こだわりの昆布を作る生産者のストーリー。",
};

export default async function ProducersPage() {
  const producers = await prisma.producer.findMany({
    orderBy: [{ isPartner: "desc" }, { name: "asc" }],
  });

  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">昆布の生産者</h1>
          <p className="mt-2 text-sm text-gray-600">全国の昆布生産者・メーカーのこだわりとストーリー。将来的にパートナーとして連携していきます。</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        {producers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {producers.map((p) => (
              <div key={p.id} className="rounded-xl border border-gray-100 bg-white p-5 hover:border-green-300 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-sm font-bold text-gray-900">{p.name}</h2>
                  {p.isPartner && (
                    <span className="text-[10px] bg-green-100 text-green-700 rounded-full px-2 py-0.5">パートナー</span>
                  )}
                </div>
                <p className="text-xs text-green-600 mb-2">{p.area} {p.speciality && `/ ${p.speciality}`}</p>
                {p.description && <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{p.description}</p>}
                {p.url && (
                  <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-block mt-3 text-xs text-green-600 hover:text-green-800">
                    公式サイト ↗
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🤝</p>
            <p className="text-gray-500 text-sm">生産者情報は準備中です。</p>
            <p className="text-gray-400 text-xs mt-2">昆布の生産者・メーカーの方で掲載をご希望の方はお問い合わせください。</p>
          </div>
        )}
      </section>
    </main>
  );
}
