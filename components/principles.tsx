const PRINCIPLES = [
  {
    title: "No ads, ever.",
    body: "FLTR is paid for by the people who use it, not by advertisers.",
  },
  {
    title: "Open source.",
    body: "Read the code that ranks your homepage. Run it yourself if you like.",
  },
  {
    title: "Your algorithm travels.",
    body: "FLTRs are plain .fltr files. Take yours to any app that reads them.",
  },
  {
    title: "Nothing hidden.",
    body: "Every story shows its sources and why it’s on your page.",
  },
];

export function Principles() {
  return (
    <section aria-labelledby="principles-heading" className="container-page py-16">
      <h2 id="principles-heading" className="sr-only">
        Our principles
      </h2>
      {/* Not a sequence, so a plain list without visual numbering. */}
      <ul className="grid gap-x-8 gap-y-10 [grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr))]">
        {PRINCIPLES.map((p) => (
          <li key={p.title} className="border-t-[6px] border-accent pt-4">
            <h3 className="font-display text-xl font-bold text-primary">{p.title}</h3>
            <p className="mt-2 max-w-[38ch] text-muted">{p.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
