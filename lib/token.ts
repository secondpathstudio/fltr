// Signed, stateless confirmation tokens: base64url({ email, exp }) + "." + HMAC-SHA256.

import { createHmac, timingSafeEqual } from "node:crypto";

export const TOKEN_TTL_MS = 48 * 60 * 60 * 1000;

interface TokenPayload {
  email: string;
  /** Expiry, in milliseconds since the epoch. */
  exp: number;
}

function sign(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("base64url");
}

export function createToken(email: string, secret: string, now = Date.now(), ttlMs = TOKEN_TTL_MS): string {
  const payload: TokenPayload = { email, exp: now + ttlMs };
  const data = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${data}.${sign(data, secret)}`;
}

/** Returns the email for a valid, unexpired token, or null for anything else. */
export function verifyToken(token: string | null | undefined, secret: string, now = Date.now()): string | null {
  if (typeof token !== "string" || token.length > 2048) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [data, signature] = parts;

  const expected = Buffer.from(sign(data, secret));
  const actual = Buffer.from(signature);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;

  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof (payload as TokenPayload).email !== "string" ||
    typeof (payload as TokenPayload).exp !== "number"
  ) {
    return null;
  }
  const { email, exp } = payload as TokenPayload;
  if (exp <= now) return null;
  return email;
}

const DEV_SECRET = "dev-only-insecure-waitlist-secret-change-me";

export function getTokenSecret(): string {
  const secret = process.env.WAITLIST_TOKEN_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") return DEV_SECRET;
  throw new Error("WAITLIST_TOKEN_SECRET must be set to at least 32 characters");
}
