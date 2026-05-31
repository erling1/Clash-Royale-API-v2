"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { toggleFavorite, useIsFavorite, type Favorite } from "@/lib/favorites";
import { cn } from "@/lib/utils";

/**
 * Star toggle that adds/removes an item from the localStorage watchlist.
 * Mount-gated so it never disagrees with the server-rendered (empty) state on
 * first paint, avoiding a hydration mismatch.
 */
export function FavoriteButton({
  fav,
  withLabel = false,
  className,
  stopPropagation = false,
}: {
  fav: Favorite;
  withLabel?: boolean;
  className?: string;
  /** Set when nested inside a clickable row/card to avoid triggering it. */
  stopPropagation?: boolean;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  const active = useIsFavorite(fav.type, fav.id) && mounted;

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "Remove from saved" : "Save"}
      title={active ? "Remove from saved" : "Save"}
      onClick={(e) => {
        if (stopPropagation) {
          e.preventDefault();
          e.stopPropagation();
        }
        toggleFavorite(fav);
      }}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-gold/50 bg-gold/10 text-gold-dark"
          : "border-border text-fg-muted hover:bg-bg-panel-hover hover:text-fg",
        className,
      )}
    >
      <Star className={cn("h-4 w-4", active && "fill-current")} />
      {withLabel && (active ? "Saved" : "Save")}
    </button>
  );
}
