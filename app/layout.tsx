import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { siteUrl } from "@/lib/site";
import { colors } from "@/lib/tokens";
import "./globals.css";

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

// Only the ++tags use italic, so load just 400 italic as a separate face.
const plexMonoItalic = IBM_Plex_Mono({
  variable: "--font-plex-mono-italic",
  subsets: ["latin"],
  weight: "400",
  style: "italic",
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const title = "fltr: choose your own algorithm";
const description =
  "fltr.world is an open-source homepage where you choose the algorithm. Pick, tune and share fltrs as open .fltr files. Join the waitlist.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title,
  description,
  openGraph: { title, description, url: "/", siteName: "fltr.world", type: "website" },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = {
  themeColor: colors.bg,
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${plexMono.variable} ${plexMonoItalic.variable} ${plexSans.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
