/**
 * 記事を1本の文字列として取り出す。
 *
 * 本文・表・FAQ を1つの文字列にまとめる。3つのスクリプト（fact-audit /
 * generate-meta / generate-sns）がそれぞれ同じ関数を持っていて、表の扱いが
 * 少しずつ違っていた。検査する範囲がスクリプトによって変わると、片方では
 * 通って片方では落ちる、という分かりにくい状態になる。ここに1つ置く。
 */
import { GUIDES } from "../../src/lib/guides";

type Slug = keyof typeof GUIDES;

/** 記事の全文（title・description・見出し・本文・表・FAQ）。 */
export function guideText(slug: string): string {
  const g = GUIDES[slug as Slug];
  const parts: string[] = [g.title, g.description];
  for (const s of g.sections) {
    parts.push(s.heading, s.body);
    if (s.table) {
      if (s.table.caption) parts.push(s.table.caption);
      parts.push(s.table.headers.join(" | "));
      for (const row of s.table.rows) parts.push(row.join(" | "));
    }
  }
  for (const f of g.faq ?? []) parts.push(f.q, f.a);
  return parts.join("\n");
}

/** 読み手に見える本文だけ（title・description を除く）。生成の材料に使う。 */
export function guideBody(slug: string): string {
  const g = GUIDES[slug as Slug];
  const parts: string[] = [];
  for (const s of g.sections) {
    parts.push(s.heading, s.body);
    if (s.table) {
      parts.push(s.table.caption ?? "", s.table.headers.join(" "));
      for (const r of s.table.rows) parts.push(r.join(" "));
    }
  }
  for (const f of g.faq ?? []) parts.push(f.q, f.a);
  return parts.join("\n");
}
