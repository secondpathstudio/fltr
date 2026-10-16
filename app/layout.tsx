import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Unbounded } from "next/font/google";
import { siteUrl } from "@/lib/site";
import { colors } from "@/lib/tokens";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
});

const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const description =
  "fltr.world is an open-source homepage where you choose the algorithm. Play, remix and share FLTRs as open .fltr files. Join the waitlist.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: "FLTR: your algorithm, in your pocket",
  description,
  openGraph: {
    title: "FLTR: your algorithm, in your pocket",
    description,
    url: "/",
    siteName: "fltr.world",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FLTR: your algorithm, in your pocket",
    description,
  },
};

export const viewport: Viewport = {
  themeColor: colors.paper,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${unbounded.variable} ${atkinson.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">{children}</body>
    </html>
  );
}
