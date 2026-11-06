/**
 * 書いてよい文章かどうかの決まり。
 *
 * meta と SNS の生成でそれぞれ同じ禁止語リストと同じ検査を持っていた。
 * 片方だけ直すと、もう片方から同じ問題がすり抜ける。実際、Markdown の記法が
 * 混ざる問題は meta 側で見つけて両方に入れ直した。ここに1つ置く。
 *
 * CLAUDE.md のコンテンツルールを機械で見られる形にしたもの。
 */

/** 効果効能の断定。CLAUDE.md のコンテンツルールより。 */
export const BANNED_WORDS = ["効く", "治る", "予防", "痩せる", "効果的", "改善します", "解消"];

/**
 * 文体に合わない言い回し。
 *
 * このサイトは事実を淡々と書く文体で、感嘆符も宣伝文句も使っていない。
 * 生成させると「もったいない！」「ご紹介します」のような語り口が混ざり、
 * 記事本文と説明文で声が変わる。
 */
export const OFF_TONE_WORDS = [
  "おすすめです",
  "ご紹介",
  "お手伝い",
  "もったいない",
  "疑問を解決",
  "ぜひ",
  "必見",
  "徹底解説",
];

/**
 * 文脈に依存する言い回し。
 *
 * AI検索は記事の一部だけを抜き出して引用する。「上記のとおり」「下の表」は、
 * 抜き出された側だけ読むと何を指しているのか分からない。前を指すもの
 * （上記・前述・上の表）は特に意味が通らなくなる。
 */
export const CONTEXT_WORDS = [
  // 前を指すもの。抜き出された側だけ読むと特に意味が通らない
  "上記",
  "前述",
  "上の表",
  "上の図",
  "先ほど",
  // 後ろを指すもの
  "下記",
  "下の表",
  "下の図",
  "以下の表",
  "次の表",
  // その他、指す先が本文に無いと分からないもの
  "そちら",
  "あちら",
  "こちらの表",
];

/**
 * 「食中毒予防」は昆布の効能ではなく安全上の注意。
 * 外さないと、生食を避ける注意を書いた文が毎回ひっかかり、警告を見なくなる。
 */
function forWordCheck(text: string): string {
  return text.replace(/食中毒予防/g, "食中毒への注意");
}

export type Finding = string;

/** 禁止語・文体・記法・感嘆符を見る。 */
export function checkWording(text: string): Finding[] {
  const found: Finding[] = [];
  const target = forWordCheck(text);
  for (const w of BANNED_WORDS) if (target.includes(w)) found.push(`使えない表現「${w}」`);
  for (const w of OFF_TONE_WORDS) if (target.includes(w)) found.push(`文体に合わない言い回し「${w}」`);
  if (/[*_`#]/.test(text)) found.push("Markdown の記法が入っている");
  if (/[!！?？]/.test(text)) found.push("感嘆符・疑問符が入っている");
  return found;
}

/**
 * 記事に無い言葉・数字を足していないか。
 *
 * 生成で一番こわいのは、もっともらしい数値や専門語を作って入れること。
 * 記事の中にその文字列が実在するかだけを見る。
 */
export function checkInvented(text: string, articleText: string): Finding[] {
  const found: Finding[] = [];
  for (const m of text.matchAll(/[ァ-ヴー]{3,}/g)) {
    if (!articleText.includes(m[0])) found.push(`記事に無い語「${m[0]}」`);
  }
  for (const m of text.matchAll(/\d[\d,.]*/g)) {
    // 1桁は箇条書きの番号などで誤検知する
    if (m[0].length >= 2 && !articleText.includes(m[0])) found.push(`記事に無い数字「${m[0]}」`);
  }
  return found;
}

/** 文脈に依存する言い回しを見る。記事本文の検査に使う。 */
export function checkContextWords(text: string): Finding[] {
  const found: Finding[] = [];
  for (const w of CONTEXT_WORDS) {
    const n = text.split(w).length - 1;
    if (n > 0) found.push(`${w}（${n}箇所）`);
  }
  return found;
}
