/**
 * ガイド記事のアイキャッチ画像をGeminiで生成
 */
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFileSync, existsSync, mkdirSync } from "fs";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) { console.error("GEMINI_API_KEY missing"); process.exit(1); }
const ai = new GoogleGenAI({ apiKey: API_KEY });

const STYLE = "Minimal, clean food photography style. Deep green and warm amber tones. No text, no letters, no watermarks. Japanese kombu kelp theme. Wide 16:9 aspect ratio. Professional, warm, natural.";

const PROMPTS: Record<string, string> = {
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
    const img = parts?.find((p: any) => p.inlineData?.mimeType?.startsWith("image/")) as any;
    if (!img?.inlineData?.data) { console.log(`  FAIL ${slug}`); return; }
    const buf = Buffer.from(img.inlineData.data, "base64");
    writeFileSync(path, buf);
    console.log(`  OK ${slug} (${(buf.length/1024).toFixed(0)}KB)`);
  } catch (e: any) {
    console.log(`  FAIL ${slug}: ${e.message?.substring(0,80)}`);
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
