/**
 * ガイド画像のファイルサイズを上限内に収める。
 *
 * Usage:
 *   npx tsx scripts/optimize-guide-images.ts          # 上限超えを探して出す
 *   npx tsx scripts/optimize-guide-images.ts --write   # 書き換える
 *
 * generate-guide-images.ts は生成時に200KB以内へ落とすが、その処理を入れる前に
 * 作った画像は上限を超えたまま残っている。寸法は変えない。横幅を揃える処理を
 * 兼ねると、正方形で作った既存画像が切り取られてしまう。
 */
import { readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

/** CLAUDE.md の「全画像200KB以下」に合わせる */
const MAX_BYTES = 200 * 1024;
const DIR = path.resolve(__dirname, "..", "public", "guide");

const write = process.argv.slice(2).includes("--write");

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(0)}KB`;
}

async function shrink(file: string): Promise<void> {
  const full = path.join(DIR, file);
  const before = statSync(full).size;
  if (before <= MAX_BYTES) return;

  const image = sharp(full);
  const { width, height } = await image.metadata();

  // 品質だけを落として寸法は保つ。入りきらない場合は最後の結果を使う
  // （画質より表示速度を優先する）。
  let out: Buffer | null = null;
  for (const quality of [78, 70, 62, 54, 46, 38]) {
    out = await sharp(full).webp({ quality }).toBuffer();
    if (out.length <= MAX_BYTES) break;
  }
  if (!out) return;

  console.log(
    `${file}  ${kb(before)} → ${kb(out.length)}  (${width}x${height} のまま)${write ? "" : "  ※ --write で書き換え"}`
  );
  if (write) writeFileSync(full, out);
}

async function main() {
  const files = readdirSync(DIR).filter((f) => f.endsWith(".webp"));
  const over = files.filter((f) => statSync(path.join(DIR, f)).size > MAX_BYTES);

  console.log(`\nガイド画像 ${files.length}件 / 上限(${kb(MAX_BYTES)})超え ${over.length}件\n`);
  if (over.length === 0) {
    console.log("すべて上限内。\n");
    return;
  }
  for (const file of over) await shrink(file);
  console.log("");
}

main();
