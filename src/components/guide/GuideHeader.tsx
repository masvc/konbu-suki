import type { Guide } from "@/lib/guides";

/** タイトル・説明・更新日。いつ時点の内容かが分からないと、数字を扱う記事は読み手が判断できない。 */
export function GuideHeader({ guide }: { guide: Pick<Guide, "title" | "description" | "datePublished" | "dateModified"> }) {
  return (
    <>
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{guide.title}</h1>
      <p className="text-sm text-gray-500 mb-3">{guide.description}</p>
      <p className="text-xs text-gray-400 mb-6">
        <time dateTime={guide.dateModified}>{guide.dateModified}</time> 更新
        {guide.dateModified !== guide.datePublished && (
          <>
            <span className="mx-1.5">/</span>
            <time dateTime={guide.datePublished}>{guide.datePublished}</time> 公開
          </>
        )}
      </p>
    </>
  );
}
