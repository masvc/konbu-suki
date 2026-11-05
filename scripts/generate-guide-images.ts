/**
 * ガイド記事のアイキャッチ画像をGeminiで生成
 */
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import sharp from "sharp";

/** 記事のアイキャッチの寸法。横1200px以上あると Discover で大きく出やすい。 */
const WIDTH = 1200;
const HEIGHT = 675;
/** CLAUDE.md の「全画像200KB以下」に合わせる */
const MAX_BYTES = 200 * 1024;

/**
 * 生成結果を WebP に変換する。
 *
 * 画像モデルが返すのは PNG で、そのまま .webp という名前で保存すると
 * 中身は PNG のまま 2MB を超える。拡張子だけ webp になっていても
 * 変換したことにはならない。
 *
 * 200KB に収まるまで品質を落とす。一定以下にしても収まらない場合は、
 * その時点のものを使う（画質より表示速度を優先する）。
 */
async function toWebp(png: Buffer): Promise<Buffer> {
  const base = sharp(png).resize(WIDTH, HEIGHT, { fit: "cover", position: "centre" });
  for (const quality of [82, 72, 62, 52, 42]) {
    const out = await base.clone().webp({ quality }).toBuffer();
    if (out.length <= MAX_BYTES) return out;
  }
  return base.clone().webp({ quality: 35 }).toBuffer();
}

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error("GEMINI_API_KEY missing"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: API_KEY });

const STYLE = "Minimal, clean food photography style. Deep green and warm amber tones. No text, no letters, no watermarks. Japanese kombu kelp theme. Wide 16:9 aspect ratio. Professional, warm, natural.";

const PROMPTS: Record<string, string> = {
  "kobujime-vegetables": `${STYLE} A rehydrated sheet of kombu kelp on a pale plate, topped with thin slices of yamaimo and daikon radish and a few mizuna leaves, a second kombu sheet resting beside it ready to cover. Overhead flat lay, fresh and crisp, soft daylight.`,
  "kobujime": `${STYLE} A sheet of moistened dark kombu kelp on a pale ceramic plate with thin slices of white fish laid across it, a second sheet of kombu being placed on top. Overhead, soft natural light, Japanese kitchen, clean and precise.`,
  "gagome-kombu": `${STYLE} A single piece of dried kombu kelp photographed at a slight angle in raking side light, its surface covered in a distinctive raised lattice texture like woven basketwork. Dark olive green, pale linen background, macro texture detail.`,
  "tororo-oboro": `${STYLE} Two kinds of shaved kombu side by side on a pale linen cloth: a fluffy tangled mound of fine kombu shavings on the left, and a single broad translucent sheet of shaved kombu on the right, thin enough to see through. Overhead flat lay, soft even light, texture comparison.`,
  "kombu-water": `${STYLE} A clear glass bottle of pale golden kombu water with a strip of dried kelp inside, resting on a refrigerator shelf. Cool clean light, minimal, calm.`,
  "how-to-choose-kombu": `${STYLE} Several kinds of dried kombu laid out beside small Japanese bowls and a wooden spoon on a linen cloth, overhead flat lay suggesting choosing by dish.`,
  "kombu-comparison": `${STYLE} Four pieces of dried kombu kelp laid out in a row on a pale linen cloth, clearly different in width, thickness and color from thin pale to broad dark. Overhead flat lay, even soft light, comparison composition.`,
  "kombu-types": `${STYLE} Four different types of dried kombu kelp arranged side by side on a wooden surface, each slightly different in color and thickness. Labels-free comparison layout. From dark thick (rausu) to thin light (rishiri).`,
  "how-to-make-dashi": `${STYLE} A glass pitcher of golden clear kombu dashi stock next to a piece of dried kombu on a clean white surface. Steam rising gently. Simple, instructional cooking atmosphere.`,
  "kombu-nutrition": `${STYLE} A cross-section artistic view of kombu kelp showing internal structure, surrounded by mineral icons (calcium, iron symbols as abstract shapes). Scientific yet warm illustration.`,
  "shiokombu-guide": `${STYLE} A small ceramic bowl of dark shio-kombu (salt kelp) next to a bowl of white rice and chopsticks. Traditional Japanese breakfast setting. Warm morning light.`,
  "kombu-storage": `${STYLE} Dried kombu stored in a glass jar and a wooden box on a kitchen shelf. Clean, organized pantry setting. Preservation theme.`,
  "kombu-recipes": `${STYLE} Multiple dishes featuring kombu arranged in a grid - miso soup, onigiri with tororo kombu, tsukudani on rice, kombu water in a pitcher. Recipe collection overview.`,
  "kombu-history": `${STYLE} Historical Japanese sailing ship (kitamae-bune) on the Sea of Japan with cargo. Vintage map elements in background. Kombu trade route theme. Sepia-tinted warm tones.`,
  "kombu-production": `${STYLE} Aerial view of kombu drying on a beach in Hokkaido. Workers spreading dark kelp on the shore. Blue ocean and green mountains in background. Documentary photography style.`,
};

async function generate(slug: string, prompt: string) {
  const dir = "public/guide";
  const path = `${dir}/${slug}.webp`;
  if (existsSync(path)) { console.log(`  skip ${slug}`); return; }
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  try {
    const res = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: `Generate an image: ${prompt}` }] }],
      config: { responseModalities: ["image", "text"] },
    });
    const parts = res.candidates?.[0]?.content?.parts;
    // parts は Part[] なので推論に任せる
    const img = parts?.find((p) => p.inlineData?.mimeType?.startsWith("image/"));
    if (!img?.inlineData?.data) { console.log(`  FAIL ${slug}`); return; }
    const png = Buffer.from(img.inlineData.data, "base64");
    const buf = await toWebp(png);
    writeFileSync(path, buf);
    console.log(
      `  OK ${slug} (${(png.length / 1024).toFixed(0)}KB PNG → ${(buf.length / 1024).toFixed(0)}KB WebP ${WIDTH}x${HEIGHT})`
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.log(`  FAIL ${slug}: ${message.substring(0, 80)}`);
  }
}

async function main() {
  const target = process.argv[2];
  const entries = target ? [[target, PROMPTS[target]]] : Object.entries(PROMPTS);
  console.log(`\nGenerating ${entries.length} guide images\n`);
  for (const [slug, prompt] of entries) {
    if (!prompt) continue;
    await generate(slug, prompt);
    await new Promise(r => setTimeout(r, 3000));
  }
  console.log("\nDone\n");
}
main();
