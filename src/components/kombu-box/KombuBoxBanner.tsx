import Link from "next/link";
import { KOMBU_BOX } from "@/lib/kombu-box";

export function KombuBoxBanner() {
  return (
    <section className="bg-gradient-to-r from-green-700 to-green-600 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <Link href="/kombu-box" className="flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          <div>
            <p className="text-xs font-semibold text-green-300 tracking-widest">KOMBU BOX</p>
            <p className="text-lg font-bold mt-1">昆布おやつのシークレットBOX</p>
            <p className="text-sm text-green-100 mt-1">{KOMBU_BOX.worthLabel}を詰め合わせ。{KOMBU_BOX.limitLabel} {KOMBU_BOX.price.toLocaleString()}円</p>
          </div>
          <span className="shrink-0 rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-green-800 hover:bg-green-50 transition">
            詳しく見る
          </span>
        </Link>
      </div>
    </section>
  );
}
