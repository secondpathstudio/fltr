import { AsciiLogo } from "@/components/ascii-logo";
import { Demo } from "@/components/demo";
import { Principles } from "@/components/principles";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Term } from "@/components/term";
import { WaitlistForm } from "@/components/waitlist-form";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section aria-labelledby="hero-heading" className="container-page pt-12 pb-16 md:pt-16">
          <div className="max-w-[760px]">
            <AsciiLogo />
            <h1 id="hero-heading" className="h1-display mt-8">
              Choose your own algorithm.
              <span aria-hidden="true" className="cursor" />
            </h1>
            <p className="mt-6 max-w-[62ch] text-[clamp(17px,1.5vw,21px)] text-muted">
              Every app decides what you see. <Term>fltr</Term> lets you decide instead. Pick a <Term>fltr</Term>,
              tune it with a few dials or in plain words, and your homepage follows your rules, not an
              advertiser&apos;s.
            </p>
            <div className="mt-8">
              <WaitlistForm />
            </div>
          </div>
        </section>

        <Demo />

        <Principles />

        <section id="join" aria-labelledby="join-heading" className="scroll-mt-4 border-t border-line">
          <div className="container-page py-16">
            <h2 id="join-heading" className="h2-display">
              Get early access.
            </h2>
            <div className="mt-6">
              <WaitlistForm showPrivacyLink />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
