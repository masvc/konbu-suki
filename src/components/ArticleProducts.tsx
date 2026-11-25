import Image from "next/image";
import Link from "next/link";

import { amazonProductUrl, amazonSearchUrl, rakutenProductUrl, rakutenSearchUrl } from "@/lib/affiliates";

/**
 * 記事の中に出す商品カード。
 *
 * **記事のテーマと合う商品だけを1〜3件。** 出す記事と選び方は
 * src/lib/guide-products.ts にある。合うものが無ければ、このまま何も出さない。
 *
 * **広告であることを隠さない。** 「PR」の札を付け、リンクは
 * `rel="nofollow sponsored"`。開示の全文は編集方針のページにある。
 *
 * **順位・点数は付けない。** 並んでいるのは「記事に合う商品」であって、
 * 1位2位ではない（CLAUDE.md のルール）。
 *
 * クリックは GA4 に送る（`article_product_click` / `article_amazon_click` /
 * `article_rakuten_click`）。記事を入口にしたクリックが、商品ページを入口に
 * したクリックと混ざらないように、イベント名を分けている。
 *
 * **どの記事で押されたかは `page_path` で分かる**（layout.tsx のハンドラが
 * 付けている）ので、記事の slug は渡していない。
 */

export type ArticleProduct = {
  id: number;
  name: string;
  brand: string;
  price: number | null;
  imageUrl: string | null;
  weight: string | null;
  amazonAsin: string | null;
  rakutenUrl: string | null;
  rakutenId: string | null;
};

export function ArticleProducts({
  products,
  heading,
}: {
  products: ArticleProduct[];
  heading: string;
}) {
  if (products.length === 0) return null;

  return (
    <aside className="my-8 rounded-xl border border-[#d8f3dc] bg-[#f8faf8] p-4 sm:p-5">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-sm font-bold text-gray-900">{heading}</h3>
        <span className="rounded border border-gray-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
          PR
        </span>
      </div>

      <ul className="space-y-3">
        {products.map((p) => {
          const amazon = p.amazonAsin ? amazonProductUrl(p.amazonAsin) : amazonSearchUrl(p.name);
          const rakutenTarget = p.rakutenUrl || p.rakutenId;
          const rakuten = rakutenTarget ? rakutenProductUrl(rakutenTarget) : rakutenSearchUrl(p.name);
          return (
            <li key={p.id} className="rounded-lg border border-gray-100 bg-white p-3">
              <div className="flex gap-3">
                <Link
                  href={`/product/${p.id}`}
                  data-ga-event="article_product_click"
                  data-ga-product={p.name}
                  data-ga-product-id={String(p.id)}
                  className="relative w-20 h-20 shrink-0 rounded-md bg-gray-50 overflow-hidden"
                >
                  {p.imageUrl && (
                    <Image src={p.imageUrl} alt={p.name} fill className="object-contain p-1.5" sizes="80px" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${p.id}`}
                    data-ga-event="article_product_click"
                    data-ga-product={p.name}
                    data-ga-product-id={String(p.id)}
                    className="block text-sm font-medium text-gray-900 hover:text-[#2d6a4f] line-clamp-2"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {p.brand}
                    {p.weight ? ` / ${p.weight}` : ""}
                    {p.price ? ` / 参考 ${p.price.toLocaleString("ja-JP")}円` : ""}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <a
                      href={amazon}
                      target="_blank"
                      rel="noopener noreferrer nofollow sponsored"
                      data-ga-event="article_amazon_click"
                      data-ga-product={p.name}
                      data-ga-product-id={String(p.id)}
                      className="inline-flex min-h-9 items-center rounded-md bg-[#ff9900] px-3 text-xs font-medium text-white hover:bg-[#e68a00] transition"
                    >
                      Amazon
                    </a>
                    <a
                      href={rakuten}
                      target="_blank"
                      rel="noopener nofollow sponsored"
                      referrerPolicy="no-referrer-when-downgrade"
                      data-ga-event="article_rakuten_click"
                      data-ga-product={p.name}
                      data-ga-product-id={String(p.id)}
                      className="inline-flex min-h-9 items-center rounded-md bg-[#bf0000] px-3 text-xs font-medium text-white hover:bg-[#a00000] transition"
                    >
                      楽天
                    </a>
                    <Link
                      href={`/product/${p.id}`}
                      data-ga-event="article_product_click"
                      data-ga-product={p.name}
                      data-ga-product-id={String(p.id)}
                      className="inline-flex min-h-9 items-center rounded-md border border-gray-200 px-3 text-xs text-gray-600 hover:border-[#52b788] hover:text-[#2d6a4f] transition"
                    >
                      詳しく見る
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
        記事の内容に合う商品を並べています。<strong className="font-medium">順位や評価ではありません。</strong>
        リンクから購入されると当サイトが紹介料を受け取ることがあります（
        <Link href="/about/editorial-policy" className="underline hover:text-gray-700">
          編集方針
        </Link>
        ）。価格と在庫は各販売サイトでご確認ください。
      </p>
    </aside>
  );
}
