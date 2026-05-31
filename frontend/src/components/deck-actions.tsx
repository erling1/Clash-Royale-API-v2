"use client";

import * as React from "react";
import { Check, Link2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Deck actions for the detail page:
 *  - "Open in Clash Royale": official deck deep link. On a device with the game
 *    installed it launches CR and loads the 8 cards into the deck editor. The
 *    card_ids are Supercell scIds (e.g. 26000035), used verbatim by the link.
 *    Evolutions/tower-troop (&slots=/&tt=) are intentionally omitted — deck
 *    identity doesn't retain which card was evolved.
 *  - "Copy deck link": the same deep link as text, for pasting into chats.
 *  - "Copy page link": this analytics page URL.
 */
export function DeckActions({
  deckHash,
  cardIds,
}: {
  deckHash: string;
  cardIds: number[];
}) {
  const [copied, setCopied] = React.useState<"deck" | "page" | null>(null);

  const gameLink = `https://link.clashroyale.com/deck/en?deck=${cardIds.join(";")}`;
  const pageLink =
    typeof window !== "undefined"
      ? window.location.origin + `/decks/${deckHash}`
      : `/decks/${deckHash}`;

  const copy = async (kind: "deck" | "page", text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      window.setTimeout(() => setCopied(null), 1500);
    } catch {
      // Clipboard unavailable (e.g. non-secure context) — silently no-op.
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="gold" size="sm" disabled={cardIds.length === 0}>
        <a href={gameLink} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="h-4 w-4" />
          Open in Clash Royale
        </a>
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => copy("deck", gameLink)}
        disabled={cardIds.length === 0}
      >
        {copied === "deck" ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {copied === "deck" ? "Copied" : "Copy deck link"}
      </Button>
      <Button variant="outline" size="sm" onClick={() => copy("page", pageLink)}>
        {copied === "page" ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {copied === "page" ? "Copied" : "Copy page link"}
      </Button>
    </div>
  );
}
