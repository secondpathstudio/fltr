/**
 * Hex values of the 10 color tokens, for places that can't read CSS variables
 * (email clients, next/og images). The source of truth is the :root block in
 * app/globals.css; tests/guardrails.test.ts checks the two stay identical.
 */
export const TOKENS = {
  "--fltr-primary": "#0078BF",
  "--fltr-accent": "#FF48B0",
  "--fltr-ink": "#0D3B66",
  "--fltr-muted-text": "#2E5B85",
  "--fltr-paper": "#FBFCFD",
  "--fltr-surface": "#FFFFFF",
  "--fltr-deck-tint": "#EAF3FA",
  "--fltr-label-tint": "#FFB8DF",
  "--fltr-lines": "#9CC8E6",
  "--fltr-on-primary": "#FFFFFF",
} as const;

export const colors = {
  primary: TOKENS["--fltr-primary"],
  accent: TOKENS["--fltr-accent"],
  ink: TOKENS["--fltr-ink"],
  muted: TOKENS["--fltr-muted-text"],
  paper: TOKENS["--fltr-paper"],
  surface: TOKENS["--fltr-surface"],
  deck: TOKENS["--fltr-deck-tint"],
  label: TOKENS["--fltr-label-tint"],
  lines: TOKENS["--fltr-lines"],
  onPrimary: TOKENS["--fltr-on-primary"],
} as const;
