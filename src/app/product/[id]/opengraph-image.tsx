import { ImageResponse } from "next/og";
import { CATEGORIES, type CategorySlug, SITE_NAME } from "@/lib/constants";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Edge Runtime不可のため、fetch経由でデータ取得
  const { prisma } = await import("@/lib/prisma");
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
    select: { name: true, brand: true, category: true, price: true, origin: true, imageUrl: true },
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
          padding: "48px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "380px", marginRight: "48px" }}>
          {product.imageUrl ? (
            <img src={product.imageUrl} width={300} height={300} style={{ objectFit: "contain", borderRadius: "16px", background: "white", padding: "16px" }} />
          ) : (
            <div style={{ width: 300, height: 300, borderRadius: "16px", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, color: "rgba(255,255,255,0.2)" }}>K</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flex: 1 }}>
          {cat && <span style={{ fontSize: 16, color: "#b7e4c7", marginBottom: 8 }}>{cat.label}</span>}
          <span style={{ fontSize: 32, fontWeight: "bold", color: "white", lineHeight: 1.3, marginBottom: 12 }}>
            {product.name.length > 45 ? product.name.substring(0, 45) + "..." : product.name}
          </span>
          <span style={{ fontSize: 18, color: "#d8f3dc", marginBottom: 16 }}>{product.brand}</span>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {product.price && <span style={{ fontSize: 28, fontWeight: "bold", color: "#52b788" }}>&yen;{product.price.toLocaleString()}</span>}
            {product.origin && <span style={{ fontSize: 16, color: "#b7e4c7" }}>{product.origin}</span>}
          </div>
          <span style={{ position: "absolute", bottom: 48, right: 48, fontSize: 18, color: "rgba(255,255,255,0.4)" }}>{SITE_NAME}</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
