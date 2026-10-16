import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ALL_TAPES } from "@/lib/sample-data";
import { colors } from "@/lib/tokens";

export const alt = "FLTR: your algorithm, in your pocket";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [bold, black] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Unbounded-700.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Unbounded-900.ttf")),
]);

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: colors.paper,
          fontFamily: "Unbounded",
        }}
      >
        <div style={{ display: "flex", fontSize: 44, fontWeight: 900, color: colors.primary, textShadow: `4px 3px 0 ${colors.accent}` }}>
          FLTR
        </div>
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.04, letterSpacing: "-0.02em", color: colors.primary, maxWidth: 1000 }}>
          Your algorithm, in your pocket.
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 22 }}>
          {ALL_TAPES.map((tape, i) => {
            const selected = i === 0;
            const reel = selected ? colors.onPrimary : colors.primary;
            return (
              <div
                key={tape.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: 192,
                  height: 120,
                  padding: 12,
                  borderRadius: 16,
                  border: `3px ${tape.id === "blank" ? "dashed" : "solid"} ${colors.primary}`,
                  background: selected ? colors.primary : colors.surface,
                  boxShadow: selected ? `6px 6px 0 ${colors.accent}` : `3px 3px 0 ${colors.lines}`,
                  marginTop: selected ? 0 : 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    height: 34,
                    borderRadius: 6,
                    border: tape.id === "blank" ? `2px dashed ${colors.lines}` : "none",
                    borderLeft: `6px solid ${colors.accent}`,
                    background: tape.id === "blank" ? colors.surface : colors.label,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "center", gap: 40 }}>
                  {[0, 1].map((r) => (
                    <div key={r} style={{ display: "flex", width: 30, height: 30, borderRadius: 15, border: `5px solid ${reel}` }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Unbounded", data: bold, weight: 700, style: "normal" },
        { name: "Unbounded", data: black, weight: 900, style: "normal" },
      ],
    },
  );
}
