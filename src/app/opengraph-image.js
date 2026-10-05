import { ImageResponse } from "next/og";
import { SITE } from "@/lib/constants";

export const runtime = "edge";
export const alt = SITE.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #4F46E5 0%, #312E81 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: 20,
              background: "rgba(255,255,255,0.15)",
              color: "white",
              fontSize: 52,
              fontWeight: 700,
            }}
          >
            T
          </div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 700, color: "white" }}>
            Tool<span style={{ color: "#A5B4FC" }}>slay</span>
          </div>
        </div>
        <div style={{ display: "flex", fontSize: 34, color: "#E0E7FF", textAlign: "center" }}>
          200+ free browser-based tools. Nothing to install.
        </div>
      </div>
    ),
    { ...size }
  );
}
