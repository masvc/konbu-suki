import { Fragment } from "react";

/** **太字** だけを解釈する軽量レンダラ。記事本文とFAQ回答で使う。 */
export function InlineMarkdown({ text }: { text: string }) {
  // s フラグ（. が改行にも当たる）は tsconfig の target では使えないため、
  // [\s\S] で同じことをする。**太字** が改行をまたぐ場合に備える。
  const parts = text.split(/\*\*([\s\S]+?)\*\*/g);
  return (
    <>
      {parts.map((p, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="font-bold text-gray-900">{p}</strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** 構造化データなど、プレーンテキストが必要な場所用 */
export function stripInlineMarkdown(text: string): string {
  return text.replace(/\*\*([\s\S]+?)\*\*/g, "$1");
}
