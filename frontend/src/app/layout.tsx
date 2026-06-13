import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Lilita_One } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/components/providers/query-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lilita = Lilita_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-lilita",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arena Insights — unofficial card game stats",
  description:
    "Unofficial community stats explorer. Not affiliated with or endorsed by Supercell.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lilita.variable}`}>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1671258915903815"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className="antialiased">
        <QueryProvider>
          <TooltipProvider delayDuration={150}>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-8">{children}</main>
              <SiteFooter />
            </div>
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
