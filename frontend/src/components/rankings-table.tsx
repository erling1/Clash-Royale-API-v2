"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pager } from "@/components/pager";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtInt } from "@/lib/format";
import type { PolRanking } from "@/lib/types";

export function RankingsTable({
  rankings,
  page,
  hasNext,
}: {
  rankings: PolRanking[];
  page: number;
  hasNext: boolean;
}) {
  // Search filters the loaded page only (pagination + rank order are server-side).
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();
  const rows = React.useMemo(() => {
    if (!query) return rankings;
    return rankings.filter(
      (r) =>
        r.player_name.toLowerCase().includes(query) ||
        r.player_tag.toLowerCase().includes(query) ||
        (r.clan_tag ?? "").toLowerCase().includes(query),
    );
  }, [rankings, query]);

  return (
    <div className="space-y-3">
      <Input
        placeholder="Filter this page by name, tag or clan…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Elo</TableHead>
            <TableHead className="text-right">Level</TableHead>
            <TableHead>Clan</TableHead>
            <TableHead>Season</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-fg-muted">
                No players on this page match “{q}”.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r) => (
              <TableRow key={`${r.season_id}-${r.player_tag}`}>
                <TableCell>
                  <Badge variant={r.player_rank <= 10 ? "gold" : "muted"}>
                    #{r.player_rank}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Link
                    href={`/players/${encodeURIComponent(r.player_tag)}` as `/players/${string}`}
                    className="block transition-colors hover:text-success"
                  >
                    <div className="text-fg">{r.player_name}</div>
                    <div className="font-mono text-xs text-fg-dim">{r.player_tag}</div>
                  </Link>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-display tabular-nums text-crystal-bright text-glow-crystal">
                    {fmtInt(r.elo_rating)}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <span className="tabular-nums text-fg">{fmtInt(r.exp_level)}</span>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs text-fg-muted">{r.clan_tag ?? "—"}</span>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-fg-muted">{r.season_id}</span>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Pager page={page} hasNext={hasNext} />
    </div>
  );
}
