"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { api } from "@/lib/api";
import type { Card, DeckMeta } from "@/lib/types";
import { DataTable } from "@/components/data-table";
import { DeckGrid } from "@/components/deck-grid";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtFloat, fmtInt, fmtPct } from "@/lib/format";

export default function DecksPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["decks", 1000],
    queryFn: () => api.listDecks(1000),
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

  const columns = useMemo<ColumnDef<DeckMeta>[]>(
    () => [
      {
        accessorKey: "popularity_rank",
        header: "#",
        cell: (info) => (
          <span className="font-display text-fg-muted">
            #{info.getValue<number>()}
          </span>
        ),
      },
      {
        accessorKey: "deck_label",
        header: "Deck",
        cell: (info) => {
          const deck = info.row.original;
          const label = info.getValue<string | null>();
          return (
            <div className="min-w-[260px]">
              <DeckGrid cardIds={deck.card_ids} cardsById={cardsById} size={48} />
              {label && label.length > 0 && (
                <span className="sr-only">{label}</span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "avg_elixir_cost",
        header: "Avg elixir",
        cell: (info) => (
          <span className="tabular-nums">
            {fmtFloat(info.getValue<number | null>(), 1)}
          </span>
        ),
      },
      {
        accessorKey: "win_rate",
        header: "Win rate",
        cell: (info) => {
          const v = info.getValue<number | null>();
          const variant = v === null ? "muted" : v >= 0.55 ? "success" : v < 0.45 ? "danger" : "muted";
          return <Badge variant={variant}>{fmtPct(v)}</Badge>;
        },
      },
      {
        accessorKey: "appearance_count",
        header: "Plays",
        cell: (info) => (
          <span className="tabular-nums">{fmtInt(info.getValue<number>())}</span>
        ),
      },
      {
        accessorKey: "avg_crowns",
        header: "Avg crowns",
        cell: (info) => (
          <span className="tabular-nums">{fmtFloat(info.getValue<number | null>(), 2)}</span>
        ),
      },
      {
        accessorKey: "avg_trophy_change",
        header: "Avg Δ trophies",
        cell: (info) => {
          const v = info.getValue<number | null>();
          const tone = v === null ? "text-fg-dim" : v >= 0 ? "text-success" : "text-danger";
          return <span className={`tabular-nums ${tone}`}>{fmtFloat(v, 1)}</span>;
        },
      },
    ],
    [cardsById],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Decks</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Deck archetypes ranked by popularity. Sort or filter to find the meta.
        </p>
      </div>

      {isError ? (
        <p className="text-danger">Failed to load decks.</p>
      ) : isLoading || !data ? (
        <DeckTableSkeleton />
      ) : (
        <DataTable
          data={data}
          columns={columns}
          searchColumn="deck_label"
          searchPlaceholder="Filter by deck label…"
          initialSorting={[{ id: "popularity_rank", desc: false }]}
          pageSize={25}
        />
      )}
    </div>
  );
}

function DeckTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}
