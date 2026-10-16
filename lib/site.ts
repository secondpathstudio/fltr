const DEFAULT_SITE_URL = "https://fltr.world";

/** Canonical site origin, without a trailing slash. */
export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}
