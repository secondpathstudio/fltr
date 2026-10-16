export function SiteHeader() {
  return (
    <header className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6">
      <a href="#join" className="wordmark inline-block rounded-md py-1">
        FLTR
      </a>
      <nav aria-label="Main" className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <a
          href="#format"
          className="font-bold text-primary underline decoration-2 underline-offset-4 hover:decoration-accent"
        >
          The .fltr format
        </a>
        <a
          href="#join"
          className="rounded-full border-2 border-primary bg-surface px-4 py-2 font-bold text-primary hover:bg-deck"
        >
          Join the waitlist
        </a>
      </nav>
    </header>
  );
}
