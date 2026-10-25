import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <div className="text-center py-20 px-4">
        <p className="text-6xl mb-4">🫒</p>
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
