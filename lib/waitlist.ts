import { createHash } from "node:crypto";
import { z } from "zod";

/** Minimum time between page load and submit; anything faster is treated as a bot. */
export const MIN_SUBMIT_MS = 2000;

export const emailSchema = z.string().trim().toLowerCase().max(254).pipe(z.email());

export const waitlistRequestSchema = z.object({
  email: z.unknown(),
  /** Honeypot: hidden from people, so any value means a bot filled it in. */
  company: z.string().max(500).optional(),
  /** Milliseconds the form was open before submit, reported by the client. */
  elapsedMs: z.number().finite().optional(),
});

export function looksLikeBot(body: { company?: string; elapsedMs?: number }): boolean {
  if (body.company && body.company.trim() !== "") return true;
  return typeof body.elapsedMs !== "number" || body.elapsedMs < MIN_SUBMIT_MS;
}

/** Log-safe stand-in for an email address: its domain plus a short hash. Never log the full address. */
export function redactEmail(email: string): string {
  const domain = email.split("@")[1] ?? "unknown";
  const hash = createHash("sha256").update(email).digest("hex").slice(0, 10);
  return `${domain}#${hash}`;
}
