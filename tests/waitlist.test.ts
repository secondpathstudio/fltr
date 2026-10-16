import { describe, expect, it } from "vitest";
import { createMemoryRateLimiter } from "@/lib/rate-limit";
import { emailSchema, looksLikeBot, redactEmail } from "@/lib/waitlist";

describe("email validation", () => {
  it("trims and lowercases", () => {
    expect(emailSchema.parse("  Ada@Example.COM ")).toBe("ada@example.com");
  });

  it("rejects non-emails and addresses over 254 characters", () => {
    expect(emailSchema.safeParse("nope").success).toBe(false);
    expect(emailSchema.safeParse(42).success).toBe(false);
    expect(emailSchema.safeParse(`${"a".repeat(64)}@${"b".repeat(186)}.com`).success).toBe(false);
  });
});

describe("bot checks", () => {
  it("flags a filled honeypot", () => {
    expect(looksLikeBot({ company: "Acme", elapsedMs: 5000 })).toBe(true);
  });

  it("flags submits under 2 seconds, or with no timing", () => {
    expect(looksLikeBot({ company: "", elapsedMs: 1999 })).toBe(true);
    expect(looksLikeBot({ company: "" })).toBe(true);
    expect(looksLikeBot({ company: "", elapsedMs: 2000 })).toBe(false);
  });
});

describe("redactEmail", () => {
  it("keeps the domain and drops the local part", () => {
    const redacted = redactEmail("ada@example.com");
    expect(redacted).toMatch(/^example\.com#[0-9a-f]{10}$/);
    expect(redacted).not.toContain("ada");
  });
});

describe("memory rate limiter", () => {
  it("allows 5 requests per key per 10 minutes", async () => {
    let now = 0;
    const limiter = createMemoryRateLimiter(5, 10 * 60 * 1000, () => now);
    for (let i = 0; i < 5; i++) expect((await limiter.limit("1.2.3.4")).success).toBe(true);
    expect((await limiter.limit("1.2.3.4")).success).toBe(false);
    expect((await limiter.limit("5.6.7.8")).success).toBe(true);
    now = 10 * 60 * 1000;
    expect((await limiter.limit("1.2.3.4")).success).toBe(true);
  });
});
