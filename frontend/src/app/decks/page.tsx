"use client";

import { Suspense, useMemo } from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Card, DeckMeta } from "@/lib/types";
import { DeckGrid } from "@/components/deck-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtFloat, fmtInt, fmtPct } from "@/lib/format";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 24;
// Single fetch, then sort/paginate in the browser. 1000 = the endpoint's max
// clamp, i.e. the top-1000 decks by popularity.
const FETCH_LIMIT = 1000;

// Numeric metric columns of DeckMeta we sort by.
type SortKey =
  | "popularity_rank"
  | "win_rate"
  | "avg_elixir_cost"
  | "appearance_count"
  | "avg_crowns"
  | "avg_trophy_change";

type Dir = "asc" | "desc";

// Direction applied when a column is first selected.
const DEFAULT_DIR: Record<SortKey, Dir> = {
  popularity_rank: "asc",
  win_rate: "desc",
  avg_elixir_cost: "asc",
  appearance_count: "desc",
  avg_crowns: "desc",
  avg_trophy_change: "desc",
};

const SORT_KEYS = Object.keys(DEFAULT_DIR) as SortKey[];

// Nulls always sort last, regardless of direction.
const compareNullable = (a: number | null, b: number | null, dir: Dir): number => {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return dir === "asc" ? a - b : b - a;
};

export default function DecksPage() {
  return (
    <Suspense fallback={<DeckTableSkeleton />}>
      <DecksTable />
    </Suspense>
  );
}

function DecksTable() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // The URL query string is the single source of truth for sort + page, so
  // views are shareable and the browser back button restores prior state.
  const sortKey: SortKey = SORT_KEYS.includes(
    searchParams.get("sort") as SortKey,
  )
    ? (searchParams.get("sort") as SortKey)
    : "popularity_rank";
  const dir: Dir = searchParams.get("dir") === "asc" ? "asc" : searchParams.get("dir") === "desc" ? "desc" : DEFAULT_DIR[sortKey];
  const rawPage = Number.parseInt(searchParams.get("page") ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;

  const setParams = (next: Partial<{ sort: SortKey; dir: Dir; page: number }>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next.sort !== undefined) params.set("sort", next.sort);
    if (next.dir !== undefined) params.set("dir", next.dir);
    if (next.page !== undefined) params.set("page", String(next.page + 1));
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
  };

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setParams({ dir: dir === "asc" ? "desc" : "asc", page: 0 });
    } else {
      setParams({ sort: key, dir: DEFAULT_DIR[key], page: 0 });
    }
  };

  const {
    data: allDecks,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["decks", "all"],
    queryFn: () => api.listDecks({ limit: FETCH_LIMIT }),
    staleTime: 5 * 60 * 1000,
  });

  const { data: total } = useQuery({
    queryKey: ["decks-count"],
    queryFn: () => api.countDecks(),
    staleTime: 5 * 60 * 1000,
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

  const processed = useMemo<DeckMeta[]>(() => {
    const rows = allDecks ?? [];
    return [...rows].sort((a, b) => {
      const primary = compareNullable(a[sortKey], b[sortKey], dir);
      return primary !== 0 ? primary : a.popularity_rank - b.popularity_rank;
    });
  }, [allDecks, sortKey, dir]);

  const pageCount = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = processed.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const hasNext = safePage + 1 < pageCount;

  const capped = (allDecks?.length ?? 0) >= FETCH_LIMIT;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Decks</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Deck archetypes ranked by popularity.
          {total !== undefined && ` ${fmtInt(total)} decks tracked`}
          {capped ? ` · showing the top ${fmtInt(FETCH_LIMIT)}.` : "."}
        </p>
      </div>

      {isError ? (
        <p className="text-danger">Failed to load decks.</p>
      ) : isLoading || !allDecks ? (
        <DeckTableSkeleton />
      ) : (
        <div className="space-y-3">
          <Table>
            <TableHeader>
              <TableRow>
                <SortHead label="#" sortKey="popularity_rank" activeKey={sortKey} dir={dir} onSort={toggleSort} />
                <TableHead>Deck</TableHead>
                <SortHead label="Avg elixir" sortKey="avg_elixir_cost" activeKey={sortKey} dir={dir} onSort={toggleSort} align="right" />
                <SortHead label="Win rate" sortKey="win_rate" activeKey={sortKey} dir={dir} onSort={toggleSort} align="right" />
                <SortHead label="Plays" sortKey="appearance_count" activeKey={sortKey} dir={dir} onSort={toggleSort} align="right" />
                <SortHead label="Avg crowns" sortKey="avg_crowns" activeKey={sortKey} dir={dir} onSort={toggleSort} align="right" />
                <SortHead label="Avg Δ trophies" sortKey="avg_trophy_change" activeKey={sortKey} dir={dir} onSort={toggleSort} align="right" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.map((deck) => {
                const wr = deck.win_rate;
                const wrVariant =
                  wr === null ? "muted" : wr >= 0.55 ? "success" : wr < 0.45 ? "danger" : "muted";
                const td = deck.avg_trophy_change;
                const tdTone = td === null ? "text-fg-dim" : td >= 0 ? "text-success" : "text-danger";
                return (
                  <TableRow
                    key={deck.deck_hash}
                    onClick={() => router.push(`/decks/${deck.deck_hash}` as `/decks/${string}`)}
                    className="cursor-pointer transition hover:bg-bg-panel-hover"
                  >
                    <TableCell className="align-middle font-display text-fg-muted">
                      #{deck.popularity_rank}
                    </TableCell>
                    <TableCell className="py-3">
                      <DeckGrid
                        cardIds={deck.card_ids}
                        cardsById={cardsById}
                        size={72}
                        linkCards={false}
                      />
                    </TableCell>
                    <TableCell className="text-right align-middle tabular-nums">
                      {fmtFloat(deck.avg_elixir_cost, 1)}
                    </TableCell>
                    <TableCell className="text-right align-middle">
                      <Badge variant={wrVariant}>{fmtPct(wr)}</Badge>
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

          <div className="flex items-center justify-between text-xs text-fg-muted">
            <div>
              Page {safePage + 1} of {pageCount}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams({ page: Math.max(0, safePage - 1) })}
                disabled={safePage === 0}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setParams({ page: safePage + 1 })}
                disabled={!hasNext}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortHead({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  dir: Dir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = activeKey === sortKey;
  const arrow = active ? (dir === "asc" ? "▲" : "▼") : "";
  return (
    <TableHead className={align === "right" ? "text-right" : undefined}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 font-semibold uppercase tracking-wider transition hover:text-fg",
          align === "right" && "flex-row-reverse",
          active ? "text-success" : "text-fg-muted",
        )}
      >
        {label}
        <span className="text-[0.6rem]">{arrow}</span>
      </button>
    </TableHead>
  );
}

function DeckTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}
