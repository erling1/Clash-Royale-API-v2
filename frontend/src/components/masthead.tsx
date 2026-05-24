import Link from "next/link";
import { Kbd } from "./kbd";

const NAV = [
  { href: "/", label: "Home", keys: "G H" },
  { href: "/decks", label: "Decks", keys: "G D" },
  { href: "/cards", label: "Cards", keys: "G C" },
  { href: "/players", label: "Players", keys: "G P" },
] as const;

interface MastheadProps {
  /** Optional dateline override — e.g. "Season 23 / Day 4" */
  dateline?: string;
  /** Optional updated-at relative string — e.g. "14 min ago" */
  updatedAgo?: string;
}

export function Masthead({ dateline, updatedAgo }: MastheadProps) {
  return (
    <header className="border-b border-[var(--color-rule)]">
      <div className="mx-auto max-w-[1440px] px-6">
        <div className="flex items-start justify-between gap-8 py-4">
          <div>
            <Link
              href="/"
              className="block tracking-tight text-[var(--color-fg)] text-[var(--text-lg)] leading-tight hover:text-[var(--color-accent)]"
            >
              META&nbsp;REPORT
            </Link>
            <div className="mt-1 label-dim">
              clashroyale.stats
              {dateline && <span> &nbsp;·&nbsp; {dateline}</span>}
              {updatedAgo && <span> &nbsp;·&nbsp; updated {updatedAgo}</span>}
            </div>
          </div>
          <nav className="flex items-center gap-5">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-2 hover:text-[var(--color-accent)]"
              >
                <span className="label-section">{item.label}</span>
                <Kbd>{item.keys}</Kbd>
              </Link>
            ))}
            <span className="flex items-center gap-2 text-[var(--color-fg-dim)]">
              <Kbd>/</Kbd>
              <span className="label-dim">search</span>
            </span>
          </nav>
        </div>
        {/* the site's single piece of glow */}
        <div className="h-px bg-gradient-to-r from-transparent via-[var(--color-accent-dim)]/40 to-transparent" />
      </div>
    </header>
  );
}
