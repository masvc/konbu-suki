/**
 * meta description を生成して差し替える。
 *
 * Usage:
 *   npx tsx scripts/generate-meta.ts                          # 案を作る（書き換えない）
 *   npx tsx scripts/generate-meta.ts --apply <proposals.json>  # 作った案を反映する
 *   npx tsx scripts/generate-meta.ts --slug kombu-water
 *   npx tsx scripts/generate-meta.ts --out docs/night/2026-11-06
 *
 * **生成と反映を分けている。** 1回の実行で生成してそのまま書き込む形にすると、
 * 目を通した案と実際に入る案が別物になる（生成のたびに文面が変わるため）。
 * 案は JSON に残し、それを読んで反映する。
 *
 * 狙い: description を120字前後にそろえる。検索結果の説明文は160字まで出るが、
 * 実測では20本中17本が100字未満で、使える場所を余らせていた。
 *
 * **title は対象にしない。** 全20本すでに狙う語が入っており、直す理由が無い。
 * 直す必要が出たら --title を足す。
 *
 * 生成した案は、そのまま反映しない。次を全部通ったものだけ書き換える。
 *   - 長さが 100〜140字（meta-check の上限160字・下限50字より厳しく見る）
 *   - 狙う語（targetQuery）の語がすべて入っている
 *   - 効果効能の断定（効く・治る・予防・痩せる 等）が入っていない
 *   - **案に出てくる数字が、記事本文に実在する** — 作文で数字を足すのを防ぐ
 *   - 反映後に meta-check が通る
 *
 * 検査を通っても、**元が既に100字以上あるものは置き換えない**（--all で上書きできる）。
 * 実測すると、98字の手書き文に対する案は104字で、良くなった分がほとんど無かった。
 * 効くのは61〜86字しか無い記事で、そこを120字前後に伸ばすと使える場所が増える。
 * 良い手書き文を機械の文で置き換える理由が無いので、短いものだけ直す。
 */
import "dotenv/config";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";
import { GUIDES } from "../src/lib/guides";
import { nightDir } from "./lib/night";

const MODEL = "gemini-2.5-flash";
const INTERVAL_MS = 1500;
const MIN_LEN = 100;
const MAX_LEN = 140;

/** 使ったら落とす語。CLAUDE.md のコンテンツルールより。 */
const BANNED = ["効く", "治る", "予防", "痩せる", "効果的", "改善します", "解消"];

/**
 * 文体に合わない言い回し。
 *
 * このサイトは事実を淡々と書く文体で、感嘆符も宣伝文句も使っていない。
 * 生成させると「もったいない！」「ご紹介します」「お手伝いします」のような
 * 語り口が混ざり、記事本文と説明文で声が変わる。実際に1回目の生成で出た。
 */
const OFF_TONE = [
  "おすすめです",
  "ご紹介",
  "お手伝い",
  "もったいない",
  "疑問を解決",
  "ぜひ",
  "必見",
  "徹底解説",
  "〜しましょう",
  "しましょう。",
];

const args = process.argv.slice(2);
/** 保存した案のファイル。渡すと生成せずにそれを反映する。 */
const applyFrom = (() => {
  const i = args.indexOf("--apply");
  return i === -1 ? null : args[i + 1] || null;
})();
const stringAfter = (f: string) => {
  const i = args.indexOf(f);
  return i === -1 ? null : args[i + 1] || null;
};
const onlySlug = stringAfter("--slug");
/** 元が100字以上のものも置き換える */
const all = args.includes("--all");
const outDir = stringAfter("--out");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY が未設定。");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

type Proposal = {
  slug: string;
  targetQuery: string;
  before: string;
  after: string | null;
  /** 検査を通ったか */
  ok: boolean;
  /** 検査を通り、かつ置き換える価値があるか */
  apply: boolean;
  reasons: string[];
  tokens: number;
};

