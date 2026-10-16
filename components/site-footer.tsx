import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line font-mono text-[14px]">
      <div className="container-page flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-6">
        <Link href="/" className="text-fg">
          fltr.world
        </Link>
        <Link href="/privacy" className="text-muted underline underline-offset-4 hover:text-fg">
          Privacy
        </Link>
      </div>
    </footer>
  );
}
