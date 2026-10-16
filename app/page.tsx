import { Principles } from "@/components/principles";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { TapeDeck } from "@/components/tape-deck";
import { WaitlistForm } from "@/components/waitlist-form";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section aria-labelledby="hero-heading" className="container-page pt-10 pb-12 md:pt-16">
          <h1 id="hero-heading" className="h1-display max-w-[14ch]">
            Your algorithm, in your pocket.
          </h1>
          <p className="mt-6 max-w-[60ch] text-[clamp(18px,1.6vw,21px)] leading-relaxed">
            A FLTR is an algorithm you own. Play one, remix it on the deck, or record your own from a blank,
            then take it to any app that reads .fltr files.
          </p>
        </section>

        <TapeDeck />

        <section id="join" aria-labelledby="join-heading" className="scroll-mt-6 border-y-2 border-dotted border-lines bg-deck">
          <div className="container-page py-16">
            <h2 id="join-heading" className="h2-display max-w-[24ch]">
              Record your first FLTR at launch.
            </h2>
            <div className="mt-8">
              <WaitlistForm />
            </div>
          </div>
        </section>

        <Principles />
      </main>
      <SiteFooter />
    </>
  );
}
