import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center py-20 px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#d8f3dc] flex items-center justify-center">
          <svg className="w-8 h-8 text-[#2d6a4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ページが見つかりません</h1>
        <p className="text-sm text-gray-500 mb-6">お探しの昆布ページは存在しないか、移動した可能性があります。</p>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg bg-[#2d6a4f] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1b4332] transition"
        >
          {SITE_NAME} トップへ戻る
        </Link>
      </div>
    </main>
  );
}
