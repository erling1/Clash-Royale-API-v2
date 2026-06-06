"use client";

import { cn } from "@/lib/utils";
import { rarityClass } from "@/lib/format";
import type { Card } from "@/lib/types";

export const RARITY_ORDER = ["common", "rare", "epic", "legendary", "champion"];

/** Distinct rarities present in `cards`, ordered by game rarity. */
export function deriveRarities(cards: Card[]): string[] {
  const set = new Set(cards.map((c) => c.rarity.toLowerCase()));
  return [...set].sort((a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b));
}

/** Rarity chip row shared by the cards grid and the deck builder. */
export function RarityFilter({
  rarities,
  active,
  onToggle,
}: {
  rarities: string[];
  active: Set<string>;
  onToggle: (r: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {rarities.map((r) => {
        const isActive = active.has(r);
        return (
          <button
            key={r}
            type="button"
            onClick={() => onToggle(r)}
            className={cn(
              "rounded-md border px-2.5 py-1 text-xs font-semibold capitalize transition-colors",
              isActive
                ? "border-crystal/60 bg-crystal/10 text-crystal"
                : "border-border text-fg-muted hover:bg-bg-panel-hover hover:text-fg",
              !isActive && rarityClass(r),
            )}
          >
            {r}
          </button>
        );
      })}
    </div>
  );
}
