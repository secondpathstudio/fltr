import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { SimplePage } from "@/components/simple-page";
import { welcomeEmail } from "@/lib/emails";
import { getMailer } from "@/lib/resend";
import { getTokenSecret, verifyToken } from "@/lib/token";
import { redactEmail } from "@/lib/waitlist";

export const metadata: Metadata = {
  title: "Confirm your spot · FLTR",
  robots: { index: false, follow: false },
};

type Outcome = "confirmed" | "invalid" | "error";

async function confirm(token: string | undefined): Promise<Outcome> {
  let email: string | null;
  try {
    email = verifyToken(token, getTokenSecret());
  } catch (error) {
    console.error(`[confirm] ${String(error)}`);
    return "error";
  }
  if (!email) return "invalid";
  try {
    const mailer = getMailer();
    // Re-confirming is fine: an existing contact is treated as success.
    const { created } = await mailer.addToWaitlist(email);
    console.info(`[confirm] ${created ? "added" : "re-confirmed"} ${redactEmail(email)}`);
    if (created && process.env.SEND_WELCOME_EMAIL === "true") {
      try {
        await mailer.sendEmail(await welcomeEmail(email));
      } catch (error) {
        // The signup itself worked; a missing welcome email isn't worth an error page.
        console.error(`[confirm] welcome email failed for ${redactEmail(email)}: ${String(error).replaceAll(email, redactEmail(email))}`);
      }
    }
    return "confirmed";
  } catch (error) {
    console.error(`[confirm] failed for ${redactEmail(email)}: ${String(error).replaceAll(email, redactEmail(email))}`);
    return "error";
  }
}

async function ConfirmResult({ searchParams }: { searchParams: PageProps<"/confirm">["searchParams"] }) {
  const { token } = await searchParams;
  // Token expiry depends on the current time, so this must run per request.
  await connection();
  const outcome = await confirm(typeof token === "string" ? token : undefined);

  if (outcome === "confirmed") {
    return (
      <SimplePage title="You're on the list.">
        <p>You&apos;re on the list. We&apos;ll email you when FLTR opens.</p>
        <p>
          <Link href="/" className="font-bold text-primary underline underline-offset-4">
            Back to fltr.world
          </Link>
        </p>
      </SimplePage>
    );
  }

  if (outcome === "error") {
    return (
      <SimplePage title="Something went wrong.">
        <p>Something went wrong on our side. Try the link again in a minute.</p>
        <p>
          <Link href="/" className="font-bold text-primary underline underline-offset-4">
            Back to fltr.world
          </Link>
        </p>
      </SimplePage>
    );
  }

  return (
    <SimplePage title="This link didn't work.">
      <p>This link has expired or isn&apos;t valid. Head back to fltr.world and sign up again.</p>
      <p>
        <Link href="/#join" className="font-bold text-primary underline underline-offset-4">
          Sign up again
        </Link>
      </p>
    </SimplePage>
  );
}

export default function ConfirmPage({ searchParams }: PageProps<"/confirm">) {
  return (
    <Suspense
      fallback={
        <SimplePage title="Confirming your spot…">
          <p role="status">One moment.</p>
        </SimplePage>
      }
    >
      <ConfirmResult searchParams={searchParams} />
    </Suspense>
  );
}
