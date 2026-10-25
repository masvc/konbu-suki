import { ImageResponse } from "next/og";
import { CATEGORIES, type CategorySlug, SITE_NAME } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const { prisma } = await import("@/lib/prisma");
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: { name: true, brand: true, category: true, price: true, origin: true },
  });

  if (!product) {
    return new ImageResponse(
      <div style={{ background: "#1b4332", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 32 }}>
        {SITE_NAME}
      </div>,
      { ...size }
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
          fontFamily: "sans-serif",
        }}
      >
        {cat && <span style={{ fontSize: 18, color: "#b7e4c7", marginBottom: 12 }}>{cat.label}</span>}
        <span style={{ fontSize: 40, fontWeight: "bold", color: "white", lineHeight: 1.3, marginBottom: 16 }}>
          {product.name.length > 50 ? product.name.substring(0, 50) + "..." : product.name}
        </span>
        <span style={{ fontSize: 20, color: "#d8f3dc", marginBottom: 24 }}>{product.brand}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          {product.price && <span style={{ fontSize: 32, fontWeight: "bold", color: "#52b788" }}>&yen;{product.price.toLocaleString()}</span>}
          {product.origin && <span style={{ fontSize: 18, color: "#b7e4c7" }}>{product.origin}</span>}
        </div>
        <span style={{ position: "absolute", bottom: 48, right: 64, fontSize: 20, color: "rgba(255,255,255,0.4)" }}>{SITE_NAME}</span>
      </div>
    ),
    { ...size }
  );
}
