import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SimplePage } from "@/components/simple-page";
import { Term } from "@/components/term";

export const metadata: Metadata = {
  title: "Privacy · fltr",
  description: "How fltr.world handles your information.",
};

const RESEND_PRIVACY_URL = "https://resend.com/legal/privacy-policy";
const VERCEL_PRIVACY_URL = "https://vercel.com/legal/privacy-policy";

function H2({ children }: { children: ReactNode }) {
  return <h2 className="pt-6 font-mono text-[19px] font-bold">{children}</h2>;
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="underline underline-offset-4" rel="noreferrer">
      {children}
    </a>
  );
}

export default function PrivacyPage() {
  // Only mention Upstash when it's actually configured (read at build time).
  const usesUpstash = Boolean(process.env.UPSTASH_REDIS_REST_URL);

  return (
    <SimplePage title="Privacy">
      <p className="font-mono text-[14px] text-muted">Last updated: [LAUNCH DATE]</p>
      <p>fltr.world collects as little as possible. Here&apos;s everything we do with your information.</p>

      <H2>What we collect</H2>
      <p>
        If you join the waitlist, we store your email address and the date you confirmed. That&apos;s it. We
        don&apos;t ask for your name, and we don&apos;t build a profile of you.
      </p>
      <p>
        To stop spam, we briefly use your IP address to limit repeated signups. It&apos;s kept for a few minutes
        and is never stored with your email.
      </p>

      <H2>Why we collect it</H2>
      <p>
        Only to email you about <Term>fltr</Term>&apos;s launch and major updates. We never sell your email, share
        it with advertisers or use it to target you.
      </p>

      <H2>Who handles it</H2>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          <ExternalLink href={RESEND_PRIVACY_URL}>Resend</ExternalLink> sends our emails and stores the waitlist.
        </li>
        <li>
          <ExternalLink href={VERCEL_PRIVACY_URL}>Vercel</ExternalLink> hosts this website.
        </li>
        {usesUpstash && <li>Upstash limits repeated signups.</li>}
      </ul>
      <p>Each one processes data only to provide its service to us.</p>

      <H2>No tracking</H2>
      <p>
        This site has no ads, no analytics, no cookies and no tracking pixels. Our emails don&apos;t track whether
        you open them or click their links.
      </p>

      <H2>If you don&apos;t confirm</H2>
      <p>
        We only add you to the waitlist after you click the confirmation link. If you never click it, you&apos;re
        not on the list. Our email provider keeps a record of the confirmation email it sent for a limited time.
      </p>

      <H2>How long we keep it</H2>
      <p>Until you unsubscribe or ask us to delete it.</p>

      <H2>Your choices</H2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Every email has an unsubscribe link.</li>
        <li>To see, correct or delete your data, email [hello@fltr.world]. We&apos;ll respond within 30 days.</li>
      </ul>

      <H2>Children</H2>
      <p>fltr.world isn&apos;t directed at children under 13.</p>

      <H2>Changes</H2>
      <p>
        If we change this policy, we&apos;ll update the date above. If the change matters, we&apos;ll also email
        everyone on the waitlist.
      </p>

      <H2>Contact</H2>
      <p>
        [YOUR NAME OR COMPANY], [CONTACT ADDRESS]
        <br />
        [hello@fltr.world]
      </p>
    </SimplePage>
  );
}
