"use client";

import * as React from "react";
import Link from "next/link";
import { DeckGrid } from "@/components/deck-grid";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtInt, fmtPct, winRateVariant } from "@/lib/format";
import { useCardsById } from "@/lib/cards";
import { cn } from "@/lib/utils";
import type { Card as CardModel, DeckMatchup } from "@/lib/types";

const TOP_N = 10;
// Selectable minimum-games thresholds. 3 is the default (same as before): a
// single game reads as a noisy 0%/100%, so low thresholds surface small samples.
const MIN_OPTIONS = [1, 3, 5, 10, 20] as const;
const DEFAULT_MIN = 3;

export function DeckMatchups({
  matchups,
  cards,
}: {
  matchups: DeckMatchup[];
  cards: CardModel[];
}) {
  const [minBattles, setMinBattles] = React.useState<number>(DEFAULT_MIN);

  const cardsById = useCardsById(cards);
  // Opponent rows carry the deck label (comma-separated names) but not ids;
  // rebuild ids from the label so the opponent deck renders as a grid.
  const idByName = React.useMemo(
    () => new Map<string, number>(cards.map((c) => [c.card_name, c.card_id])),
    [cards],
  );
  const labelToCardIds = React.useCallback(
    (label: string | null): number[] => {
      if (!label) return [];
      return label
        .split(",")
        .map((n) => idByName.get(n.trim()))
        .filter((id): id is number => typeof id === "number");
    },
    [idByName],
  );

  const { best, worst, qualifying } = React.useMemo(() => {
    const ranked = matchups.filter(
      (m) => m.win_rate !== null && m.matchup_count >= minBattles,
    );
    const best = [...ranked]
      .sort((a, b) => b.win_rate! - a.win_rate! || b.matchup_count - a.matchup_count)
      .slice(0, TOP_N);
    const worst = [...ranked]
      .sort((a, b) => a.win_rate! - b.win_rate! || b.matchup_count - a.matchup_count)
      .slice(0, TOP_N);
    return { best, worst, qualifying: ranked.length };
  }, [matchups, minBattles]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-fg">Matchups</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider text-fg-muted">
            Min games
          </span>
          <div className="flex gap-1">
            {MIN_OPTIONS.map((n) => {
              const active = n === minBattles;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setMinBattles(n)}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
                    active
                      ? "border-success/50 bg-success/10 text-success"
                      : "border-border text-fg-muted hover:bg-bg-panel-hover hover:text-fg",
                  )}
                >
                  {n}+
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {qualifying === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-fg-muted">
            No opponent decks reached {minBattles}+ battles. Try a lower minimum.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <MatchupTable
            title="Best matchups"
            subtitle="Decks this deck beats most often"
            rows={best}
            cardsById={cardsById}
            labelToCardIds={labelToCardIds}
          />
          <MatchupTable
            title="Worst matchups"
            subtitle="Its toughest counters — decks that beat it"
            rows={worst}
            cardsById={cardsById}
            labelToCardIds={labelToCardIds}
          />
        </div>
      )}
    </div>
  );
}

function MatchupTable({
  title,
  subtitle,
  rows,
  cardsById,
  labelToCardIds,
}: {
  title: string;
  subtitle?: string;
  rows: DeckMatchup[];
  cardsById: Map<number, CardModel>;
  labelToCardIds: (label: string | null) => number[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {subtitle && <p className="text-xs text-fg-muted">{subtitle}</p>}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opponent deck</TableHead>
              <TableHead className="text-right">Record</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.opponent_deck_hash}>
                <TableCell className="py-3">
                  <Link
                    href={`/decks/${m.opponent_deck_hash}` as `/decks/${string}`}
                    className="inline-block transition hover:brightness-110"
                    title={m.opponent_deck_label ?? m.opponent_deck_hash}
                  >
                    <DeckGrid
                      cardIds={labelToCardIds(m.opponent_deck_label)}
                      cardsById={cardsById}
                      size={40}
                      linkCards={false}
                    />
                  </Link>
                </TableCell>
                <TableCell className="text-right align-middle tabular-nums text-fg-muted">
                  {m.win_count}–{m.loss_count}
                  {m.draw_count > 0 ? `–${m.draw_count}` : ""}
                  <div
                    className={cn(
                      "text-xs",
                      m.matchup_count < 10 ? "text-warning" : "text-fg-dim",
                    )}
                    title={m.matchup_count < 10 ? "Small sample — win rate is noisy" : undefined}
                  >
                    {fmtInt(m.matchup_count)} games
                  </div>
                </TableCell>
                <TableCell className="text-right align-middle">
                  <Badge variant={winRateVariant(m.win_rate)}>{fmtPct(m.win_rate)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
