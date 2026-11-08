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
  "nanakusa-gayu-dashi": `${STYLE} A Japanese earthenware donabe pot of soft rice porridge with chopped spring greens, thin slices of white daikon and pink-red turnip, on a pale linen cloth; beside it a small glass jug of clear pale kombu dashi with a strip of dried kombu kelp resting in it, and a small bundle of fresh green herbs. Overhead, soft winter morning light, calm and simple.`,
  "kombu-processed-foods": `${STYLE} An overhead flat lay of many small Japanese dishes and saucers on a pale linen cloth, each holding a different kombu kelp product: dark glossy salted kelp strips, a fluffy mound of shaved tororo kombu, a translucent sheet of oboro kombu, small tied kelp knots, thin kelp threads, square sheets of white shiraita kelp, a small cup of pale kombu tea. Even soft light, catalogue-like grid composition.`,
  "rausu-kombu": `${STYLE} A broad sheet of dried rausu kombu kelp, warm reddish brown in color and slightly soft-looking, laid diagonally on a dark wooden board, beside a small glass bowl of slightly yellowish rich kombu dashi. Side light showing the wide leaf. Calm, premium mood.`,
  "ma-kombu": `${STYLE} A thick, wide sheet of dried ma-kombu kelp, dark olive green with a gently wavy edge, laid on a pale linen cloth; a cut end facing the camera shows a pale whitish cross-section. A small glass bowl of very clear pale dashi beside it. Soft daylight, refined and clean.`,
  "kombu-katsuo-dashi": `${STYLE} Two small glass bowls of clear Japanese dashi side by side on a pale linen cloth: the left pale and almost colorless with a strip of dried kombu kelp beside it, the right light golden with a small heap of shaved bonito flakes beside it. Overhead, soft natural light, calm comparison composition.`,
  "kobujime-hare": `${STYLE} A festive Japanese table for a new year celebration: a long lacquered platter of thinly sliced kombu-cured sea bream and flounder sashimi fanned in rows, a few sheets of broad dark rausu kombu kelp beside it, small dishes of grated ginger, a sprig of pine and a pair of chopsticks on a rest. Overhead, soft warm light, elegant and calm.`,
  "kombumaki": `${STYLE} Several glossy simmered kombu rolls tied with pale kanpyo gourd strips, some cut in half to show a core of salmon and burdock, arranged in a black lacquered Japanese new year jubako box. Overhead, warm soft light, festive but calm.`,
  "kobujime-salmon": `${STYLE} Slices of kombu-cured salmon sashimi, about one centimeter wide and glossy orange, arranged alternately with slices of camembert cheese on a pale plate, drizzled with olive oil and garnished with a few basil leaves. A sheet of moistened dark kombu kelp lies beside the plate. Overhead, soft natural light.`,
  "kobujime-tai": `${STYLE} Thin slices of kombu-cured sea bream (tai) sashimi with pink-edged white flesh, fanned on a pale plate as a carpaccio with thin rings of red onion, a few radish sprouts and a drizzle of olive oil. A sheet of dark kombu kelp and a whole cured fillet block resting on it beside the plate. Overhead, bright soft light, elegant.`,
  "kobujime-tips": `${STYLE} A cutting board with two small plates side by side: on the left, neat glossy slices of kombu-cured white fish; on the right, a few slices that look slightly firm and darker from over-curing. A sheet of moistened kombu kelp, a small dish of salt and a folded damp cloth beside them. Overhead, soft natural light, instructive comparison.`,
  "kobujime-hirame": `${STYLE} Thin translucent slices of white fish sashimi arranged on a sheet of dark moistened kombu kelp, with a finished plate of sliced kombu-cured fish and a lemon round beside it. Overhead, cool clean light, refined Japanese presentation.`,
  "kobujime-vegetables": `${STYLE} A rehydrated sheet of kombu kelp on a pale plate, topped with thin slices of yamaimo and daikon radish and a few mizuna leaves, a second kombu sheet resting beside it ready to cover. Overhead flat lay, fresh and crisp, soft daylight.`,
  "kobujime-chicken": `${STYLE} Thin pale slices of chicken breast cured between sheets of dark kombu kelp, fanned out on a plate next to a small donabe pot of clear simmering kombu broth for shabu-shabu, chopsticks resting beside. Overhead, warm soft light, homely Japanese table.`,
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
