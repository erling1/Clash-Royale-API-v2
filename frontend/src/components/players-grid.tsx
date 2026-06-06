"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fmtInt, fmtPct } from "@/lib/format";
import type { Player } from "@/lib/types";

const PAGE_SIZE = 24;

export function PlayersGrid({ players }: { players: Player[] }) {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);

  const query = q.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!query) return players;
    return players.filter(
      (p) =>
        p.player_name.toLowerCase().includes(query) ||
        p.player_tag.toLowerCase().includes(query) ||
        (p.clan_tag ?? "").toLowerCase().includes(query),
    );
  }, [players, query]);

  React.useEffect(() => setPage(0), [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by name, tag or clan…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-fg-muted">
          No players match “{q}”.
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
                    <Stat label="Trophies" value={fmtInt(p.trophies)} highlight />
                    <Stat label="Best" value={fmtInt(p.best_trophies)} />
                    <Stat label="Win rate" value={fmtPct(p.win_rate)} />
                    <Stat label="Wins" value={fmtInt(p.wins)} />
                    <Stat label="Losses" value={fmtInt(p.losses)} />
                    <Stat label="Level" value={fmtInt(p.exp_level)} />
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

      <Pager
        page={page}
        pageCount={pageCount}
        total={filtered.length}
        onPage={setPage}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <div className="text-fg-dim">{label}</div>
      <div className={highlight ? "font-display text-gold text-glow-gold" : "text-fg"}>
        {value}
      </div>
    </div>
  );
}

function Pager({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (updater: (p: number) => number) => void;
}) {
  return (
    <div className="flex items-center justify-between text-xs text-fg-muted">
      <div>
        Page {page + 1} of {pageCount} · {fmtInt(total)} results
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPage((p) => p + 1)}
          disabled={page + 1 >= pageCount}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
