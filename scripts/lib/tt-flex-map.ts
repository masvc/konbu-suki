/**
 * True Temper / Project X フレックス対応表
 *
 * 公式サイトの数字フレックス（5.5, 6.0, 6.5 等）と
 * DB の文字フレックス（R, S, X 等）の変換。
 *
 * 表にない組み合わせは推測でマッチさせず未マッチに残す。
 */

/** PX 標準フレックス変換（多くの Project X モデルで共通） */
export const PX_STANDARD_FLEX: Record<string, string> = {
  "4.5": "L",
  "5.0": "R",
  "5.5": "S",
  "6.0": "S",
  "6.5": "X",
  "7.0": "X",
};

/** HZRDUS 系: 重量帯ごとの数字フレックス → DB フレックス
 *  HZRDUS は重量帯(50/60/70/80)×数字flex の組み合わせ */
export const HZRDUS_FLEX: Record<string, string> = {
  "5.5": "R",
  "6.0": "S",
  "6.5": "X",
  "6.5TX": "TX",
  "TX": "TX",
  "TX-TourX": "TX",
};

/** DG 系フレックスコード: S200, X100 等はそのまま使う */
export const DG_FLEX_CODES = ["R300", "R400", "S200", "S300", "S400", "X100", "X200"] as const;

/** 複合フレックス (ACCRA, SteelFiber等) の分解 */
export function parseCompoundFlex(flex: string): string | null {
  // "M4/S" → "S", "M5/X" → "X", "M3/R" → "R"
  const slash = flex.match(/\/([A-Z]+)$/);
  if (slash) return slash[1];
  // "F4(S)" → "S", "F5(X)" → "X"
  const paren = flex.match(/\(([A-Z]+)\)/);
  if (paren) return paren[1];
  // "F4-S" → "S"
  const dash = flex.match(/-([A-Z]+)$/);
  if (dash) return dash[1];
  // "6.5（X）" → "X"
  const jpParen = flex.match(/（([A-Z]+)）/);
  if (jpParen) return jpParen[1];
  return null;
}

/**
 * 公式フレックスを DB フレックスに変換
 * @returns DB flex string or null if not in mapping
 */
export function officialFlexToDb(officialFlex: string, isHzrdus: boolean): string | null {
  // DG-style flex codes: return as-is (DB stores these in the name)
  if (DG_FLEX_CODES.includes(officialFlex as typeof DG_FLEX_CODES[number])) {
    return officialFlex;
  }
  // Simple letter flex
  if (/^[RLSXA]$/.test(officialFlex)) return officialFlex;
  // Wedge/Putter
  if (/Wedge|Putter/i.test(officialFlex)) return officialFlex;
  // Compound flex
  const compound = parseCompoundFlex(officialFlex);
  if (compound) return compound;
  // Numeric flex
  const map = isHzrdus ? HZRDUS_FLEX : PX_STANDARD_FLEX;
  return map[officialFlex] ?? null;
}
