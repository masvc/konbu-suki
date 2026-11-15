import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";

/**
 * 海外から来た人のための1ページだけの入口。
 *
 * **記事を英語にするのはまだやらない**（docs/overseas.md の4章の基準に
 * 届いていない。日本以外のエンゲージセッションは90日で4、非日本語クエリは0）。
 * やるのは「海外からの注文は代理購入サービスを使ってください」と伝えること
 * だけ。こちらは国内発送のままなので輸出者にならず、FDA登録や産地証明
 * といった関門が発生しない（2026-11-15 の決定、docs/overseas.md 5章）。
 *
 * **代理購入サービスの名前は出さない。** 食品を扱えるかはサービスによって
 * 違い、こちらで確かめ続ける手間が増える。買い手が自分で選ぶ形にする。
 *
 * **hreflang は入れていない。** このページは日本語トップの訳ではなく
 * 別の内容なので、相互に対応する版として示すと嘘になる。英語版の記事を
 * 作ったときに、その記事と日本語記事の間で入れる。
 *
 * 健康の書き方は日本語側と同じ（CLAUDE.md）。効果効能は書かず、ヨウ素の
 * とりすぎへの注意を入れる。
 */
export const metadata: Metadata = {
  title: `Japanese Kombu Guide in English | ${SITE_NAME}`,
  description:
    "An English entry point to Konbu Suki, a Japanese site about kombu (kelp): what the regions taste like, how to make dashi, and how to order from overseas through a proxy-purchase service.",
  alternates: { canonical: "/en" },
};

const REGIONS: { name: string; where: string; note: string; slug: string }[] = [
  {
    name: "Ma-kombu",
    where: "Southern Hokkaido (Hakodate area)",
    note: "Thick and sweet. Often used for clear, refined dashi.",
    slug: "ma-kombu",
  },
  {
    name: "Rishiri-kombu",
    where: "Northern Hokkaido (Rishiri, Rebun, Soya)",
    note: "Firm, with a clear dashi. Common in Kyoto cuisine.",
    slug: "rishiri-kombu",
  },
  {
    name: "Rausu-kombu",
    where: "Eastern Hokkaido (Rausu)",
    note: "Strongly aromatic. The dashi has colour and body.",
    slug: "rausu-kombu",
  },
  {
    name: "Hidaka-kombu",
    where: "Southern Hokkaido (Hidaka)",
    note: "Softens quickly, so it is also eaten as food, not only for dashi.",
    slug: "hidaka-kombu",
  },
];

export default function EnglishPage() {
  return (
    <main className="flex-1" lang="en">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Breadcrumb items={[{ label: "English" }]} />

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          Japanese kombu, explained in English
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-10">
          {SITE_NAME} (Konbu Suki) is a Japanese-language site about kombu — the
          kelp used to make dashi, the stock at the base of Japanese cooking.
          This page is a short English summary. The detailed articles are in
          Japanese, and most browsers will translate them well enough to follow
          the quantities and steps.
        </p>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            What kombu is
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            Kombu is a brown seaweed, harvested mostly in Hokkaido in northern
            Japan, then dried. It is not eaten raw. Soaking it in water, or
            heating it gently, draws out glutamate — the savoury taste often
            called umami — and that liquid is dashi. One sheet goes a long way:
            a common ratio is 10&nbsp;g of kombu to 1&nbsp;litre of water.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Different growing areas give noticeably different dashi, which is
            why Japanese recipes name the region rather than just &quot;kelp&quot;.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            The four main regions
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Where it grows</th>
                  <th className="py-2 font-medium">How it tastes</th>
                </tr>
              </thead>
              <tbody>
                {REGIONS.map((r) => (
                  <tr key={r.slug} className="border-b border-gray-100">
                    <td className="py-3 pr-4 font-bold text-gray-900">{r.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{r.where}</td>
                    <td className="py-3 text-gray-600">{r.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Making dashi: the short version
          </h2>
          <ol className="space-y-3 text-sm text-gray-600 leading-relaxed list-decimal pl-5">
            <li>
              Wipe the surface lightly with a dry cloth. Do not wash off the
              white powder — that is part of the taste.
            </li>
            <li>
              Soak 10&nbsp;g of kombu in 1&nbsp;litre of cold water for 30
              minutes to a few hours (overnight in the fridge also works).
            </li>
            <li>
              Heat slowly and take the kombu out before the water boils. Boiling
              it makes the dashi slippery and bitter.
            </li>
            <li>
              The used kombu is still food in Japan — it is simmered in soy
              sauce, chopped into rice, or eaten with the dish.
            </li>
          </ol>
        </section>

        <section className="mb-12 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <h2 className="text-base font-bold text-gray-900 mb-3">
            One thing to know about iodine
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Kombu contains a large amount of iodine — far more than other
            seaweeds. Japan&apos;s Dietary Reference Intakes set a tolerable
            upper intake level of 3,000&nbsp;µg per day for adults (Ministry of
            Health, Labour and Welfare). Eating kombu as part of meals is
            ordinary in Japan, but taking it in large amounts every day, or as a
            supplement, can exceed that level. If you have a thyroid condition,
            ask a doctor. This site reports published figures and does not claim
            health effects.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Ordering from outside Japan
          </h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            The products listed here are sold by Japanese shops that ship within
            Japan only, and the Kombu Box we introduce is also domestic-only. We
            do not ship abroad ourselves.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            If you are outside Japan, the usual route is a{" "}
            <strong className="font-bold text-gray-900">
              proxy-purchase or package-forwarding service
            </strong>
            : the service gives you a Japanese address, buys on your behalf, and
            forwards the parcel to your country. We do not recommend a specific
            service — whether a service will handle food, and whether your
            country allows the item in, differs by service and by destination.
            Please check both before ordering.
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Dried kombu is a food product, so your country&apos;s import rules
            apply. Some countries restrict or prohibit food in international
            mail. Checking your own customs and postal rules first saves the
            parcel.
          </p>
        </section>

        <section className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Where to read more (Japanese)
          </h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/guide/kombu-katsuo-dashi" className="text-[#2d6a4f] underline">
                Kombu and katsuo dashi — quantities and steps
              </Link>
            </li>
            <li>
              <Link href="/guide/kombu-seaweed-types" className="text-[#2d6a4f] underline">
                How kombu differs from wakame, hijiki and nori
              </Link>
            </li>
            <li>
              <Link href="/guide" className="text-[#2d6a4f] underline">
                All articles
              </Link>
            </li>
            <li>
              <Link href="/about" className="text-[#2d6a4f] underline">
                About this site
              </Link>
            </li>
          </ul>
        </section>

        <p className="text-xs text-gray-500">
          {SITE_URL} · Written in Japan. Figures come from Japanese government
          sources cited in the Japanese articles.
        </p>
      </div>
    </main>
  );
}
