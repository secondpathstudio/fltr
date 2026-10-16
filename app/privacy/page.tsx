import type { Metadata } from "next";
import Link from "next/link";
import { SimplePage } from "@/components/simple-page";

export const metadata: Metadata = {
  title: "Privacy · FLTR",
  description: "How fltr.world handles your email address.",
};

export default function PrivacyPage() {
  return (
    <SimplePage title="How we handle your email">
      <p>
        When you join the waitlist, we send one email asking you to confirm. Your address is only saved
        after you click that link.
      </p>
      <p>
        We store confirmed addresses with Resend, our email provider, and use them only to email you about
        the launch of FLTR. We don&apos;t sell or share your address, and we don&apos;t show ads.
      </p>
      <p>
        Every email has an unsubscribe link. If you&apos;d like your address deleted, reply to any email from
        us and we&apos;ll remove it.
      </p>
      <p>
        This site has no third-party scripts, cookies, tracking pixels or analytics. Our server logs never
        record your full email address.
      </p>
      <p>
        <Link href="/" className="font-bold text-primary underline underline-offset-4">
          Back to fltr.world
        </Link>
      </p>
    </SimplePage>
  );
}
