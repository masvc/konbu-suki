import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/constants";
import { SOURCES } from "@/lib/sources";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: `データと出典 | ${SITE_NAME}`,
  description:
    "記事と商品情報のもとになっているデータの出所をまとめています。参照している公的資料・団体資料の一覧、商品データの取得元と更新のタイミング、画像の扱いについて。",
  alternates: { canonical: "/about/data" },
};

export default function DataPage() {
  return (
    <main className="flex-1">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Breadcrumb
          items={[{ label: "このサイトについて", href: "/about" }, { label: "データと出典" }]}
        />

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">データと出典</h1>
        <p className="text-sm text-gray-600 leading-relaxed mb-10">
          記事と商品情報が何をもとにしているかをまとめています。記事を書くときのルールは
          <Link href="/about/editorial-policy" className="text-[#2d6a4f] underline">編集方針</Link>
          にあります。
        </p>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">参照している資料</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            実際にページを開いて内容を確認したものだけを載せています。
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#f8faf8]">
                  <th scope="col" className="border border-[#b7e4c7] px-3 py-2 text-left font-bold text-gray-900 whitespace-nowrap">
                    発行元
                  </th>
                  <th scope="col" className="border border-[#b7e4c7] px-3 py-2 text-left font-bold text-gray-900">
                    資料
                  </th>
                  <th scope="col" className="border border-[#b7e4c7] px-3 py-2 text-left font-bold text-gray-900">
                    使っている内容
                  </th>
                </tr>
              </thead>
              <tbody>
                {SOURCES.map((s) => (
                  <tr key={s.url + s.title}>
                    <td className="border border-[#d8f3dc] px-3 py-2 align-top text-gray-700 whitespace-nowrap">
                      {s.publisher}
                    </td>
                    <td className="border border-[#d8f3dc] px-3 py-2 align-top text-gray-700">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2d6a4f] underline"
                      >
                        {s.title}
                      </a>
                    </td>
                    <td className="border border-[#d8f3dc] px-3 py-2 align-top text-gray-700">{s.usedFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">商品データ</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>
                商品名・ブランド・画像・購入リンクは、Amazon と楽天市場が提供する
                商品情報APIから取得しています。当サイトで作文した商品説明は使いません。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>
                価格は取得した時点のもので、変動します。表示している価格が最新である
                ことは保証できません。購入前に各販売サイトでご確認ください。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>
                説明文が入っていない商品があります。取得元に説明がない場合、
                こちらで埋めることはしません。
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-[#52b788] mt-0.5 shrink-0">&#10003;</span>
              <span>
                味わいの傾向など、商品ごとのデータが無い項目を示す場合は、
                カテゴリの一般的な傾向であることを明記します。
              </span>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">画像</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            商品画像は取得元の商品情報APIから取得したものです。記事のアイキャッチ画像は
            生成AIで作成したもので、実際の商品・産地・料理の写真ではありません。
            記事の内容を示すための挿絵として使っています。
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">点検について</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            リンク切れ、画像の欠落、商品データの重複や欠損は、毎日自動で点検しています。
            誤りや古くなった情報にお気づきの場合は
            <Link href="/contact" className="text-[#2d6a4f] underline">お問い合わせ</Link>
            からご連絡ください。訂正した内容は
            <Link href="/about/editorial-policy" className="text-[#2d6a4f] underline">編集方針</Link>
            のページに記録します。
          </p>
        </section>
      </div>
    </main>
  );
}
