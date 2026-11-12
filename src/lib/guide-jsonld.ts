import { SITE_NAME, SITE_URL } from "@/lib/constants";
import type { Guide } from "@/lib/guides";
import { stripInlineMarkdown } from "@/components/InlineMarkdown";

/**
 * 記事ページの構造化データ（JSON-LD）を組み立てる。
 * 表示側（page.tsx）から切り離してあるので、構造化データを直すときはここだけ見ればよい。
 * パンくずは Breadcrumb コンポーネントが出すので、ここでは作らない（二重になる）。
 */

const organization = { "@type": "Organization", name: SITE_NAME } as const;

export function buildArticleJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.description,
    ...(guide.image ? { image: `${SITE_URL}${guide.image}` } : {}),
    author: organization,
    publisher: organization,
    datePublished: guide.datePublished,
    dateModified: guide.dateModified,
  };
}

/**
 * Recipe。材料と手順がページに見えている記事にだけ付く。
 * 構造化データと本文が食い違うと検索側に不正扱いされるので、
 * guides.ts の recipe が無い記事には出さない。
 */
export function buildRecipeJsonLd(guide: Guide) {
  const r = guide.recipe;
  if (!r) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Recipe",
    name: r.name,
    description: guide.description,
    ...(guide.image ? { image: [`${SITE_URL}${guide.image}`] } : {}),
    author: organization,
    datePublished: guide.datePublished,
    recipeCategory: r.category ?? "だし",
    recipeCuisine: "日本料理",
    ...(r.recipeYield ? { recipeYield: r.recipeYield } : {}),
    ...(r.prepTime ? { prepTime: r.prepTime } : {}),
    ...(r.cookTime ? { cookTime: r.cookTime } : {}),
    ...(r.totalTime ? { totalTime: r.totalTime } : {}),
    recipeIngredient: r.ingredients,
    recipeInstructions: r.steps.map((s) => ({
      "@type": "HowToStep",
      name: s.name,
      text: s.text,
    })),
  };
}

/** FAQPage。回答の `**` は外して、プレーンテキストで渡す。 */
export function buildFaqJsonLd(guide: Guide) {
  if (!guide.faq?.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: stripInlineMarkdown(f.a) },
    })),
  };
}
