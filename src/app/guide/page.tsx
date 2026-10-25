import Link from "next/link";
import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `昆布ガイド | ${SITE_NAME}`,
  description: "昆布の種類、だしの取り方、栄養価、産地別の特徴など、昆布に関する知識をまとめたガイド記事一覧。",
};

const GUIDES = [
  { slug: "kombu-types", title: "昆布の種類と選び方", desc: "利尻・羅臼・日高・真昆布の違いと、料理別のおすすめ昆布を解説。" },
  { slug: "how-to-make-dashi", title: "昆布だしの取り方 完全ガイド", desc: "水出し・煮出しの基本からプロの技まで。美味しい昆布だしの取り方。" },
  { slug: "kombu-nutrition", title: "昆布の栄養と健康効果", desc: "食物繊維・ミネラル・フコイダン・アルギン酸。昆布の驚くべき栄養価。" },
  { slug: "shiokombu-guide", title: "塩昆布の選び方・使い方", desc: "ごはんのお供だけじゃない。パスタ、サラダ、おにぎりに使える万能調味料。" },
  { slug: "kombu-storage", title: "昆布の保存方法", desc: "正しい保存で美味しさ長持ち。常温・冷蔵・冷凍の使い分け。" },
  { slug: "kombu-recipes", title: "昆布を使ったレシピ集", desc: "だし昆布の二番出汁活用から、昆布巻き、昆布の佃煮まで。" },
  { slug: "kombu-history", title: "昆布の歴史と文化", desc: "北前船から大阪の昆布文化まで。日本人と昆布の深い関わり。" },
  { slug: "kombu-production", title: "昆布の生産と流通", desc: "北海道の昆布漁から加工、流通まで。昆布産業の全体像。" },
];

export default function GuidePage() {
  return (
    <main className="flex-1">
      <section className="bg-gradient-to-b from-green-50 to-white border-b border-gray-100">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">昆布ガイド</h1>
          <p className="mt-2 text-sm text-gray-600">昆布のことをもっと知る。種類・選び方・だしの取り方・栄養価まで。</p>
        </div>
      </section>
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guide/${g.slug}`}
              className="group rounded-xl border border-gray-100 bg-white p-5 hover:border-green-300 hover:shadow-md transition-all"
            >
              <h2 className="text-sm font-bold text-gray-900 group-hover:text-green-700 transition mb-2">{g.title}</h2>
              <p className="text-xs text-gray-500 leading-relaxed">{g.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
