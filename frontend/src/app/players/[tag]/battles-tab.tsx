"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DeckGrid } from "@/components/deck-grid";
import { DeckActions } from "@/components/deck-actions";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCardsById } from "@/lib/cards";
import { deckHash } from "@/lib/deck-hash";
import { fmtDate, fmtInt } from "@/lib/format";

const BATTLE_LIMIT = 30;

export function PlayerBattlesTab({ playerTag }: { playerTag: string }) {
  const {
    data: battles,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["battles", playerTag],
    queryFn: () => api.listBattles({ player_tag: playerTag, limit: BATTLE_LIMIT }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: cards } = useQuery({
    queryKey: ["cards"],
    queryFn: () => api.listCards(),
    staleTime: 5 * 60 * 1000,
  });
  const cardsById = useCardsById(cards);

  // One request for every recent battle's deck cards, instead of one per row.
  const { data: deckCards, isLoading: deckCardsLoading } = useQuery({
    queryKey: ["player-battle-deck-cards", playerTag],
    queryFn: () => api.getPlayerBattleDeckCards(playerTag, { limit: BATTLE_LIMIT }),
    staleTime: 5 * 60 * 1000,
  });

  // Group the queried player's own ("team") cards per battle, ordered by slot.
  const teamCardsByBattle = useMemo(() => {
    const grouped = new Map<string, { deck_slot: number; card_id: number }[]>();
    for (const c of deckCards ?? []) {
      if (c.participant_side !== "team") continue;
      const arr = grouped.get(c.battle_time) ?? [];
      arr.push({ deck_slot: c.deck_slot, card_id: c.card_id });
      grouped.set(c.battle_time, arr);
    }
    const out = new Map<string, number[]>();
    for (const [time, arr] of grouped) {
      out.set(
        time,
        arr.sort((a, b) => a.deck_slot - b.deck_slot).map((x) => x.card_id),
      );
    }
    return out;
  }, [deckCards]);

  if (isError) {
    return <p className="text-danger">Failed to load battles.</p>;
  }

  if (isLoading || !battles) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (battles.length === 0) {
    return <p className="text-fg-muted">No battles recorded for this player.</p>;
  }

  return (
    <div className="space-y-2">
      {battles.map((b) => {
        const won = b.winner_side === "team";
        const draw = b.team_crowns === b.opponent_crowns;
        const cardIds = teamCardsByBattle.get(b.battle_time);
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
            {cardIds && cardIds.length > 0 ? (
              <div className="flex flex-col items-start gap-2">
                <DeckGrid cardIds={cardIds} cardsById={cardsById} size={44} />
                <DeckActions deckHash={deckHash(cardIds)} cardIds={cardIds} />
              </div>
            ) : deckCardsLoading ? (
              <Skeleton className="h-[104px] w-[200px]" />
            ) : null}
            <div className="text-xs text-fg-dim">{fmtDate(b.battle_time)}</div>
          </div>
        );
      })}
    </div>
  );
}
