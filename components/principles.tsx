import type { ReactNode } from "react";
import { Term } from "./term";

const PRINCIPLES: { term: string; description: ReactNode }[] = [
  {
    term: "No ads, ever",
    description: (
      <>
        <Term>fltr</Term> is paid for by the people who use it, not by advertisers.
      </>
    ),
  },
  {
    term: "Open source",
    description: "Read the code that ranks your homepage. Run it yourself if you like.",
  },
  {
    term: "Yours to keep",
    description: (
      <>
        <Term>fltrs</Term> are plain <Term>.fltr</Term> files. Take yours to any app that reads them.
      </>
    ),
  },
  {
    term: "Nothing hidden",
    description: "Every story shows its sources and why it’s on your page.",
  },
];

export function Principles() {
  return (
    <section aria-labelledby="principles-heading" className="border-t border-line">
      <div className="container-page py-16">
        <h2 id="principles-heading" className="sr-only">
          Principles
        </h2>
        {/* Not a sequence, so no numbering. */}
        <dl className="max-w-[860px] border-t border-line">
          {PRINCIPLES.map((p) => (
            <div
              key={p.term}
              className="grid gap-x-8 gap-y-1 border-b border-line py-4 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]"
            >
              <dt className="font-mono text-[16px] font-bold">{p.term}</dt>
              <dd className="text-[17px] text-muted">{p.description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
