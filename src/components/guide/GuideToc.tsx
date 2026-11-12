import type { GuideSection } from "@/lib/guides";

/** セクションのアンカー ID。目次と本文で同じ規則を使う。 */
export const sectionAnchor = (index: number) => `section-${index}`;

/** 目次。章が3つ以上あるときだけ出す。 */
export function GuideToc({ sections }: { sections: GuideSection[] }) {
  if (sections.length <= 2) return null;
  return (
    <nav className="rounded-xl border border-gray-100 bg-[#f8faf8] p-4 mb-8">
      <p className="text-xs font-bold text-gray-700 mb-2">目次</p>
      <ol className="space-y-1.5">
        {sections.map((s, i) => (
          <li key={i}>
            <a href={`#${sectionAnchor(i)}`} className="text-xs text-[#2d6a4f] hover:underline">
              {i + 1}. {s.heading}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
