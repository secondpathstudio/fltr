import type { ReactNode } from "react";

/** The name "fltr" (or ".fltr", "fltrs") in the monospace face, inside running sans-serif text. */
export function Term({ children }: { children: ReactNode }) {
  return <span className="term">{children}</span>;
}
