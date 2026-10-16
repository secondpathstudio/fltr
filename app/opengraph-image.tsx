import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { LOGO } from "@/components/ascii-logo";
import { fltrFileName } from "@/lib/fltr";
import { colors } from "@/lib/tokens";

export const alt = "fltr: choose your own algorithm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const [regular, bold] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/IBMPlexMono-400.ttf")),
  readFile(join(process.cwd(), "assets/fonts/IBMPlexMono-700.ttf")),
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
          background: colors.bg,
          color: colors.fg,
          fontFamily: "IBM Plex Mono",
        }}
      >
        <div style={{ display: "flex", whiteSpace: "pre", fontSize: 26, lineHeight: 1.15, color: colors.muted }}>
          {LOGO}
        </div>
        {/* Two explicit lines so the block cursor sits right after "algorithm." */}
        <div style={{ display: "flex", flexDirection: "column", fontSize: 76, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
          <div style={{ display: "flex" }}>Choose your own</div>
          <div style={{ display: "flex", alignItems: "center" }}>
            algorithm.
            <div style={{ display: "flex", width: 38, height: 62, marginLeft: 12, background: colors.fg }} />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 460,
            padding: "14px 18px",
            borderRadius: 4,
            background: colors.hi,
            color: colors.onHi,
          }}
        >
          <div style={{ display: "flex", fontSize: 26, fontWeight: 700 }}>Climate without doom</div>
          <div style={{ display: "flex", fontSize: 18, opacity: 0.75 }}>{fltrFileName("Climate without doom")}</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "IBM Plex Mono", data: regular, weight: 400, style: "normal" },
        { name: "IBM Plex Mono", data: bold, weight: 700, style: "normal" },
      ],
    },
  );
}
