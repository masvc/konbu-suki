import Link from "next/link";
import { KonbuLogo } from "./KonbuLogo";
import { MobileMenu } from "./MobileMenu";
import { Search } from "lucide-react";

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
          <div className="flex items-center gap-1 md:hidden">
            <Link href="/search" className="p-2 text-gray-600 hover:text-[#2d6a4f]" aria-label="検索">
              <Search className="w-5 h-5" />
            </Link>
            <MobileMenu />
          </div>
        </div>
      </div>
    </header>
  );
}
