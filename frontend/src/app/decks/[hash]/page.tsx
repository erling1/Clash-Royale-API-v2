import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { DeckGrid } from "@/components/deck-grid";
import { DeckActions } from "@/components/deck-actions";
import { DeckMatchups } from "@/components/deck-matchups";
import { FavoriteButton } from "@/components/favorite-button";
import { fmtFloat, fmtInt, fmtPct } from "@/lib/format";
import type { Card as CardModel } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;

  let deck, matchups, allCards;
  try {
    [deck, matchups, allCards] = await Promise.all([
      api.getDeck(hash),
      api.getDeckMatchups(hash),
      api.listCards(),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const cardsById = new Map<number, CardModel>(
    allCards.map((c) => [c.card_id, c]),
  );

  return (
    <div className="space-y-8">
      <Link href="/decks" className="text-sm text-fg-muted hover:text-fg">
        ← All decks
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <DeckGrid cardIds={deck.card_ids} cardsById={cardsById} size={84} />
        <div className="flex-1">
          <h1 className="font-display text-3xl tracking-wide text-fg text-glow-gold">
            Deck #{deck.popularity_rank}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{deck.deck_label ?? deck.deck_hash}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <DeckActions deckHash={deck.deck_hash} cardIds={deck.card_ids} />
            <FavoriteButton
              fav={{
                type: "deck",
                id: deck.deck_hash,
                label: deck.deck_label ?? `Deck #${deck.popularity_rank}`,
                href: `/decks/${deck.deck_hash}`,
              }}
              withLabel
            />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Win rate" value={fmtPct(deck.win_rate)} />
            <Stat label="Plays" value={fmtInt(deck.appearance_count)} />
            <Stat label="Avg elixir" value={fmtFloat(deck.avg_elixir_cost, 1)} />
            <Stat label="Avg crowns" value={fmtFloat(deck.avg_crowns, 2)} />
          </div>
        </div>
      </div>

      <DeckMatchups matchups={matchups} cards={allCards} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="mt-1 font-display text-2xl text-fg text-glow-crystal">{value}</div>
    </div>
  );
}
