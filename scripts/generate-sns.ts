/**
 * 記事ごとの X 投稿文を3パターン作って docs/sns/ に置く。
 *
 * Usage:
 *   npx tsx scripts/generate-sns.ts              # 無い記事ぶんだけ作る
 *   npx tsx scripts/generate-sns.ts --force      # 作り直す
 *   npx tsx scripts/generate-sns.ts --slug kobujime
 *
 * 投稿はしない。案を置くだけ。
 *
 * 3パターンは切り口を変える。同じ記事を何度か出すときに、同じ文面を繰り返さない
 * ようにするため。
 *   1. 結論から言う（記事の答えをそのまま出す）
 *   2. 意外な事実から入る（出典にある、知られていない事実）
 *   3. 困りごとから入る（読み手の状況を先に言う）
 *
 * 記事に書いていないことを足さない。数字とカタカナ語は記事に実在するものだけを
 * 使う（generate-meta.ts と同じ考え方）。宣伝調にもしない。
 */
import "dotenv/config";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { GUIDES } from "../src/lib/guides";
import { SITE_URL } from "../src/lib/constants";

const MODEL = "gemini-2.5-flash";
const INTERVAL_MS = 1500;
/** X の上限は140字。URL は23字として数えられるので、本文はその分を引く。 */
const URL_COST = 23;
const MAX_BODY = 140 - URL_COST - 1;

const OFF_TONE = ["おすすめです", "ご紹介", "お手伝い", "ぜひ", "必見", "徹底解説", "もったいない"];
const BANNED = ["効く", "治る", "予防", "痩せる", "効果的"];

const args = process.argv.slice(2);
const force = args.includes("--force");
const onlySlug = (() => {
  const i = args.indexOf("--slug");
  return i === -1 ? null : args[i + 1] || null;
})();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY が未設定。");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: API_KEY });
const OUT_DIR = path.resolve(__dirname, "..", "docs", "sns");

function articleText(slug: string): string {
  const g = GUIDES[slug as keyof typeof GUIDES];
  const parts: string[] = [g.title, g.description];
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

function check(slug: string, text: string): string[] {
  const reasons: string[] = [];
  if (text.length > MAX_BODY) reasons.push(`${text.length}字（本文は${MAX_BODY}字まで）`);
  for (const w of [...BANNED, ...OFF_TONE]) if (text.includes(w)) reasons.push(`「${w}」`);
  if (/[*_`#]/.test(text)) reasons.push("記法が入っている");
  const body = articleText(slug);
  for (const m of text.matchAll(/[ァ-ヴー]{3,}/g)) {
    if (!body.includes(m[0])) reasons.push(`記事に無い語「${m[0]}」`);
  }
  for (const m of text.matchAll(/\d[\d,.]*/g)) {
    if (m[0].length >= 2 && !body.includes(m[0])) reasons.push(`記事に無い数字「${m[0]}」`);
  }
  return reasons;
}

async function generate(slug: string): Promise<{ posts: string[]; tokens: number }> {
  const g = GUIDES[slug as keyof typeof GUIDES];
  const conclusion = g.sections[0] ? `${g.sections[0].heading}\n${g.sections[0].body}` : "";
  const facts = g.sections
    .map((s) => s.body)
    .join("\n")
    .slice(0, 1800);

  const prompt = `昆布の専門サイトの記事について、X（旧Twitter）の投稿文を3つ書いてください。

記事タイトル: ${g.title}
狙う検索語: ${g.targetQuery ?? ""}

記事の結論:
${conclusion.slice(0, 600)}

記事の中身（ここに書かれていないことは書かないでください）:
${facts}

3つはそれぞれ切り口を変えてください。
1つ目: 結論から言う。記事の答えをそのまま出す
2つ目: 意外な事実から入る。出典にあるが、あまり知られていないこと
3つ目: 困りごとから入る。読み手の状況を先に言ってから答えにつなげる

条件:
- 1つあたり${MAX_BODY}字以内。URLは別に付けるので本文に含めない
- 事実を淡々と書く。宣伝文句（おすすめです・ご紹介します・ぜひ・必見）は使わない
- 感嘆符は使わない。絵文字も使わない
- ハッシュタグは付けない
- **記事に書かれていないことを書かない。数字とカタカナ語は記事にあるものだけ**
- 健康への効果効能を断定しない

出力は次の形式だけ。番号と本文以外は書かないでください。
1. 本文
2. 本文
3. 本文`;

  const res = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
  });
  const text = res.text ?? "";
  const posts = [...text.matchAll(/^\s*[1-3][.)]\s*(.+)$/gm)].map((m) => m[1].trim());
  return { posts, tokens: res.usageMetadata?.totalTokenCount ?? 0 };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const slugs = Object.keys(GUIDES).filter((s) => !onlySlug || s === onlySlug);
  let made = 0;
  let skipped = 0;
  let tokens = 0;

  console.log(`\nX 投稿文の生成: ${slugs.length}本 (${MODEL})\n`);
  for (const [i, slug] of slugs.entries()) {
    const out = path.join(OUT_DIR, `${slug}.md`);
    if (existsSync(out) && !force) {
      skipped++;
      continue;
    }
    const g = GUIDES[slug as keyof typeof GUIDES];
    const url = `${SITE_URL}/guide/${slug}`;
    const { posts, tokens: t } = await generate(slug);
    tokens += t;

    const lines = [`# ${g.title}`, "", `${url}`, "", "投稿はしていない。ここから選んで使う。", ""];
    let ok = 0;
    posts.forEach((post, n) => {
      const reasons = check(slug, post);
      lines.push(`## 案${n + 1}${reasons.length ? "（要確認）" : ""}`);
      lines.push("");
      lines.push("```");
      lines.push(post);
      lines.push("");
      lines.push(url);
      lines.push("```");
      lines.push("");
      lines.push(`本文 ${post.length}字 / URL込み ${post.length + URL_COST + 1}字`);
      if (reasons.length) lines.push(`要確認: ${reasons.join(" / ")}`);
      else ok++;
      lines.push("");
    });
    writeFileSync(out, lines.join("\n"));
    console.log(`[${i + 1}/${slugs.length}] ${slug}  案${posts.length}（そのまま使える ${ok}）`);
    made++;
    if (i < slugs.length - 1) await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  console.log(`\nSUMMARY: 作成 ${made} / 既存 ${skipped} / トークン ${tokens}`);
}

main();
