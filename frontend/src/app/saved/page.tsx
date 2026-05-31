"use client";

import Link from "next/link";
import type { Route } from "next";
import { Star, X } from "lucide-react";
import { useFavorites, removeFavorite, type FavType } from "@/lib/favorites";
import { fmtInt } from "@/lib/format";

const SECTIONS: { type: FavType; title: string }[] = [
  { type: "deck", title: "Decks" },
  { type: "card", title: "Cards" },
  { type: "player", title: "Players" },
];

export default function SavedPage() {
  const favorites = useFavorites();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Saved</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {fmtInt(favorites.length)} item{favorites.length === 1 ? "" : "s"} on your
          watchlist · stored in this browser.
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="panel flex flex-col items-center gap-3 py-16 text-center">
          <Star className="h-10 w-10 text-fg-dim" />
          <p className="text-sm text-fg-muted">
            Nothing saved yet. Tap the ★ on any deck, card or player to add it here.
          </p>
        </div>
      ) : (
        SECTIONS.map(({ type, title }) => {
          const items = favorites.filter((f) => f.type === type);
          if (items.length === 0) return null;
          return (
            <section key={type} className="space-y-2">
              <h2 className="font-display text-xl text-fg">
                {title}{" "}
                <span className="text-sm text-fg-muted">({items.length})</span>
              </h2>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((f) => (
                  <div
                    key={`${f.type}:${f.id}`}
                    className="panel flex items-center justify-between gap-2 px-4 py-3"
                  >
                    <Link
                      href={f.href as Route}
                      className="min-w-0 flex-1 truncate text-fg hover:text-crystal"
                    >
                      {f.label}
                    </Link>
                    <button
                      type="button"
                      aria-label="Remove"
                      onClick={() => removeFavorite(f.type, f.id)}
                      className="shrink-0 rounded-md p-1 text-fg-dim transition-colors hover:bg-bg-panel-hover hover:text-danger"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
