import type { Metadata } from "next";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

export const metadata: Metadata = {
  title: `このサイトについて | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">このサイトについて</h1>

        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">{SITE_NAME}とは</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              「こんぶ好き」は、日本の昆布文化を次世代につなぐための昆布専門キュレーションサイトです。
              全国の昆布商品を網羅的に集め、産地・種類・用途別に比較できるようにしています。
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">ビジョン</h2>
            <div className="space-y-3">
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Phase 1: キュレーション</h3>
                <p className="text-xs text-gray-600">Amazon・楽天の昆布商品を網羅的に収集・分類。昆布選びの入口になる。</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Phase 2: こんぶBOX（D2C検証）</h3>
                <p className="text-xs text-gray-600">フォーチュンボックス方式で、全国の厳選昆布を詰め合わせて届ける。生産者と消費者を直接つなぐ。</p>
              </div>
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                <h3 className="text-sm font-bold text-gray-900 mb-1">Phase 3: 昆布商社</h3>
                <p className="text-xs text-gray-600">生産者との信頼関係を軸に、B2B取引・海外展開も視野に入れた昆布の総合プラットフォームへ。</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">収益モデル</h2>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Amazon・楽天アフィリエイト（商品紹介手数料）</li>
              <li>こんぶBOX販売（D2C）</li>
              <li>生産者マッチング（将来）</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">免責事項</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
              また、楽天アフィリエイトプログラムにも参加しています。
              商品情報や価格は変更される場合があります。最新情報は各販売サイトでご確認ください。
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
