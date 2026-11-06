import { GUIDES } from "@/lib/guides";
import { SITE_NAME, SITE_URL, CATEGORIES, CATEGORY_SLUGS, ORIGINS } from "@/lib/constants";
import { SOURCES } from "@/lib/sources";

/**
 * llms.txt — AI 向けのサイト概要と主要ページの一覧。
 *
 * 置き場所は /llms.txt。中身は記事一覧から組み立てるので、記事を足せば自動で
 * 反映される。固定ファイルにすると必ず古くなる。
 *
 * 出典の一覧も載せている。このサイトは「出典を開いて確認したものだけを書く」
 * という作り方をしており、それが引用先としての判断材料になるため。
 */
export const dynamic = "force-static";
export const revalidate = 86400;

export async function GET() {
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(
    "> 昆布の専門サイト。産地・種類・だし・保存・昆布締めなどを、公的機関と業界団体の資料をもとにまとめています。"
  );
  lines.push("");
  lines.push("## このサイトの作り方");
  lines.push("");
  lines.push("- 出典は実際にページを開いて内容を確認したものだけを使います。確認できなかった資料は使いません。");
  lines.push("- 出典に書かれていないことは書きません。分からない場合は「出典が見つかりませんでした」と記事に明記します。");
  lines.push("- 健康への効果効能を断定しません。公的機関の資料にある記述でも、効果効能を断定するものは引用しません。");
  lines.push("- 記事どうしで数字が食い違っていないかを機械で検査しています。");
  lines.push("- 誤りが分かった時点で直し、訂正の内容を公開しています。");
  lines.push(`- 編集方針: ${SITE_URL}/about/editorial-policy`);
  lines.push(`- データと出典: ${SITE_URL}/about/data`);
  lines.push("");

  lines.push("## 記事");
  lines.push("");
  for (const [slug, g] of Object.entries(GUIDES)) {
    lines.push(`- [${g.title}](${SITE_URL}/guide/${slug}): ${g.description}`);
  }
  lines.push("");

  lines.push("## 産地別");
  lines.push("");
  for (const [slug, o] of Object.entries(ORIGINS)) {
    lines.push(`- [${o.label}](${SITE_URL}/origin/${slug}): ${o.area}`);
  }
  lines.push("");

  lines.push("## カテゴリ");
  lines.push("");
  for (const slug of CATEGORY_SLUGS) {
    lines.push(`- [${CATEGORIES[slug].label}](${SITE_URL}/category/${slug})`);
  }
  lines.push("");

  lines.push("## 参照している資料");
  lines.push("");
  for (const s of SOURCES) {
    lines.push(`- ${s.publisher}「${s.title}」 ${s.url} — ${s.usedFor}`);
  }
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
