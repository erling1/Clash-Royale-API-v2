import Link from "next/link";
import { Crown } from "lucide-react";

const NAV: { label: string; href: "/" | "/cards" | "/decks" | "/players" | "/clans" | "/battles" | "/rankings" }[] = [
  { label: "Overview", href: "/" },
  { label: "Cards", href: "/cards" },
  { label: "Decks", href: "/decks" },
  { label: "Players", href: "/players" },
  { label: "Clans", href: "/clans" },
  { label: "Battles", href: "/battles" },
  { label: "Rankings", href: "/rankings" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <Crown className="h-7 w-7 text-gold drop-shadow-[0_0_8px_rgba(245,201,72,0.6)] transition-transform group-hover:scale-110" />
          <span className="font-display text-2xl tracking-wide text-fg text-glow-gold">
            Arena Insights
          </span>
        </Link>
        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-bg-panel-hover hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
