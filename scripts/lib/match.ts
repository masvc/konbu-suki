/**
 * 商品名の突き合わせ。
 *
 * Amazon 側で持っている商品と、楽天側の検索候補が同じ物かを商品名から判定する。
 * CLAUDE.md の「商品データを捏造しない」に従い、確信が持てないものは一致と
 * しない。閾値は呼び出し側から渡す。
 *
 * 対称的な類似度（Dice など）は使わない。楽天の商品名は
 * 「【送料無料】北海道産 利尻昆布 100g ×3袋 お徳用 だし」のように販促文が
 * 長く付くため、こちらの商品名が完全に含まれていても対称類似度は低く出る。
 * 代わりに「こちらの商品名が相手にどれだけ含まれているか」を見る。
 */

/** 比較用の正規化。全角半角・大小・記号・空白の差を潰す。 */
export function normalize(text: string): string {
  return (text || "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s　]/g, "")
    .replace(/[【】[\]（）()「」『』・,.、。*＊/\\|｜+＋\-ー—–_~〜!！?？:：;；"'`#%&]/g, "");
}

function bigrams(s: string): Map<string, number> {
  const m = new Map<string, number>();
  if (s.length === 0) return m;
  if (s.length === 1) {
    m.set(s, 1);
    return m;
  }
  for (let i = 0; i < s.length - 1; i++) {
    const g = s.slice(i, i + 2);
    m.set(g, (m.get(g) || 0) + 1);
  }
  return m;
}

/** needle の文字bigramが haystack にどれだけ含まれるか。0〜1。 */
export function containment(needle: string, haystack: string): number {
  const a = bigrams(normalize(needle));
  const b = bigrams(normalize(haystack));
  let total = 0;
  let found = 0;
  for (const [g, n] of a) {
    total += n;
    found += Math.min(n, b.get(g) || 0);
  }
  return total === 0 ? 0 : found / total;
}

export type Target = {
  name: string;
  brand: string;
  price: number | null;
  weight: string | null;
};

export type Candidate = {
  itemName: string;
  itemPrice: number;
};

export type Score = {
  score: number;
  reasons: string[];
};

export function scoreCandidate(target: Target, candidate: Candidate): Score {
  const reasons: string[] = [];
  const base = containment(target.name, candidate.itemName);
  reasons.push(`名称一致 ${base.toFixed(2)}`);

  const candidateNorm = normalize(candidate.itemName);
  let bonus = 0;

  const brand = normalize(target.brand);
  if (brand.length >= 2 && candidateNorm.includes(brand)) {
    bonus += 0.12;
    reasons.push("ブランド名あり +0.12");
  }

  const weight = normalize(target.weight || "");
  if (weight.length >= 2 && candidateNorm.includes(weight)) {
    bonus += 0.08;
    reasons.push(`内容量(${target.weight})あり +0.08`);
  }

  // 価格の乖離は加点とは別に、最後に引く。加点で上限に張り付くと
  // 33倍の価格差でも満点になり、単品と大容量ケースを同一視してしまう。
  let penalty = 0;
  if (target.price && candidate.itemPrice) {
    const ratio = candidate.itemPrice / target.price;
    if (ratio >= 0.5 && ratio <= 2) {
      bonus += 0.08;
      reasons.push("価格が近い +0.08");
    } else if (ratio > 3 || ratio < 1 / 3) {
      penalty = 0.3;
      reasons.push(`価格が大きく離れている(${ratio.toFixed(1)}倍) -0.30`);
    } else {
      penalty = 0.15;
      reasons.push(`価格が離れている(${ratio.toFixed(1)}倍) -0.15`);
    }
  }

  const score = Math.max(0, Math.min(1, base + bonus) - penalty);
  return { score, reasons };
}

export function bestMatch(
  target: Target,
  candidates: Candidate[]
): { candidate: Candidate; score: Score } | null {
  let best: { candidate: Candidate; score: Score } | null = null;
  for (const candidate of candidates) {
    const score = scoreCandidate(target, candidate);
    if (!best || score.score > best.score.score) best = { candidate, score };
  }
  return best;
}
