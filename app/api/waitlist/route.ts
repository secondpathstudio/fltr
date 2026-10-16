import { NextResponse, type NextRequest } from "next/server";
import { confirmationEmail } from "@/lib/emails";
import { getRateLimiter } from "@/lib/rate-limit";
import { getMailer } from "@/lib/resend";
import { siteUrl } from "@/lib/site";
import { createToken, getTokenSecret } from "@/lib/token";
import { emailSchema, looksLikeBot, redactEmail, waitlistRequestSchema } from "@/lib/waitlist";

// One response for every accepted request (new, duplicate, or bot), so the
// endpoint can't be used to check who is on the list.
const ACCEPTED = { ok: true } as const;

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function fail(error: "invalid_email" | "rate_limited" | "server_error", status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function POST(request: NextRequest) {
  const { success } = await getRateLimiter().limit(clientIp(request));
  if (!success) return fail("rate_limited", 429);

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return fail("invalid_email", 400);
  }
  const body = waitlistRequestSchema.safeParse(json);
  if (!body.success) return fail("invalid_email", 400);

  if (looksLikeBot(body.data)) return NextResponse.json(ACCEPTED);

  const parsed = emailSchema.safeParse(body.data.email);
  if (!parsed.success) return fail("invalid_email", 400);
  const email = parsed.data;

  try {
    const token = createToken(email, getTokenSecret());
    const origin = process.env.NEXT_PUBLIC_SITE_URL ? siteUrl() : request.nextUrl.origin;
    const confirmUrl = `${origin}/confirm?token=${encodeURIComponent(token)}`;
    await getMailer().sendEmail(await confirmationEmail(email, confirmUrl));
    console.info(`[waitlist] sent confirmation to ${redactEmail(email)}`);
  } catch (error) {
    // Provider messages can echo the address back, so scrub it before logging.
    const detail = String(error).replaceAll(email, redactEmail(email));
    console.error(`[waitlist] failed to send confirmation to ${redactEmail(email)}: ${detail}`);
    return fail("server_error", 500);
  }

  return NextResponse.json(ACCEPTED);
}
