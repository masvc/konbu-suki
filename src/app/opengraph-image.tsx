import { ImageResponse } from "next/og";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export const runtime = "edge";
export const alt = `${SITE_NAME} - ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1b4332 0%, #2d6a4f 50%, #40916c 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            昆
          </div>
          <span style={{ fontSize: "48px", fontWeight: "bold", color: "white" }}>
            {SITE_NAME}
          </span>
        </div>
        <p style={{ fontSize: "24px", color: "#b7e4c7", margin: 0 }}>
          {SITE_TAGLINE}
        </p>
        <p style={{ fontSize: "16px", color: "#d8f3dc", marginTop: "16px" }}>
          昆布商品を網羅的に比較 | 産地別・用途別に探せる
        </p>
      </div>
    ),
    { ...size }
  );
}
