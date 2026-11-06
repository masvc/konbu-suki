/**
 * 記事の OGP 画像（1200x630）を作る。
 *
 * Usage:
 *   npx tsx scripts/generate-og-images.ts            # 足りない分だけ作る
 *   npx tsx scripts/generate-og-images.ts --force    # 全部作り直す
 *   npx tsx scripts/generate-og-images.ts <slug>     # 1本だけ
 *
 * **元はアイキャッチ（public/guide/<slug>.webp）を使う。** 生成し直さない理由:
 *   - 記事ページの絵とSNSに出る絵が同じになる。別々に生成すると、同じ記事なのに
 *     見た目が違うものが2枚できる
 *   - 画像生成の呼び出しが2倍になる。アイキャッチは 1200x675 で既にあり、
 *     16:9 から 1.91:1 への切り出しで足りる
 *
 * アイキャッチが無い記事は作れないので、その旨を出して飛ばす。先に
 * generate-guide-images.ts でアイキャッチを作る。
 */
import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { GUIDES } from "../src/lib/guides";

/** OGP の標準的な比率は 1.91:1。 */
const WIDTH = 1200;
const HEIGHT = 630;
/** CLAUDE.md の「全画像200KB以下」に合わせる */
const MAX_BYTES = 200 * 1024;

const PROJECT_ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(PROJECT_ROOT, "public", "og");

const args = process.argv.slice(2);
const force = args.includes("--force");
const only = args.find((a) => !a.startsWith("--"));

async function toWebp(src: string): Promise<Buffer> {
  const base = sharp(src).resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" });
  for (const quality of [82, 72, 62, 52, 42]) {
    const out = await base.clone().webp({ quality }).toBuffer();
    if (out.length <= MAX_BYTES) return out;
  }
  return base.clone().webp({ quality: 35 }).toBuffer();
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const entries = Object.entries(GUIDES).filter(([slug]) => !only || slug === only);

  let made = 0;
  let skipped = 0;
  const missing: string[] = [];

  console.log(`\nOGP画像 (${WIDTH}x${HEIGHT})\n`);
  for (const [slug, guide] of entries) {
    const out = path.join(OUT_DIR, `${slug}.webp`);
    if (!guide.image) {
      missing.push(slug);
      continue;
    }
    const src = path.join(PROJECT_ROOT, "public", guide.image.replace(/^\//, ""));
    if (!existsSync(src)) {
      missing.push(slug);
      continue;
    }
    if (existsSync(out) && !force) {
      skipped++;
      continue;
    }
    const buf = await toWebp(src);
    writeFileSync(out, buf);
    console.log(`  OK ${slug} (${(buf.length / 1024).toFixed(0)}KB)`);
    made++;
  }

  if (missing.length > 0) {
    console.log(`\n  アイキャッチが無いため作れなかった: ${missing.join(", ")}`);
    console.log("  先に npx tsx scripts/generate-guide-images.ts <slug> を実行する。");
  }

  const files = readdirSync(OUT_DIR).filter((f) => f.endsWith(".webp"));
  const over = files.filter((f) => statSync(path.join(OUT_DIR, f)).size > MAX_BYTES);
  console.log(`\nSUMMARY: 作成 ${made} / 既存 ${skipped} / 不可 ${missing.length} / 上限超え ${over.length}`);
  process.exit(missing.length > 0 ? 1 : 0);
}

main();
