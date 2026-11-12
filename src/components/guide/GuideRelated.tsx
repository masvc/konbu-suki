import Link from "next/link";
import type { Guide } from "@/lib/guides";
import { BlockHeading, FooterBlock } from "./headings";

/** 関連記事への導線。 */
export function GuideRelated({ entries }: { entries: [string, Guide][] }) {
  return (
    <FooterBlock>
      <BlockHeading>関連する昆布ガイド</BlockHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {entries.map(([slug, g]) => (
          <Link
            key={slug}
            href={`/guide/${slug}`}
            className="group rounded-lg border border-gray-100 bg-white p-3 hover:border-[#52b788] transition"
          >
            <p className="text-xs font-bold text-gray-900 group-hover:text-[#2d6a4f] transition">{g.title}</p>
            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{g.description}</p>
          </Link>
        ))}
      </div>
    </FooterBlock>
  );
}
