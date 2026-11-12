import type { GuideSection } from "@/lib/guides";
import { InlineMarkdown } from "@/components/InlineMarkdown";
import { SectionHeading } from "./headings";
import { GuideTable } from "./GuideTable";
import { sectionAnchor } from "./GuideToc";

/** 記事本文。章見出し・本文（太字つき）・表を並べる。 */
export function GuideSections({ sections }: { sections: GuideSection[] }) {
  return (
    <div className="space-y-8">
      {sections.map((section, i) => (
        <section key={i} id={sectionAnchor(i)}>
          <SectionHeading>{section.heading}</SectionHeading>
          <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            <InlineMarkdown text={section.body} />
          </div>
          {section.table && <GuideTable table={section.table} />}
        </section>
      ))}
    </div>
  );
}
