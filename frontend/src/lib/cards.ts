import * as React from "react";
import type { Card } from "./types";

/** Build a `card_id → Card` lookup. Previously hand-rolled in many files. */
export function cardsById(cards: Card[]): Map<number, Card> {
  return new Map(cards.map((c) => [c.card_id, c]));
}

/** Memoized {@link cardsById} for client components. */
export function useCardsById(cards: Card[] | undefined): Map<number, Card> {
  return React.useMemo(() => cardsById(cards ?? []), [cards]);
}
