/**
 * Sortable deck columns + the direction each applies when first selected.
 * Mirrors the whitelist in the Rust /decks endpoint. Plain module (no
 * "use client") so the server decks page can read these as real values.
 */
export const DECK_DEFAULT_DIR = {
  popularity_rank: "asc",
  win_rate: "desc",
  avg_elixir_cost: "asc",
  appearance_count: "desc",
  avg_crowns: "desc",
  avg_trophy_change: "desc",
} as const;

export type DeckSortKey = keyof typeof DECK_DEFAULT_DIR;
export const DECK_SORT_KEYS = Object.keys(DECK_DEFAULT_DIR) as DeckSortKey[];
