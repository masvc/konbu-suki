/**
 * 記事本文に書かれた出典を集めて、参考文献の一覧にする。
 *
 * 出典は本文の末尾に「出典: 〜 https://…」の形で書いてある。記事ごとに別途
 * 一覧を持たせると、本文を直したときに片方だけ古くなる。本文から拾う。
 */
export type Reference = { label: string; url?: string };

/**
 * 本文から URL を取り出す。
 *
 * 日本語の文では URL の直後に句読点や括弧が続く。閉じ括弧だけを除いていたため、
 * 「…fis094.html（こんぶ漁業の漁期）」の開き括弧以降が URL に取り込まれ、
 * 参考文献のリンクが壊れていた（本番で 404 になっていた）。
 * 開き括弧・鉤括弧・読点も終わりとして扱う。
 */
const URL_RE = /https?:\/\/[^\s（）()、。「」]+/g;

/**
 * 1行ぶんの「出典: …」から、表示用のラベルとURLを取り出す。
 * 1行に複数のURLが入ることがある（「A https://… / B https://…」）ので分ける。
 */
function parseLine(line: string): Reference[] {
  const body = line.replace(/^\s*(?:※\s*)?出典[:：]\s*/, "").trim();
  if (!body) return [];

  // 「A https://… / B https://…」のように複数の出典が1行に入ることがある。
  // ただし「（塩昆布 09022 / まこんぶ 09017）」のように、括弧の中で区切りに
  // 使われていることもある。URLが2つ以上あるときだけ分ける。
  const urlCount = (body.match(URL_RE) ?? []).length;
  const parts = urlCount >= 2 ? body.split(/\s+\/\s+/) : [body];
  const out: Reference[] = [];
  for (const part of parts) {
    const urls = part.match(URL_RE);
    // 表の説明文には出典のあとに補足が続くことがある（「…。1gあたりは…」）。
    // 一覧に出すのは資料名までにする。
    const label = part
      .replace(URL_RE, "")
      .replace(/[（(]\s*[)）]/g, "")
      .trim()
      .split("。")[0]
      .trim()
      .replace(/[、,]$/, "");
    if (!label && !urls) continue;
    out.push({ label: label || (urls?.[0] ?? ""), url: urls?.[0] });
  }
  return out;
}

/** 記事の全セクション・FAQ から出典を拾い、重複を除いて返す。 */
export function collectReferences(
  sections: { body: string; table?: { caption?: string } }[]
): Reference[] {
  const seen = new Set<string>();
  const refs: Reference[] = [];

  // 同じ資料がURL付きと無しの両方で出てくることがある。資料名でも重複を見る。
  const push = (r: Reference) => {
    if (!r.label && !r.url) return;
    for (const key of [r.url, r.label].filter(Boolean) as string[]) {
      if (seen.has(key)) return;
    }
    if (r.url) seen.add(r.url);
    if (r.label) seen.add(r.label);
    refs.push(r);
  };

  for (const s of sections) {
    for (const line of s.body.split("\n")) {
      if (!/出典[:：]/.test(line)) continue;
      for (const r of parseLine(line)) push(r);
    }
    if (s.table?.caption && /出典[:：]/.test(s.table.caption)) {
      for (const r of parseLine(s.table.caption)) push(r);
    }
  }
  return refs;
}
