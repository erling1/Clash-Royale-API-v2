"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Stat } from "@/components/stat";
import { Pager } from "@/components/pager";
import { fmtInt, fmtPct } from "@/lib/format";
import type { Player } from "@/lib/types";

export function PlayersGrid({
  players,
  page,
  total,
  hasNext,
}: {
  players: Player[];
  page: number;
  total?: number;
  hasNext: boolean;
}) {
  // Search filters the loaded page only (pagination is server-side).
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();
  const rows = React.useMemo(() => {
    if (!query) return players;
    return players.filter(
      (p) =>
        p.player_name.toLowerCase().includes(query) ||
        p.player_tag.toLowerCase().includes(query) ||
        (p.clan_tag ?? "").toLowerCase().includes(query),
    );
  }, [players, query]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter this page by name, tag or clan…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-fg-muted">
          No players on this page match “{q}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <Link
              key={p.player_tag}
              href={`/players/${encodeURIComponent(p.player_tag)}` as `/players/${string}`}
            >
              <Card className="transition-all hover:panel-gold hover:-translate-y-0.5">
                <CardHeader>
                  <CardTitle className="text-xl">{p.player_name}</CardTitle>
                  <p className="text-xs font-mono text-fg-dim">{p.player_tag}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <Stat compact label="Trophies" value={fmtInt(p.trophies)} accent="gold" />
                    <Stat compact label="Best" value={fmtInt(p.best_trophies)} />
                    <Stat compact label="Win rate" value={fmtPct(p.win_rate)} />
                    <Stat compact label="Wins" value={fmtInt(p.wins)} />
                    <Stat compact label="Losses" value={fmtInt(p.losses)} />
                    <Stat compact label="Level" value={fmtInt(p.exp_level)} />
                  </div>
                  {p.clan_tag && (
                    <div className="mt-3">
                      <Badge variant="crystal">Clan {p.clan_tag}</Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Pager page={page} hasNext={hasNext} total={total} />
    </div>
  );
}
