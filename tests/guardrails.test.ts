// Repo-wide checks for the spec's acceptance criteria on colors and copy.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";
import { TOKENS } from "@/lib/tokens";

const ROOT = join(__dirname, "..");
const SOURCE_DIRS = ["app", "components", "emails", "lib"];

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css|mjs)$/.test(name) ? [path] : [];
  });
}

const files = SOURCE_DIRS.flatMap((d) => sourceFiles(join(ROOT, d)));

describe("color tokens", () => {
  it("lib/tokens.ts matches the :root block in globals.css", () => {
    const css = readFileSync(join(ROOT, "app/globals.css"), "utf8");
    const root = css.match(/:root\s*{([^}]*)}/)?.[1] ?? "";
    const declared = Object.fromEntries(
      [...root.matchAll(/(--fltr-[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,8})/g)].map((m) => [m[1], m[2].toUpperCase()]),
    );
    expect(declared).toEqual(TOKENS);
  });

  it("has no hex colors outside globals.css and lib/tokens.ts", () => {
    const allowed = new Set(["app/globals.css", "lib/tokens.ts"]);
    const offenders = files
      .map((f) => relative(ROOT, f))
      .filter((f) => !allowed.has(f))
      .filter((f) => /#[0-9a-fA-F]{3,8}\b/.test(readFileSync(join(ROOT, f), "utf8")));
    expect(offenders).toEqual([]);
  });
});

describe("terminology", () => {
  // Strip code that legitimately contains these letters before checking.
  const scrub = (line: string) =>
    line
      .replace(/\.filter\(/g, "")
      // Identifiers like FLTRS, BLANK_FLTR, FLTR_FORMAT.
      .replace(/\b\w*FLTR\w*\b/g, (m) => (m === "FLTR" ? m : ""));

  const offenders = (pattern: RegExp) =>
    files
      .filter((f) => readFileSync(f, "utf8").split("\n").some((line) => pattern.test(scrub(line))))
      .map((f) => relative(ROOT, f));

  it('never says "filter"', () => {
    expect(offenders(/filter/i)).toEqual([]);
  });

  it('writes the name in lowercase, never "FLTR"', () => {
    expect(offenders(/\bFLTR\b/)).toEqual([]);
  });

  it("has no tape or cassette language left", () => {
    expect(offenders(/\btapes?\b|cassette/i)).toEqual([]);
  });
});
