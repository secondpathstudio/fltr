import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { TOKEN_TTL_MS, createToken, verifyToken } from "@/lib/token";

const SECRET = "test-secret-that-is-at-least-32-characters-long";
const NOW = Date.UTC(2026, 9, 16);

describe("confirmation tokens", () => {
  it("round-trips the email", () => {
    const token = createToken("ada@example.com", SECRET, NOW);
    expect(verifyToken(token, SECRET, NOW + 1000)).toBe("ada@example.com");
  });

  it("is base64url payload + '.' + signature", () => {
    const [data, sig] = createToken("ada@example.com", SECRET, NOW).split(".");
    expect(JSON.parse(Buffer.from(data, "base64url").toString())).toEqual({
      email: "ada@example.com",
      exp: NOW + TOKEN_TTL_MS,
    });
    expect(sig).toMatch(/^[A-Za-z0-9_-]{43}$/);
  });

  it("expires after 48 hours", () => {
    const token = createToken("ada@example.com", SECRET, NOW);
    expect(verifyToken(token, SECRET, NOW + TOKEN_TTL_MS - 1)).toBe("ada@example.com");
    expect(verifyToken(token, SECRET, NOW + TOKEN_TTL_MS)).toBeNull();
  });

  it("rejects a tampered payload", () => {
    const [, sig] = createToken("ada@example.com", SECRET, NOW).split(".");
    const forged = Buffer.from(JSON.stringify({ email: "eve@example.com", exp: NOW + TOKEN_TTL_MS })).toString("base64url");
    expect(verifyToken(`${forged}.${sig}`, SECRET, NOW)).toBeNull();
  });

  it("rejects a tampered signature", () => {
    const token = createToken("ada@example.com", SECRET, NOW);
    const flipped = token.slice(0, -1) + (token.endsWith("A") ? "B" : "A");
    expect(verifyToken(flipped, SECRET, NOW)).toBeNull();
  });

  it("rejects a token signed with another secret", () => {
    const token = createToken("ada@example.com", "another-secret-that-is-also-32-characters", NOW);
    expect(verifyToken(token, SECRET, NOW)).toBeNull();
  });

  it.each([undefined, null, "", "abc", "a.b.c", ".", "not-base64!.sig"])("rejects malformed input %j", (token) => {
    expect(verifyToken(token, SECRET, NOW)).toBeNull();
  });

  it("rejects a correctly signed payload with the wrong shape", () => {
    const data = Buffer.from(JSON.stringify({ email: 42 })).toString("base64url");
    const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
    expect(verifyToken(`${data}.${sig}`, SECRET, NOW)).toBeNull();
  });
});
