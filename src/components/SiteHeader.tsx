import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🫒</span>
            <span className="text-lg font-bold text-gray-900">{SITE_NAME}</span>
          </Link>
          <nav className="hidden sm:flex items-center gap-6 text-sm">
            <Link href="/category/dashi" className="text-gray-600 hover:text-green-700 transition">だし昆布</Link>
            <Link href="/category/shiokombu" className="text-gray-600 hover:text-green-700 transition">塩昆布</Link>
            <Link href="/category/snack" className="text-gray-600 hover:text-green-700 transition">食べる昆布</Link>
            <Link href="/guide" className="text-gray-600 hover:text-green-700 transition">昆布ガイド</Link>
            <Link href="/search" className="text-gray-600 hover:text-green-700 transition">検索</Link>
            <Link href="/producers" className="text-gray-600 hover:text-green-700 transition">生産者</Link>
            <Link href="/kombu-box" className="text-green-700 font-medium hover:text-green-800 transition">こんぶBOX</Link>
          </nav>
          <button className="sm:hidden p-2 text-gray-600" aria-label="メニュー">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
