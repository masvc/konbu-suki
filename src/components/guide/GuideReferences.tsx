import Link from "next/link";
import type { Reference } from "@/lib/guide-references";
import { BlockHeading, FooterBlock } from "./headings";

/** 参考文献。本文の「出典:」行から集めたものを並べる。 */
export function GuideReferences({ references }: { references: Reference[] }) {
  if (references.length === 0) return null;
  return (
    <FooterBlock>
      <BlockHeading>参考文献</BlockHeading>
      <p className="text-xs text-gray-500 mb-3">
        この記事は次の資料をもとに書いています。いずれも実際に開いて内容を確認したものです。
        出典の扱いは
        <Link href="/about/editorial-policy" className="text-[#2d6a4f] underline">編集方針</Link>
        にまとめています。
      </p>
      <ol className="space-y-1.5 list-decimal list-inside">
        {references.map((r, i) => (
          <li key={i} className="text-xs text-gray-600">
            {r.url ? (
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-[#2d6a4f] underline break-all">
                {r.label}
              </a>
            ) : (
              r.label
            )}
          </li>
        ))}
      </ol>
    </FooterBlock>
  );
}
