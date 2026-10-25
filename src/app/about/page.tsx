import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: `このサイトについて | ${SITE_NAME}`,
  description: SITE_DESCRIPTION,
};

export default function AboutPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Breadcrumb items={[{ label: "このサイトについて" }]} />

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">{SITE_NAME}について</h1>

        {/* コンセプト */}
        <section className="mb-12">
          <p className="text-lg sm:text-xl font-bold text-[#1b4332] leading-relaxed mb-6">
            まだ知らない、あなたの「スキ」な昆布に出会う。
            <br />
            日本の海と、昆布をつくる人たちへの敬意を込めて。
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            {SITE_NAME}は、日本全国の昆布商品を集めた昆布専門のキュレーションサイトです。
            利尻・羅臼・日高・真昆布など北海道を中心に、全国の産地から届く昆布を
            カテゴリ・産地・用途別に整理し、あなたにぴったりの一品を見つけるお手伝いをします。
          </p>
        </section>

        {/* 3つの柱 */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-6">3つの柱</h2>
          <div className="space-y-6">
            <div className="rounded-xl border border-gray-100 bg-[#f8faf8] p-5">
              <h3 className="text-sm font-bold text-[#2d6a4f] mb-2">出会う</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                スーパーの棚に並ぶ定番だけが昆布ではありません。
                全国には、小さな産地で丁寧に作られた昆布や、老舗が守り続ける製法の逸品がたくさんあります。
                まだ知らない昆布との出会いをつくることが、このサイトの出発点です。
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#f8faf8] p-5">
              <h3 className="text-sm font-bold text-[#2d6a4f] mb-2">知る</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                昆布は産地によって味が違い、用途によって選び方が変わります。
                商品を並べるだけでなく、産地の背景、作り手のこだわり、美味しい食べ方まで。
                昆布のことをもっと知れるコンテンツを届けます。
              </p>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#f8faf8] p-5">
              <h3 className="text-sm font-bold text-[#2d6a4f] mb-2">応援する</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                日本の昆布生産量は減少傾向にあります（出典: 農林水産省「漁業・養殖業生産統計」）。
                良い昆布を作り続ける人たちの挑戦が続くように、
                その商品を一人でも多くの人に届けることが、私たちにできる応援です。
              </p>
            </div>
          </div>
        </section>

        {/* 紹介の基準 */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">紹介の基準</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>Amazon・楽天で実際に購入でき、レビューや評価が確認できる商品を掲載しています</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>健康効果を断定する表現は使いません。栄養成分は公的な出典（日本食品標準成分表等）に基づきます</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>運営者がリピート購入している商品は、実体験に基づくコメントを添えて紹介します</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>味わいプロファイルはカテゴリの一般的な傾向であり、個々の商品で異なる場合があります</span>
            </li>
          </ul>
        </section>

        {/* ビジョン */}
        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">これからやりたいこと</h2>
          <div className="space-y-3">
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Phase 1: キュレーション（今ここ）</h3>
              <p className="text-xs text-gray-600">Amazon・楽天の昆布商品を網羅的に収集・分類。昆布選びの入口になる。</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Phase 2: こんぶBOX（D2C検証）</h3>
              <p className="text-xs text-gray-600">全国の厳選昆布を詰め合わせて届ける。生産者と消費者を直接つなぐ。</p>
            </div>
            <div className="rounded-lg border border-gray-100 bg-white p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-1">Phase 3: 作り手と食べる人をつなぐ</h3>
              <p className="text-xs text-gray-600">生産者との信頼関係を軸に、日本の昆布文化を国内外に届ける総合プラットフォームへ。</p>
            </div>
          </div>
        </section>

        {/* 免責 */}
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">免責事項</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            当サイトは、Amazon.co.jpを宣伝しリンクすることによってサイトが紹介料を獲得できる手段を提供することを目的に設定されたアフィリエイトプログラムである、Amazonアソシエイト・プログラムの参加者です。
            商品情報や価格は変更される場合があります。最新情報は各販売サイトでご確認ください。
            当サイトに掲載されている情報は、特定の疾患の予防・治療効果を保証するものではありません。
          </p>
        </section>
      </div>
    </main>
  );
}
