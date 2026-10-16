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
  it('never says "filter" outside of code like Array.prototype.filter', () => {
    const offenders = files.filter((f) =>
      readFileSync(f, "utf8")
        .split("\n")
        .some((line) => /filter/i.test(line.replace(/\.filter\(/g, ""))),
    );
    expect(offenders.map((f) => relative(ROOT, f))).toEqual([]);
  });
});
