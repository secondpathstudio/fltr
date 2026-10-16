import type { ReactNode } from "react";
import { SiteFooter } from "./site-footer";
import { SiteHeader } from "./site-header";

/** Shell for the text pages (/confirm, /privacy): same header and footer, one ~68ch column. */
export function SimplePage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="container-page flex-1 py-14">
        <div className="max-w-[68ch]">
          <h1 className="h2-display">{title}</h1>
          <div className="mt-6 space-y-4 text-[17px]">{children}</div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
