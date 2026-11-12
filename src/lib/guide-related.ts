import { GUIDES, type Guide, type GuideSlug } from "@/lib/guides";

/**
 * 関連記事を引く。guide.related があればそれを使い、未指定のときだけ先頭から埋める。
 * 全記事で先頭から埋めると、どの記事を開いても同じ4本が並ぶだけになり、
 * 記事が増えるほど内部リンクとして働かなくなる。
 */
export function getRelatedGuides(slug: string, guide: Guide, fallbackCount = 4): [string, Guide][] {
  if (guide.related?.length) {
    return guide.related
      .filter((s) => s !== slug && GUIDES[s as GuideSlug])
      .map((s) => [s, GUIDES[s as GuideSlug]]);
  }
  return Object.entries(GUIDES)
    .filter(([s]) => s !== slug)
    .slice(0, fallbackCount);
}
