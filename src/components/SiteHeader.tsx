import Link from "next/link";
import { KonbuLogo } from "./KonbuLogo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center justify-between">
          <KonbuLogo />
          <nav className="hidden md:flex items-center gap-1">
            <Link href="/search" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition">検索</Link>
            <Link href="/category/dashi" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition">だし昆布</Link>
            <Link href="/category/shiokombu" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition">塩昆布</Link>
            <Link href="/category/snack" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition">おやつ昆布</Link>
            <Link href="/guide" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition">ガイド</Link>
            <Link href="/producers" className="rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-[#d8f3dc] hover:text-[#1b4332] transition">生産者</Link>
            <Link href="/kombu-box" className="rounded-lg bg-[#2d6a4f] px-3.5 py-1.5 text-sm font-medium text-white hover:bg-[#1b4332] transition ml-1">こんぶBOX</Link>
          </nav>
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/search" className="p-2 text-gray-600 hover:text-[#2d6a4f]" aria-label="検索">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <button className="p-2 text-gray-600" aria-label="メニュー">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
