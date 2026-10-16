import type { ReactNode } from "react";
import { Body, Container, Head, Html, Preview, Text } from "react-email";
import { colors } from "@/lib/tokens";

const font = "'Atkinson Hyperlegible', Arial, Helvetica, sans-serif";

export const emailStyles = {
  text: { color: colors.ink, fontFamily: font, fontSize: "17px", lineHeight: "1.55", margin: "0 0 16px" },
  muted: { color: colors.muted, fontFamily: font, fontSize: "15px", lineHeight: "1.5", margin: "0 0 12px" },
  link: { color: colors.primary, wordBreak: "break-all" as const },
  button: {
    display: "inline-block",
    backgroundColor: colors.primary,
    color: colors.onPrimary,
    fontFamily: font,
    fontSize: "17px",
    fontWeight: 700,
    padding: "14px 22px",
    borderRadius: "12px",
    border: `2px solid ${colors.primary}`,
    boxShadow: `4px 4px 0 ${colors.accent}`,
    textDecoration: "none",
  },
};

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.paper, margin: 0, padding: "32px 16px" }}>
        <Container
          style={{
            maxWidth: "520px",
            backgroundColor: colors.surface,
            border: `2px solid ${colors.primary}`,
            borderRadius: "18px",
            padding: "28px",
          }}
        >
          <Text
            style={{
              color: colors.primary,
              fontFamily: "Arial Black, Arial, sans-serif",
              fontSize: "26px",
              fontWeight: 900,
              margin: "0 0 20px",
              textShadow: `3px 2px 0 ${colors.accent}`,
            }}
          >
            FLTR
          </Text>
          {children}
        </Container>
      </Body>
    </Html>
  );
}
