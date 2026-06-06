"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Check, Link2, BarChart3 } from "lucide-react";
import { api } from "@/lib/api";
import type { Card } from "@/lib/types";
import { DeckGrid } from "@/components/deck-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { deckHash } from "@/lib/deck-hash";
import { fmtDate, fmtInt } from "@/lib/format";

export function PlayerBattlesTab({ playerTag }: { playerTag: string }) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["battles", playerTag],
    queryFn: () => api.listBattles({ player_tag: playerTag, limit: 30 }),
  });

  const { data: cards } = useQuery({
    queryKey: ["cards"],
    queryFn: () => api.listCards(),
    staleTime: 5 * 60 * 1000,
  });

  const cardsById = useMemo(
    () => new Map<number, Card>((cards ?? []).map((c) => [c.card_id, c])),
    [cards],
  );

  if (isError) {
    return <p className="text-danger">Failed to load battles.</p>;
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return <p className="text-fg-muted">No battles recorded for this player.</p>;
  }

  return (
    <div className="space-y-2">
      {data.map((b) => {
        const won = b.winner_side === "team";
        const draw = b.team_crowns === b.opponent_crowns;
        return (
          <div
            key={`${b.queried_player_tag}-${b.battle_time}`}
            className="panel flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <Badge variant={draw ? "muted" : won ? "success" : "danger"}>
                {draw ? "Draw" : won ? "Win" : "Loss"}
              </Badge>
              <span className="font-display text-2xl tabular-nums text-fg">
                {fmtInt(b.team_crowns)} – {fmtInt(b.opponent_crowns)}
              </span>
              <span className="text-xs text-fg-muted capitalize">{b.battle_type}</span>
            </div>
            <BattleDeck
              playerTag={b.queried_player_tag}
              battleTime={b.battle_time}
              cardsById={cardsById}
            />
            <div className="text-xs text-fg-dim">{fmtDate(b.battle_time)}</div>
          </div>
        );
      })}
    </div>
  );
}

function BattleDeck({
  playerTag,
  battleTime,
  cardsById,
}: {
  playerTag: string;
  battleTime: string;
  cardsById: Map<number, Card>;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["battle-deck-cards", playerTag, battleTime],
    queryFn: () => api.listBattleDeckCards(playerTag, battleTime),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <Skeleton className="h-[104px] w-[200px]" />;
  }

  // The queried player's own deck sits on the "team" side; sort by deck_slot
  // so the eight cards always render in a stable order.
  const teamCards = (data ?? [])
    .filter((c) => c.participant_side === "team")
    .sort((a, b) => a.deck_slot - b.deck_slot);

  if (teamCards.length === 0) {
    return null;
  }

  const cardIds = teamCards.map((c) => c.card_id);

  return (
    <div className="flex flex-col items-start gap-2">
      <DeckGrid cardIds={cardIds} cardsById={cardsById} size={44} />
      <DeckCopyActions cardIds={cardIds} />
    </div>
  );
}

function DeckCopyActions({ cardIds }: { cardIds: number[] }) {
  const [copied, setCopied] = useState(false);

  // Official Clash Royale deck deep link — opens the 8 cards in-game.
  const gameLink = `https://link.clashroyale.com/deck/en?deck=${cardIds.join(";")}`;
  // Deck-analytics page key, derived the same way the pipeline hashes decks.
  const hash = deckHash(cardIds);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(gameLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable (non-secure context) — silently no-op.
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? (
          <Check className="h-4 w-4 text-success" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {copied ? "Copied" : "Copy deck"}
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href={`/decks/${hash}` as `/decks/${string}`}>
          <BarChart3 className="h-4 w-4" />
          View deck
        </Link>
      </Button>
    </div>
  );
}
