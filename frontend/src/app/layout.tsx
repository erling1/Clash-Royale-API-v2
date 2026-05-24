import type { Metadata } from "next";
import { JetBrains_Mono, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Masthead } from "@/components/masthead";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono-loaded",
  display: "swap",
});

const prose = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-prose-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "META REPORT — clashroyale.stats",
  description:
    "An editorial stats terminal for Clash Royale. Decks, cards, and players for the competitive ladder.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${mono.variable} ${prose.variable}`}>
      <body>
        <Masthead dateline="Season 23 / Day 4" updatedAgo="just now" />
        <main className="mx-auto max-w-[1440px] px-6 py-6">{children}</main>
        <footer className="mx-auto max-w-[1440px] px-6 py-8 border-t border-[var(--color-rule)] mt-12">
          <div className="flex justify-between label-dim">
            <span>clashroyale.stats — first draft</span>
            <span>data via internal actix-web API on :3000</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
