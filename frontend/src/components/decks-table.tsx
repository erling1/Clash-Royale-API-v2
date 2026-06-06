"use client";

import Link from "next/link";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { DeckGrid } from "@/components/deck-grid";
import { Badge } from "@/components/ui/badge";
import { Pager } from "@/components/pager";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCardsById } from "@/lib/cards";
import { DECK_DEFAULT_DIR, type DeckSortKey } from "@/lib/deck-sort";
import { fmtFloat, fmtInt, fmtPct, winRateVariant } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Card, DeckMeta } from "@/lib/types";

export function DecksTable({
  decks,
  cards,
  sortKey,
  dir,
  page,
  total,
  hasNext,
}: {
  decks: DeckMeta[];
  cards: Card[];
  sortKey: DeckSortKey;
  dir: "asc" | "desc";
  page: number;
  total?: number;
  hasNext: boolean;
}) {
  const router = useRouter();
  const cardsById = useCardsById(cards);

  // Changing the sort resets to page 1; the server re-fetches that page sorted.
  const sortHref = (key: DeckSortKey): Route => {
    const nextDir = key === sortKey ? (dir === "asc" ? "desc" : "asc") : DECK_DEFAULT_DIR[key];
    return `/decks?sort=${key}&dir=${nextDir}&page=1` as Route;
  };

  return (
    <div className="space-y-3">
      <Table>
        <TableHeader>
          <TableRow>
            <SortHead label="#" k="popularity_rank" sortKey={sortKey} dir={dir} hrefFor={sortHref} />
            <TableHead>Deck</TableHead>
            <SortHead label="Avg elixir" k="avg_elixir_cost" sortKey={sortKey} dir={dir} hrefFor={sortHref} align="right" />
            <SortHead label="Win rate" k="win_rate" sortKey={sortKey} dir={dir} hrefFor={sortHref} align="right" />
            <SortHead label="Plays" k="appearance_count" sortKey={sortKey} dir={dir} hrefFor={sortHref} align="right" />
            <SortHead label="Avg crowns" k="avg_crowns" sortKey={sortKey} dir={dir} hrefFor={sortHref} align="right" />
            <SortHead label="Avg Δ trophies" k="avg_trophy_change" sortKey={sortKey} dir={dir} hrefFor={sortHref} align="right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {decks.map((deck) => {
            const td = deck.avg_trophy_change;
            const tdTone = td === null ? "text-fg-dim" : td >= 0 ? "text-success" : "text-danger";
            return (
              <TableRow
                key={deck.deck_hash}
                onClick={() => router.push(`/decks/${deck.deck_hash}` as Route)}
                className="cursor-pointer transition hover:bg-bg-panel-hover"
              >
                <TableCell className="align-middle font-display text-fg-muted">
                  #{deck.popularity_rank}
                </TableCell>
                <TableCell className="py-3">
                  <DeckGrid cardIds={deck.card_ids} cardsById={cardsById} size={72} linkCards={false} />
                </TableCell>
                <TableCell className="text-right align-middle tabular-nums">
                  {fmtFloat(deck.avg_elixir_cost, 1)}
                </TableCell>
                <TableCell className="text-right align-middle">
                  <Badge variant={winRateVariant(deck.win_rate)}>{fmtPct(deck.win_rate)}</Badge>
                </TableCell>
                <TableCell className="text-right align-middle tabular-nums">
                  {fmtInt(deck.appearance_count)}
                </TableCell>
                <TableCell className="text-right align-middle tabular-nums">
                  {fmtFloat(deck.avg_crowns, 2)}
                </TableCell>
                <TableCell className={`text-right align-middle tabular-nums ${tdTone}`}>
                  {fmtFloat(td, 1)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Pager page={page} hasNext={hasNext} total={total} />
    </div>
  );
}

function SortHead({
  label,
  k,
  sortKey,
  dir,
  hrefFor,
  align = "left",
}: {
  label: string;
  k: DeckSortKey;
  sortKey: DeckSortKey;
  dir: "asc" | "desc";
  hrefFor: (k: DeckSortKey) => Route;
  align?: "left" | "right";
}) {
  const active = k === sortKey;
  const arrow = active ? (dir === "asc" ? "▲" : "▼") : "";
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <Link
        href={hrefFor(k)}
        scroll={false}
        className={cn(
          "inline-flex items-center gap-1 font-semibold uppercase tracking-wider transition hover:text-fg",
          align === "right" && "flex-row-reverse",
          active ? "text-success" : "text-fg-muted",
        )}
      >
        {label}
        <span className="text-[0.6rem]">{arrow}</span>
      </Link>
    </TableHead>
  );
}
