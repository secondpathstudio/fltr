/**
 * Hex values of the 10 grayscale tokens, for places that can't read CSS
 * variables (email clients, next/og images). The source of truth is the :root
 * block in app/globals.css; tests/guardrails.test.ts checks the two match.
 */
export const TOKENS = {
  "--fltr-background": "#1B1B1B",
  "--fltr-surface": "#222222",
  "--fltr-lines": "#3A3A3A",
  "--fltr-text": "#E8E8E8",
  "--fltr-muted-text": "#A3A3A3",
  "--fltr-highlight": "#E8E8E8",
  "--fltr-on-highlight": "#1B1B1B",
  "--fltr-page-background": "#EFEFEF",
  "--fltr-page-text": "#161616",
  "--fltr-page-muted-text": "#555555",
} as const;

export const colors = {
  bg: TOKENS["--fltr-background"],
  surface: TOKENS["--fltr-surface"],
  line: TOKENS["--fltr-lines"],
  fg: TOKENS["--fltr-text"],
  muted: TOKENS["--fltr-muted-text"],
  hi: TOKENS["--fltr-highlight"],
  onHi: TOKENS["--fltr-on-highlight"],
  page: TOKENS["--fltr-page-background"],
  pageFg: TOKENS["--fltr-page-text"],
  pageMuted: TOKENS["--fltr-page-muted-text"],
} as const;
