import Link from "next/link";
import { SITE_NAME, CATEGORY_SLUGS, CATEGORIES } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">カテゴリ</h3>
            <ul className="space-y-2">
              {CATEGORY_SLUGS.map((slug) => (
                <li key={slug}>
                  <Link href={`/category/${slug}`} className="text-xs text-gray-500 hover:text-green-700 transition">
                    {CATEGORIES[slug].label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">コンテンツ</h3>
            <ul className="space-y-2">
              <li><Link href="/guide" className="text-xs text-gray-500 hover:text-green-700 transition">昆布ガイド</Link></li>
              <li><Link href="/producers" className="text-xs text-gray-500 hover:text-green-700 transition">生産者一覧</Link></li>
              <li><Link href="/kombu-box" className="text-xs text-gray-500 hover:text-green-700 transition">こんぶBOX</Link></li>
              <li><Link href="/about" className="text-xs text-gray-500 hover:text-green-700 transition">このサイトについて</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">産地別</h3>
            <ul className="space-y-2">
              <li><Link href="/origin/rishiri" className="text-xs text-gray-500 hover:text-green-700 transition">利尻昆布</Link></li>
              <li><Link href="/origin/rausu" className="text-xs text-gray-500 hover:text-green-700 transition">羅臼昆布</Link></li>
              <li><Link href="/origin/hidaka" className="text-xs text-gray-500 hover:text-green-700 transition">日高昆布</Link></li>
              <li><Link href="/origin/makombu" className="text-xs text-gray-500 hover:text-green-700 transition">真昆布</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3">{SITE_NAME}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              日本の昆布文化を次世代に。全国の昆布商品を網羅的に集めたキュレーションサイトです。
              将来は昆布のD2C・昆布商社として、生産者と消費者をつなぎます。
            </p>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
