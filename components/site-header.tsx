import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
        <Link href="/#join" className="inline-block rounded-[3px] py-1 font-mono text-[20px] leading-none font-bold text-fg">
          fltr
        </Link>
        <nav aria-label="Main" className="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[15px]">
          <Link href="/#demo" className="text-muted hover:text-fg">
            Try it
          </Link>
          <Link href="/#format" className="text-muted hover:text-fg">
            The .fltr format
          </Link>
          <Link href="/#join" className="rounded border border-fg px-3 py-1.5 text-fg hover:bg-hi hover:text-on-hi">
            Join the waitlist
          </Link>
        </nav>
      </div>
    </header>
  );
}
