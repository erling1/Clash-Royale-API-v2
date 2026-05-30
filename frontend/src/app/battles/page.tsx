"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { api } from "@/lib/api";
import type { Battle } from "@/lib/types";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { fmtDate, fmtInt } from "@/lib/format";

export default function BattlesPage() {
  const [playerTag, setPlayerTag] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["battles-all", playerTag],
    queryFn: () =>
      api.listBattles({
        player_tag: playerTag.trim() || undefined,
        limit: 1000,
      }),
  });

  const columns = useMemo<ColumnDef<Battle>[]>(
    () => [
      {
        accessorKey: "battle_time",
        header: "When",
        cell: (info) => (
          <span className="text-fg-muted">{fmtDate(info.getValue<string>())}</span>
        ),
      },
      {
        accessorKey: "queried_player_tag",
        header: "Player",
        cell: (info) => (
          <span className="font-mono text-xs text-fg">{info.getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "battle_type",
        header: "Type",
        cell: (info) => (
          <span className="capitalize text-fg-muted">{info.getValue<string>()}</span>
        ),
      },
      {
        id: "score",
        header: "Score",
        cell: ({ row }) => (
          <span className="font-display tabular-nums text-fg">
            {fmtInt(row.original.team_crowns)} – {fmtInt(row.original.opponent_crowns)}
          </span>
        ),
      },
      {
        accessorKey: "winner_side",
        header: "Result",
        cell: ({ row }) => {
          const t = row.original.team_crowns;
          const o = row.original.opponent_crowns;
          const draw = t === o;
          const won = row.original.winner_side === "team";
          return (
            <Badge variant={draw ? "muted" : won ? "success" : "danger"}>
              {draw ? "Draw" : won ? "Win" : "Loss"}
            </Badge>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Battles</h1>
        <p className="mt-1 text-sm text-fg-muted">
          Recent matches across the dataset. Filter by player tag.
        </p>
      </div>

      <Input
        placeholder="Filter by player tag (e.g. #ABC123)"
        value={playerTag}
        onChange={(e) => setPlayerTag(e.target.value)}
        className="max-w-sm"
      />

      {isError ? (
        <p className="text-danger">Failed to load battles.</p>
      ) : isLoading || !data ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <DataTable
          data={data}
          columns={columns}
          initialSorting={[{ id: "battle_time", desc: true }]}
          pageSize={25}
        />
      )}
    </div>
  );
}
