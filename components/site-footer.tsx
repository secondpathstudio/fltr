import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t-2 border-dotted border-lines">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-8">
        <Link href="/" className="font-display text-xl font-bold text-primary">
          FLTR.world
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-muted">
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy
          </Link>
          <p>Built in the open.</p>
        </div>
      </div>
    </footer>
  );
}
