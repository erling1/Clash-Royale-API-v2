"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Pager } from "@/components/pager";
import type { Clan } from "@/lib/types";

export function ClansGrid({
  clans,
  page,
  hasNext,
}: {
  clans: Clan[];
  page: number;
  hasNext: boolean;
}) {
  // Search filters the loaded page only (pagination is server-side).
  const [q, setQ] = React.useState("");
  const query = q.trim().toLowerCase();
  const rows = React.useMemo(() => {
    if (!query) return clans;
    return clans.filter(
      (c) =>
        c.clan_name.toLowerCase().includes(query) ||
        c.clan_tag.toLowerCase().includes(query),
    );
  }, [clans, query]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Filter this page by clan name or tag…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="max-w-sm"
      />

      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-fg-muted">
          No clans on this page match “{q}”.
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

      <Pager page={page} hasNext={hasNext} />
    </div>
  );
}
