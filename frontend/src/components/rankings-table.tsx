"use client";

import Link from "next/link";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { fmtInt } from "@/lib/format";
import type { PolRanking } from "@/lib/types";

const columns: ColumnDef<PolRanking, unknown>[] = [
  {
    accessorKey: "player_rank",
    header: "Rank",
    cell: ({ row }) => (
      <Badge variant={row.original.player_rank <= 10 ? "gold" : "muted"}>
        #{row.original.player_rank}
      </Badge>
    ),
  },
  {
    // Combined accessor so the search box matches name, tag and clan at once.
    id: "player",
    accessorFn: (r) => `${r.player_name} ${r.player_tag} ${r.clan_tag ?? ""}`,
    header: "Player",
    cell: ({ row }) => (
      <Link
        href={`/players/${row.original.player_tag}` as `/players/${string}`}
        className="block transition-colors hover:text-success"
      >
        <div className="text-fg">{row.original.player_name}</div>
        <div className="font-mono text-xs text-fg-dim">{row.original.player_tag}</div>
      </Link>
    ),
  },
  {
    accessorKey: "elo_rating",
    header: "Elo",
    cell: ({ row }) => (
      <span className="font-display tabular-nums text-crystal-bright text-glow-crystal">
        {fmtInt(row.original.elo_rating)}
      </span>
    ),
  },
  {
    accessorKey: "exp_level",
    header: "Level",
    cell: ({ row }) => (
      <span className="tabular-nums text-fg">{fmtInt(row.original.exp_level)}</span>
    ),
  },
  {
    accessorKey: "clan_tag",
    header: "Clan",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-fg-muted">
        {row.original.clan_tag ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "season_id",
    header: "Season",
    cell: ({ row }) => (
      <span className="text-xs text-fg-muted">{row.original.season_id}</span>
    ),
  },
];

export function RankingsTable({ rankings }: { rankings: PolRanking[] }) {
  return (
    <DataTable
      data={rankings}
      columns={columns}
      searchColumn="player"
      searchPlaceholder="Search by name, tag or clan…"
      initialSorting={[{ id: "player_rank", desc: false }]}
      pageSize={25}
    />
  );
}
