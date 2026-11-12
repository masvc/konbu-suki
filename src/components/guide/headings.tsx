import type { ReactNode } from "react";

/**
 * 記事ページの見出しスタイルをここに集める。
 * 本文の章見出し・FAQ・参考文献などで見た目がずれないようにするため、
 * 色や余白を変えるときはこのファイルだけ直す。
 */

/** 本文の章見出し（左に緑の線） */
export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 border-l-4 border-[#52b788] pl-3">
      {children}
    </h2>
  );
}

/** 記事末尾のブロック見出し（FAQ・参考文献・関連記事） */
export function BlockHeading({ children, size = "base" }: { children: ReactNode; size?: "base" | "lg" }) {
  return (
    <h2
      className={`font-bold text-gray-900 mb-4 ${size === "lg" ? "text-base sm:text-lg" : "text-base"}`}
    >
      {children}
    </h2>
  );
}

/** 記事末尾の区切りブロック（上に罫線） */
export function FooterBlock({ children }: { children: ReactNode }) {
  return <section className="mt-10 pt-8 border-t border-gray-100">{children}</section>;
}
