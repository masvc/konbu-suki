import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: `編集方針 | ${SITE_NAME}`,
  description:
    "記事を書くときに守っているルールをまとめています。出典の扱い、書かない表現、数値の示し方、誤りが見つかったときの訂正の手順、アフィリエイトの開示について。",
  alternates: { canonical: "/about/editorial-policy" },
};

/** 公開している訂正。日付の新しいものを上に置く。 */
const CORRECTIONS = [
  {
    date: "2026-11-08",
    page: "昆布の保存方法",
    href: "/guide/kombu-storage",
    body: "取っただしの日持ちを「冷蔵2〜3日 / 冷凍1か月ほど」と書いていましたが、根拠となる出典を確認できませんでした。日本昆布協会が示している昆布水（水出し）の「冷蔵庫で1週間くらい」「夏場などはできるだけ早目に」に差し替え、煮出しのだしは日数を示した出典が無いことを明記しました。あわせて、だしの昆布の量を「水1リットルに10g」から、協会の「10g〜20g程度」に揃えました。",
  },
  {
    date: "2026-11-08",
    page: "昆布の生産と産地",
    href: "/guide/kombu-production",
    body: "「等級は見た目の規格で決まるもので、味の優劣を表すものではありません」と書いていましたが、根拠となる出典を確認できませんでした。該当の一文を削除し、北海道ぎょれん「浜からご家族に届くまで」をもとに、等級が選別（色つや・重量・幅等の基準）と検査を経て付くことに書き換えました。あわせて、出典の無かった漁の手順（竿で引き上げる、など）を同資料の工程に差し替え、漁期に同資料の「早いところで5月から9月の中ごろまで」を加えました。",
  },
  {
    date: "2026-11-06",
    page: "昆布の栄養成分",
    href: "/guide/kombu-nutrition",
    body: "まこんぶ（素干し）の成分値を、出典に挙げていた日本食品標準成分表（八訂）の値と食い違うまま載せていました（エネルギー145kcal、カルシウム710mg、マグネシウム510mg、鉄3.9mg など）。八訂増補2023年の値（エネルギー170kcal、カルシウム780mg、マグネシウム530mg、鉄3.2mg）に直しました。あわせて、出典の無かった「塩昆布・おやつ昆布は1日10〜20g程度」という目安を削除しました。成分表では塩昆布のヨウ素の値が載っておらず、量の目安を示す根拠が無いためです。",
  },
  {
    date: "2026-11-05",
    page: "昆布の歴史と昆布ロード",
    href: "/guide/kombu-history",
    body: "「大阪は日本最大の昆布消費地です」と書いていましたが、根拠となる出典を確認できませんでした。農林水産省の資料が引用する総務省統計局「家計調査」（2024年）では、富山市の一世帯あたりの昆布の年間支出金額が1,618円で、全国平均702円の2倍以上とされています。該当箇所を訂正し、支出額の出典を明記しました。",
  },
  {
    date: "2026-11-05",
    page: "昆布の保存方法",
    href: "/guide/kombu-storage",
    body: "「適切に保存すれば1年以上品質を維持できます」および蔵囲いによる熟成の記述を削除しました。いずれも保存期間を示す出典を確認できなかったためです。保存期間は「袋の表示に従う」に置き換えています。",
  },
];

export default function EditorialPolicyPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Breadcrumb
          items={[{ label: "このサイトについて", href: "/about" }, { label: "編集方針" }]}
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">編集方針</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-10">
          記事を書くときに守っているルールです。昆布は食べるものを扱うため、
          確かめられないことを書かないことを最優先にしています。
        </p>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">出典の扱い</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>
                出典は、実際にそのページを開いて内容を確認したものだけを使います。
                確認できなかった資料は、内容が正しそうに見えても使いません。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>
                引用は原文の表現をそのまま使い、どの出典のどの記述かが分かるように書きます。
                使っている出典は<Link href="/about/data" className="text-[#2d6a4f] underline">データと出典</Link>にまとめています。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>
                出典に書かれていないことは書きません。分からない場合は
                「出典が見つかりませんでした」と記事に明記します。
                空欄を埋めるために推測で補うことはしません。
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">書かない表現</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-gray-300 mt-0.5 shrink-0">&#10007;</span>
              <span>
                健康への効果効能を断定する表現は使いません。「効く」「治る」「予防する」
                「痩せる」といった書き方はしません。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-300 mt-0.5 shrink-0">&#10007;</span>
              <span>
                <strong className="font-bold text-gray-700">公的機関の資料にある記述でも、効果効能を断定するものは引用しません。</strong>
                成分については「含まれている」「研究が進められている」といった事実の記載に留めます。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-gray-300 mt-0.5 shrink-0">&#10007;</span>
              <span>
                昆布を食べる量に触れる記事には、ヨウ素の過剰摂取に関する注意を入れます。
                甲状腺に疾患のある方は医師にご相談ください。
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">数値の示し方</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-3">
            分量や時間は、出典に記載のある数値をそのまま使います。出典によって数値が違う場合は、
            どちらかに寄せず、出典ごとに並べて示します。
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            出典が無い数値は書きません。目安として示す場合は「目安です」と明記し、
            条件によって変わることを添えます。商品の味わいの傾向を示す場合は、
            カテゴリの一般的な傾向であり個々の商品で異なることを明記します。
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">記事の作成について</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            記事の作成にはAIを使っています。出典は人が開いて確認する前提で運用しており、
            確認できた記述だけを根拠にしています。アイキャッチ画像は生成AIで作成したもので、
            実際の商品や産地の写真ではありません。
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">誤りが見つかったとき</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-6">
            誤りが分かった時点で記事を直し、何をどう直したかをこのページに残します。
            記述を消すだけにはしません。お気づきの点があれば
            <Link href="/contact" className="text-[#2d6a4f] underline">お問い合わせ</Link>
            からご連絡ください。
          </p>

          <h3 className="text-sm font-bold text-gray-900 mb-3">訂正の記録</h3>
          <div className="space-y-4">
            {CORRECTIONS.map((c, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-[#f8faf8] p-5">
                <p className="text-xs text-gray-500 mb-1">{c.date}</p>
                <p className="text-sm font-bold text-gray-900 mb-2">
                  <Link href={c.href} className="text-[#2d6a4f] underline">
                    {c.page}
                  </Link>
                </p>
                <p className="text-sm text-gray-600 leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-3">アフィリエイトの開示</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            当サイトの商品リンクにはアフィリエイトリンクを使用しており、リンク経由で
            購入された場合に当サイトが紹介料を受け取ることがあります。紹介料の有無で
            掲載や評価を変えることはしません。商品情報や価格は変更される場合があります。
            最新情報は各販売サイトでご確認ください。
          </p>
        </section>
      </div>
    </main>
  );
}
