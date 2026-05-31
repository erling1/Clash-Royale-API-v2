"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Crown, Home, Search, Bell, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Href = "/" | "/cards" | "/decks" | "/players" | "/clans" | "/battles" | "/rankings";

const NAV: {
  label: string;
  href: Href;
  icon?: React.ComponentType<{ className?: string }>;
}[] = [
  { label: "Overview", href: "/", icon: Home },
  { label: "Cards", href: "/cards" },
  { label: "Decks", href: "/decks" },
  { label: "Players", href: "/players" },
  { label: "Clans", href: "/clans" },
  { label: "Battles", href: "/battles" },
  { label: "Rankings", href: "/rankings" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg-panel/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-royal-bright to-royal shadow-sm ring-1 ring-black/5 transition-transform group-hover:scale-105">
            <Crown className="h-5 w-5 text-gold-bright" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-base tracking-tight text-fg">ARENA</span>
            <span className="-mt-0.5 font-display text-base tracking-tight text-crystal">
              INSIGHTS
            </span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-success/10 text-success"
                    : "text-fg-muted hover:bg-bg-panel-hover hover:text-fg",
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <button
            type="button"
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-bg-panel-hover hover:text-fg"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-bg-panel-hover hover:text-fg"
          >
            <Bell className="h-5 w-5" />
          </button>
          <span
            aria-hidden
            className="ml-1 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-royal-bright to-purple ring-2 ring-bg-panel"
          >
            <User className="h-5 w-5 text-white" />
          </span>
        </div>
      </div>
    </header>
  );
}
