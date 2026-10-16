import type { ReactNode } from "react";
import { Body, Container, Head, Html, Preview, Text } from "react-email";
import { colors } from "@/lib/tokens";

// Web-safe fallbacks: most email clients won't load IBM Plex.
const mono = "'IBM Plex Mono', ui-monospace, Menlo, Consolas, 'Courier New', monospace";
const sans = "'IBM Plex Sans', Helvetica, Arial, sans-serif";

// Emails use the light "page" tokens: dark backgrounds get inverted unpredictably by email clients.
export const emailStyles = {
  text: { color: colors.pageFg, fontFamily: sans, fontSize: "17px", lineHeight: "1.6", margin: "0 0 16px" },
  muted: { color: colors.pageMuted, fontFamily: sans, fontSize: "15px", lineHeight: "1.55", margin: "0 0 12px" },
  link: { color: colors.pageFg, wordBreak: "break-all" as const },
  term: { fontFamily: mono, fontSize: "0.94em" },
  button: {
    display: "inline-block",
    backgroundColor: colors.pageFg,
    color: colors.page,
    fontFamily: mono,
    fontSize: "16px",
    fontWeight: 700,
    padding: "14px 20px",
    borderRadius: "4px",
    textDecoration: "none",
  },
};

/** "fltr" in the monospace face inside running text, like the site's <Term>. */
export function EmailTerm({ children }: { children: ReactNode }) {
  return <span style={emailStyles.term}>{children}</span>;
}

export function EmailLayout({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: colors.page, margin: 0, padding: "32px 16px" }}>
        <Container
          style={{
            maxWidth: "520px",
            border: `1px solid ${colors.pageMuted}`,
            borderRadius: "6px",
            padding: "28px",
          }}
        >
          <Text style={{ color: colors.pageFg, fontFamily: mono, fontSize: "20px", fontWeight: 700, margin: "0 0 20px" }}>
            fltr
          </Text>
          {children}
        </Container>
      </Body>
    </Html>
  );
}
