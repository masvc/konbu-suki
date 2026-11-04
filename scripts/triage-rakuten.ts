/**
 * 楽天照合の判定結果を「自動で書き換える分」と「人が見る分」に振り分ける。
 *
 * Usage:
 *   npx tsx scripts/triage-rakuten.ts scripts/tmp/rakuten-match-2026-11-05.json
 *
 * 線の引き方:
 *   score >= 0.85  → 自動で商品ページ直リンクに書き換える
 *   0.72 〜 0.85   → レビュー用CSVに出す（書き換えない）
 *   未一致         → 現状の検索リンクのまま（何もしない）
 *
 * ただし score が 0.85 を超えていても、次の2つはCSV送りにする。
 * スコアだけでは弾けない誤りが実際にあったため。
 *   - 相手だけが複数個入り（単品360mlに対して12本入りケースが0.85で当たった）
 *   - 価格が離れている（内容量違いや別グレードのことが多い）
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const AUTO_THRESHOLD = 0.85;
const REVIEW_THRESHOLD = 0.72;

type Row = {
  id: number;
  name: string;
  brand: string;
  matched: boolean;
  score: number | null;
  reasons: string[];
  rakutenItemName: string | null;
  rakutenItemCode: string | null;
  rakutenUrl: string | null;
  rakutenPrice: number | null;
};

const inputFile = process.argv[2];
if (!inputFile) {
  console.error("判定結果のJSONを渡す。例: npx tsx scripts/triage-rakuten.ts scripts/tmp/rakuten-match-YYYY-MM-DD.json");
  process.exit(1);
}

const OUT_DIR = path.resolve(__dirname, "tmp");
const APPLY_FILE = path.join(OUT_DIR, "rakuten-apply.json");
const CSV_FILE = path.join(OUT_DIR, "review-rakuten.csv");

/** 相手だけが複数個入り。こちらも複数個入りなら問題ない。 */
const MULTI_PACK = /[×x]\s*\d+|\d+\s*(本|袋|個|箱|パック)入|ケース|まとめ買い/;
function onlyCandidateIsMultiPack(row: Row): boolean {
  if (!row.rakutenItemName) return false;
  return MULTI_PACK.test(row.rakutenItemName) && !MULTI_PACK.test(row.name);
}

function priceIsFar(row: Row): boolean {
  return row.reasons.some((r) => r.includes("離れ"));
}

function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

function main() {
  const rows = JSON.parse(readFileSync(inputFile, "utf8")) as Row[];

  const apply: Row[] = [];
  const review: { row: Row; why: string }[] = [];
  let untouched = 0;

  for (const row of rows) {
    const score = row.score ?? 0;
    const usable = Boolean(row.rakutenUrl && row.rakutenItemCode);

    if (!row.matched || !usable || score < REVIEW_THRESHOLD) {
      untouched++;
      continue;
    }
    if (score < AUTO_THRESHOLD) {
      review.push({ row, why: `スコアが ${AUTO_THRESHOLD} 未満` });
      continue;
    }
    if (onlyCandidateIsMultiPack(row)) {
      review.push({ row, why: "相手だけ複数個入り" });
      continue;
    }
    if (priceIsFar(row)) {
      review.push({ row, why: "価格が離れている" });
      continue;
    }
    apply.push(row);
  }

  writeFileSync(APPLY_FILE, JSON.stringify(apply, null, 2));

  const header = [
    "商品ID", "こちらの商品名", "ブランド", "スコア", "保留理由",
    "楽天の商品名", "楽天価格", "楽天URL", "判定根拠",
  ];
  const lines = [header.map(csvCell).join(",")];
  for (const { row, why } of review) {
    lines.push([
      row.id, row.name, row.brand, row.score, why,
      row.rakutenItemName, row.rakutenPrice, row.rakutenUrl, row.reasons.join(" / "),
    ].map(csvCell).join(","));
  }
  // Excel が UTF-8 と判断できるよう BOM を付ける
  writeFileSync(CSV_FILE, "﻿" + lines.join("\n") + "\n");

  console.log(`入力: ${inputFile}（${rows.length}件）`);
  console.log(`  自動で書き換える : ${apply.length}件 → ${APPLY_FILE}`);
  console.log(`  レビュー待ち     : ${review.length}件 → ${CSV_FILE}`);
  console.log(`  触らない（未一致）: ${untouched}件`);
  const why = new Map<string, number>();
  for (const r of review) why.set(r.why, (why.get(r.why) || 0) + 1);
  console.log(`  保留の内訳: ${[...why].map(([k, v]) => `${k} ${v}`).join(" / ")}`);
  console.log(`SUMMARY: 書き換え ${apply.length} / レビュー ${review.length} / 未一致 ${untouched}`);
}

main();
