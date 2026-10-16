import { ImageResponse } from "next/og";
import { colors } from "@/lib/tokens";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** A simple tape glyph: primary cassette, accent label stripe, two reels. */
export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 60,
            height: 42,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 6,
            borderRadius: 9,
            background: colors.primary,
          }}
        >
          <div style={{ display: "flex", height: 9, borderRadius: 3, background: colors.accent }} />
          <div style={{ display: "flex", justifyContent: "center", gap: 10 }}>
            {[0, 1].map((r) => (
              <div key={r} style={{ display: "flex", width: 14, height: 14, borderRadius: 7, border: `4px solid ${colors.onPrimary}` }} />
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
