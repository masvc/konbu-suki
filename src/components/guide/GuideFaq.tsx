import type { FAQ } from "@/lib/guides";
import { FaqAccordion } from "@/components/FaqAccordion";
import { BlockHeading } from "./headings";

/** 記事末尾のFAQ。構造化データは page 側（buildFaqJsonLd）で出している。 */
export function GuideFaq({ items }: { items?: FAQ[] }) {
  if (!items?.length) return null;
  return (
    <section className="mt-10">
      <BlockHeading size="lg">よくある質問</BlockHeading>
      <FaqAccordion items={items} />
    </section>
  );
}
