"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fmtInt } from "@/lib/format";
import type { Clan } from "@/lib/types";

const PAGE_SIZE = 24;

export function ClansGrid({ clans }: { clans: Clan[] }) {
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(0);

  const query = q.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    if (!query) return clans;
    return clans.filter(
      (c) =>
        c.clan_name.toLowerCase().includes(query) ||
        c.clan_tag.toLowerCase().includes(query),
    );
  }, [clans, query]);

  React.useEffect(() => setPage(0), [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search by clan name or tag…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-fg-muted">
          No clans match “{q}”.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((c) => (
            <Card key={c.clan_tag}>
              <CardHeader>
                <CardTitle className="truncate text-xl">{c.clan_name}</CardTitle>
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="muted" className="font-mono">
                    {c.clan_tag}
                  </Badge>
                  {c.clan_badge_id !== null && (
                    <Badge variant="crystal">Badge #{c.clan_badge_id}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-fg-muted">
        <div>
          Page {page + 1} of {pageCount} · {fmtInt(filtered.length)} results
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page + 1 >= pageCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
