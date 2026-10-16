import { ImageResponse } from "next/og";
import { colors } from "@/lib/tokens";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** A block cursor glyph, light on dark. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 10,
          background: colors.bg,
        }}
      >
        <div style={{ display: "flex", width: 24, height: 40, background: colors.fg }} />
      </div>
    ),
    size,
  );
}
