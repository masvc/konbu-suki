import sharp from "sharp";

async function main() {
  const src = await sharp("public/hero.webp").toBuffer();
  const meta = await sharp(src).metadata();
  console.log("Original:", meta.width, "x", meta.height);

  const w = meta.width!;
  const h = meta.height!;
  const crop = {
    left: Math.round(w * 0.08),
    top: Math.round(h * 0.08),
    width: Math.round(w * 0.84),
    height: Math.round(h * 0.84),
  };

  await sharp(src)
    .extract(crop)
    .resize(1400, undefined, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile("public/hero-trimmed.webp");

  const trimMeta = await sharp("public/hero-trimmed.webp").metadata();
  console.log("Trimmed:", trimMeta.width, "x", trimMeta.height);
}

main();
