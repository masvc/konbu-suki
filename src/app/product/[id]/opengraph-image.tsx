import { ImageResponse } from "next/og";
import { CATEGORIES, type CategorySlug, SITE_NAME } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { prisma } = await import("@/lib/prisma");
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: { name: true, brand: true, category: true, origin: true },
  });

  // Noto Sans JP フォント読み込み（表示文字でサブセット化）
  const textForFont = [product?.name, product?.brand, product?.origin, SITE_NAME, "コンブスキー"].filter(Boolean).join("");
  const fontData = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&display=swap&text=${encodeURIComponent(textForFont)}`
  ).then(async (res) => {
    const css = await res.text();
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (!match) return null;
    return fetch(match[1]).then((r) => r.arrayBuffer());
  }).catch(() => null);

  if (!product) {
    return new ImageResponse(
      <div style={{ background: "#1b4332", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 32, fontFamily: "Noto Sans JP" }}>
        {SITE_NAME}
      </div>,
      { ...size, ...(fontData ? { fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700 as const }] } : {}) }
    );
  }

  const cat = CATEGORIES[product.category as CategorySlug];

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "64px 80px",
          fontFamily: "Noto Sans JP, sans-serif",
        }}
      >
        {cat && <span style={{ fontSize: 18, color: "#b7e4c7", marginBottom: 12 }}>{cat.label}</span>}
        <span style={{ fontSize: 40, fontWeight: 700, color: "white", lineHeight: 1.4, marginBottom: 16 }}>
          {product.name.length > 45 ? product.name.substring(0, 45) + "..." : product.name}
        </span>
        <span style={{ fontSize: 20, color: "#d8f3dc", marginBottom: 24 }}>{product.brand}</span>
        {product.origin && <span style={{ fontSize: 16, color: "#b7e4c7" }}>{product.origin}</span>}
        <span style={{ position: "absolute", bottom: 48, right: 64, fontSize: 20, color: "rgba(255,255,255,0.4)" }}>{SITE_NAME}</span>
      </div>
    ),
    { ...size, ...(fontData ? { fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700 as const }] } : {}) }
  );
}