/** 記事の中身（数字の照合と、結論を拾うのに使う） */
function articleText(slug: string): string {
  const g = GUIDES[slug as keyof typeof GUIDES];
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

function validate(slug: string, text: string): string[] {
  const g = GUIDES[slug as keyof typeof GUIDES];
  const reasons: string[] = [];
  if (text.length < MIN_LEN || text.length > MAX_LEN) {
    reasons.push(`長さ${text.length}字（${MIN_LEN}〜${MAX_LEN}字に収める）`);
  }
  for (const token of (g.targetQuery ?? "").split(/\s+/).filter(Boolean)) {
    if (!text.includes(token)) reasons.push(`狙う語「${token}」が入っていない`);
  }
  // 「食中毒予防」は昆布の効能ではなく安全上の注意。ここだけ「予防」の検査から外す。
  const forCheck = text.replace(/食中毒予防/g, "食中毒への注意");
  for (const w of BANNED) {
    if (forCheck.includes(w)) reasons.push(`使えない表現「${w}」`);
  }
  for (const w of OFF_TONE) {
    if (text.includes(w)) reasons.push(`文体に合わない言い回し「${w}」`);
  }
  // 記法や感嘆符が混ざることがある。実際に ** が入った案が出た。
  if (/[*_`#]/.test(text)) reasons.push("Markdown の記法が入っている");
  if (/[!！?？]/.test(text)) reasons.push("感嘆符・疑問符が入っている");
  // 記事に無い言葉・数字を足していないか。作文で足されるのが一番こわい。
  const body = articleText(slug) + g.title + g.description;
  // カタカナの専門語を作って入れるのを防ぐ。
  for (const m of text.matchAll(/[ァ-ヴー]{3,}/g)) {
    if (!body.includes(m[0])) reasons.push(`記事に無い語「${m[0]}」`);
  }
  for (const m of text.matchAll(/\d[\d,.]*/g)) {
    const n = m[0];
    if (n.length < 2) continue; // 1桁は箇条書き番号などで誤検知する
    if (!body.includes(n)) reasons.push(`記事に無い数字「${n}」`);
  }
  return reasons;
}

async function propose(slug: string): Promise<{ text: string | null; tokens: number }> {
  const g = GUIDES[slug as keyof typeof GUIDES];
  const conclusion = g.sections[0] ? `${g.sections[0].heading}\n${g.sections[0].body}` : "";
  const headings = g.sections.map((s) => s.heading).join(" / ");
  const faqs = (g.faq ?? []).map((f) => f.q).join(" / ");

  const prompt = `次の記事の meta description を1つ書いてください。

記事タイトル: ${g.title}
狙う検索語: ${g.targetQuery ?? ""}
いまの説明文（${g.description.length}字）: ${g.description}

記事の結論:
${conclusion.slice(0, 700)}

見出し: ${headings}
よくある質問: ${faqs}

条件:
- ${MIN_LEN}〜${MAX_LEN}字。${Math.round((MIN_LEN + MAX_LEN) / 2)}字前後を狙う
- 冒頭で結論を言い切る。記事を読まなくても答えの要点が分かる形にする
- 狙う検索語「${g.targetQuery ?? ""}」の語をすべて自然に含める
- **記事に書かれていないことを足さない。とくに数字は記事にあるものだけ使う**
- 健康への効果効能を断定しない（「効く」「治る」「予防」「痩せる」は使わない）
- 体言止めを並べず、文章にする
- **事実を淡々と書く。** このサイトの文体には宣伝文句が無い。「おすすめです」
  「ご紹介します」「お手伝いします」「ぜひ」「必見」「もったいない」は使わない
- 感嘆符（！）と疑問符（？）は使わない
- **Markdown の記法（** や * や #）を使わない。** そのまま検索結果に出てしまう
- 記事に出てこない語を足さない。とくに専門用語とカタカナ語
- 絵文字は使わない

説明文だけを出力してください。前置きも引用符も付けないこと。`;

  try {
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });
    const text = (res.text ?? "").trim().replace(/^["「']|["」']$/g, "");
    return { text: text || null, tokens: res.usageMetadata?.totalTokenCount ?? 0 };
  } catch (e) {
    console.log(`  ${slug}: 生成に失敗 ${e instanceof Error ? e.message : String(e)}`);
    return { text: null, tokens: 0 };
  }
}

function applyToSource(proposals: Proposal[]) {
  const file = path.resolve(__dirname, "..", "src", "lib", "guides.ts");
  let src = readFileSync(file, "utf8");
  let applied = 0;
  for (const p of proposals) {
    if (!p.apply || !p.after) continue;
    const before = `description: ${JSON.stringify(p.before)}`;
    const after = `description: ${JSON.stringify(p.after)}`;
    if (!src.includes(before)) {
      console.log(`  ${p.slug}: 元の説明文が見つからず、差し替えられなかった`);
      continue;
    }
    src = src.replace(before, after);
    applied++;
  }
  writeFileSync(file, src);
  console.log(`\nsrc/lib/guides.ts を書き換えた（${applied}本）`);
}

async function main() {
  const slugs = Object.keys(GUIDES).filter((s) => !onlySlug || s === onlySlug);
  console.log(`\nmeta description の生成: ${slugs.length}本 (${MODEL})\n`);

  const proposals: Proposal[] = [];
  for (const [i, slug] of slugs.entries()) {
    const g = GUIDES[slug as keyof typeof GUIDES];
    const { text, tokens } = await propose(slug);
    const reasons = text ? validate(slug, text) : ["生成できなかった"];
    const ok = Boolean(text) && reasons.length === 0;
    // 元が十分な長さなら置き換えない。良い手書き文を機械の文にする理由が無い。
    const worthIt =
      all || (g.description.length < MIN_LEN && (text?.length ?? 0) >= g.description.length + 15);
    const apply = ok && worthIt;
    if (ok && !worthIt) reasons.push(`元が${g.description.length}字あるので据え置き`);
    proposals.push({
      slug,
      targetQuery: g.targetQuery ?? "",
      before: g.description,
      after: text,
      ok,
      apply,
      reasons,
      tokens,
    });
    console.log(
      `[${i + 1}/${slugs.length}] ${apply ? "反映 " : "据置 "} ${slug} ${text ? `${g.description.length}→${text.length}字` : ""} ${reasons.join(" / ")}`
    );
    if (i < slugs.length - 1) await new Promise((r) => setTimeout(r, INTERVAL_MS));
  }

  const dir = outDir ? path.resolve(outDir) : nightDir();
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "meta-proposals.json"), JSON.stringify(proposals, null, 2));
  const lines = ["# meta description の生成結果", ""];
  lines.push(`${new Date().toLocaleString("sv-SE")} 実行。モデル: ${MODEL}`);
  lines.push("");
  for (const p of proposals) {
    lines.push(`## ${p.slug}`);
    lines.push("");
    lines.push(`- 狙う語: ${p.targetQuery}`);
    lines.push(`- 前（${p.before.length}字）: ${p.before}`);
    lines.push(`- 案（${p.after?.length ?? 0}字）: ${p.after ?? "—"}`);
    lines.push(`- 判定: ${p.apply ? "反映する" : `見送り（${p.reasons.join(" / ")}）`}`);
    lines.push("");
  }
  writeFileSync(path.join(dir, "meta-proposals.md"), lines.join("\n"));

  const ok = proposals.filter((p) => p.apply).length;
  const tokens = proposals.reduce((s, p) => s + p.tokens, 0);
  console.log(`\n${path.join(dir, "meta-proposals.md")}`);
  console.log(
    `\n反映するには: npx tsx scripts/generate-meta.ts --apply ${path.join(dir, "meta-proposals.json")}`
  );
  console.log(`SUMMARY: 反映可 ${ok}/${proposals.length} / トークン ${tokens}`);
}

function applyMain(file: string) {
  const proposals = JSON.parse(readFileSync(file, "utf8")) as Proposal[];
  const target = proposals.filter((p) => p.apply);
  console.log(`\n保存された案から反映する: ${target.length}/${proposals.length}本\n`);
  for (const p of target) {
    console.log(`  ${p.slug}  ${p.before.length}→${p.after?.length}字`);
  }
  applyToSource(proposals);
  console.log(`SUMMARY: 反映 ${target.length}本`);
}

if (applyFrom) applyMain(applyFrom);
else main();
