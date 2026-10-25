/**
 * Gemini (gemini-2.5-flash-image) で昆布サイト用画像を一括生成
 *
 * Usage:
 *   npx tsx scripts/generate-images.ts           # 全件
 *   npx tsx scripts/generate-images.ts hero       # 個別
 *
 * 必要: GEMINI_API_KEY in .env
 */
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import { writeFileSync, existsSync, mkdirSync } from "fs";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("GEMINI_API_KEY が .env に設定されていません");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const COMMON_STYLE =
  "Minimal, clean illustration style. Deep sea green and amber/golden brown color palette inspired by kelp and ocean. Absolutely no text, no numbers, no letters, no labels, no watermarks anywhere in the image. Japanese kelp (kombu/seaweed) theme. Wide aspect ratio 16:9. Professional, modern, warm feel with natural ocean tones.";

const IMAGE_PROMPTS: Record<string, { path: string; prompt: string }> = {
  // ヒーロー背景
  hero: {
    path: "public/hero.webp",
    prompt: `${COMMON_STYLE} Underwater scene of beautiful natural kombu (kelp) seaweed swaying gently in ocean current. Sunlight filtering through the water surface creating golden rays. Deep green kelp fronds reaching upward. Peaceful, serene, premium food photography atmosphere.`,
  },

  // No Image プレースホルダー
  "no-image": {
    path: "public/no-image.webp",
    prompt: `${COMMON_STYLE} A simple, elegant placeholder design. A single small piece of dried kombu kelp on a clean white ceramic plate, viewed from above. Minimal, zen-like composition. Very simple, mostly white space. Soft shadow.`,
  },

  // ファビコン用（正方形）
  favicon: {
    path: "public/icon.png",
    prompt: `Minimal icon design on solid deep green (#1b4332) background. A single stylized kelp/kombu leaf shape in white/light green. Simple, recognizable, works at small sizes. Square format 256x256. No text, no letters. App icon style.`,
  },

  // OGP画像
  ogp: {
    path: "public/ogp.webp",
    prompt: `${COMMON_STYLE} A beautiful arrangement of different types of Japanese kombu kelp on a dark wooden surface. Varieties include thick dashikombu, thin shredded tororo kombu, and salt kombu. Golden dashi broth in a small bowl nearby. Overhead food photography style. Premium, editorial, magazine-quality.`,
  },

  // カテゴリ画像
  "cat-dashi": {
    path: "public/category/dashi.webp",
    prompt: `${COMMON_STYLE} A single large piece of premium dashi kombu (kelp for soup stock) on a clean wooden cutting board. A small bowl of golden clear dashi broth beside it. Japanese kitchen atmosphere. Clean, appetizing food photography.`,
  },
  "cat-shiokombu": {
    path: "public/category/shiokombu.webp",
    prompt: `${COMMON_STYLE} A small mound of shio-kombu (salt kelp) on a white ceramic dish. Dark, glistening, savory appearance. A bowl of steaming white rice blurred in the background. Traditional Japanese home cooking atmosphere.`,
  },
  "cat-snack": {
    path: "public/category/snack.webp",
    prompt: `${COMMON_STYLE} Various kombu snacks arranged playfully - vinegared kombu strips, dried kombu chips, and chewy oshaburi kombu. Casual, fun, snack time atmosphere. Bright and appetizing.`,
  },
  "cat-tororo": {
    path: "public/category/tororo.webp",
    prompt: `${COMMON_STYLE} Delicate, paper-thin tororo kombu (shaved kelp) draped over an onigiri rice ball. Wispy, translucent texture visible. Traditional Japanese food aesthetic. Warm, homey atmosphere.`,
  },
  "cat-kombucha": {
    path: "public/category/kombucha.webp",
    prompt: `${COMMON_STYLE} A steaming cup of kombu tea (kombucha in Japanese style) in a traditional ceramic cup. Dried kombu tea granules scattered nearby. Warm, comforting, winter afternoon atmosphere.`,
  },
  "cat-gift": {
    path: "public/category/gift.webp",
    prompt: `${COMMON_STYLE} An elegant Japanese gift box (noshi/wrapping) containing assorted premium kombu products. Beautiful packaging with natural textures. Premium, luxurious, gift-worthy atmosphere.`,
  },

  // 産地画像
  "origin-rishiri": {
    path: "public/origin/rishiri.webp",
    prompt: `${COMMON_STYLE} Rishiri Island landscape with Mount Rishiri in the background. Rocky coastline with kelp visible in the clear shallow water. Morning golden light. Remote, pristine, premium origin atmosphere.`,
  },
  "origin-rausu": {
    path: "public/origin/rausu.webp",
    prompt: `${COMMON_STYLE} Rausu town on the Shiretoko Peninsula, Hokkaido. Fishing boats in the harbor with kelp drying racks visible. Snow-capped mountains in background. Premium, wild, natural atmosphere.`,
  },

  // こんぶBOX
  "kombu-box": {
    path: "public/kombu-box.webp",
    prompt: `${COMMON_STYLE} A beautiful kraft paper subscription box being opened, revealing assorted kombu products inside - dashi kombu, salt kombu, kombu tea, tororo kombu, each in small packages. Recipe cards peeking out. Exciting unboxing moment. Warm, inviting, discovery atmosphere.`,
  },
};

async function generateImage(slug: string, config: { path: string; prompt: string }): Promise<boolean> {
  if (existsSync(config.path)) {
    console.log(`  skip ${slug} (exists)`);
    return false;
  }

  // Ensure directory exists
  const dir = config.path.substring(0, config.path.lastIndexOf("/"));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: `Generate an image: ${config.prompt}` }] }],
      config: { responseModalities: ["image", "text"] },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find(
      (p: Record<string, unknown>) => (p as { inlineData?: { mimeType?: string } }).inlineData?.mimeType?.startsWith("image/")
    ) as { inlineData?: { data?: string } } | undefined;

    if (!imagePart?.inlineData?.data) {
      console.log(`  FAIL ${slug} (no image data)`);
      return false;
    }

    const buffer = Buffer.from(imagePart.inlineData.data, "base64");
    writeFileSync(config.path, buffer);
    console.log(`  OK ${slug} (${(buffer.length / 1024).toFixed(0)}KB) -> ${config.path}`);
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.log(`  FAIL ${slug}: ${msg.substring(0, 100)}`);
    return false;
  }
}

async function main() {
  const targetSlug = process.argv[2];
  const entries = targetSlug
    ? [[targetSlug, IMAGE_PROMPTS[targetSlug]]].filter(([, p]) => p) as [string, { path: string; prompt: string }][]
    : Object.entries(IMAGE_PROMPTS);

  console.log(`\n generating ${entries.length} images\n`);

  let generated = 0;
  for (const [slug, config] of entries) {
    console.log(`[${generated + 1}/${entries.length}] ${slug}`);
    const ok = await generateImage(slug, config);
    if (ok) generated++;
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(`\n ${generated} images generated\n`);
}

main().catch(console.error);
