import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import Link from "next/link";

/** Shell for the small text pages (/confirm, /privacy). */
export function SimplePage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <header className="container-page py-6">
        <Link href="/" className="wordmark rounded-md">
          FLTR
        </Link>
      </header>
      <main className="container-page flex-1 py-12">
        <div className="max-w-[65ch] rounded-[22px] border-2 border-primary bg-surface p-[clamp(20px,4vw,40px)] shadow-riso">
          <h1 className="h2-display">{title}</h1>
          <div className="mt-6 space-y-4 text-lg">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
