"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CardImage } from "@/components/card-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fmtInt, fmtPct, rarityClass } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Card, CardMeta } from "@/lib/types";

type SortKey = "popularity" | "winrate" | "elixir" | "name";

const SORT_LABEL: Record<SortKey, string> = {
  popularity: "Popularity",
  winrate: "Win rate",
  elixir: "Elixir cost",
  name: "Name (A–Z)",
};

const RARITY_ORDER = ["common", "rare", "epic", "legendary", "champion"];

export function CardsGrid({ cards, meta }: { cards: Card[]; meta: CardMeta[] }) {
  const metaByCard = React.useMemo(
    () => new Map(meta.map((m) => [m.card_id, m] as const)),
    [meta],
  );

  const rarities = React.useMemo(() => {
    const set = new Set(cards.map((c) => c.rarity.toLowerCase()));
    return [...set].sort(
      (a, b) => RARITY_ORDER.indexOf(a) - RARITY_ORDER.indexOf(b),
    );
  }, [cards]);

  const [q, setQ] = React.useState("");
  const [activeRarities, setActiveRarities] = React.useState<Set<string>>(
    new Set(),
  );
  const [sort, setSort] = React.useState<SortKey>("popularity");

  const toggleRarity = (r: string) =>
    setActiveRarities((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });

  const query = q.trim().toLowerCase();

  const shown = React.useMemo(() => {
    const filtered = cards.filter((c) => {
      if (query && !c.card_name.toLowerCase().includes(query)) return false;
      if (activeRarities.size && !activeRarities.has(c.rarity.toLowerCase()))
        return false;
      return true;
    });

    const rankOf = (c: Card) => metaByCard.get(c.card_id)?.popularity_rank ?? 9999;
    const wrOf = (c: Card) => metaByCard.get(c.card_id)?.win_rate ?? null;

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "winrate": {
          const wa = wrOf(a);
          const wb = wrOf(b);
          if (wa === null && wb === null) return rankOf(a) - rankOf(b);
          if (wa === null) return 1;
          if (wb === null) return -1;
          return wb - wa;
        }
        case "elixir": {
          const ea = a.elixir_cost ?? Number.POSITIVE_INFINITY;
          const eb = b.elixir_cost ?? Number.POSITIVE_INFINITY;
          return ea - eb || rankOf(a) - rankOf(b);
        }
        case "name":
          return a.card_name.localeCompare(b.card_name);
        case "popularity":
        default:
          return rankOf(a) - rankOf(b);
      }
    });
  }, [cards, query, activeRarities, sort, metaByCard]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search cards…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-xs"
        />

        <div className="flex flex-wrap gap-1.5">
          {rarities.map((r) => {
            const active = activeRarities.has(r);
            return (
              <button
                key={r}
                type="button"
                onClick={() => toggleRarity(r)}
                className={cn(
                  "rounded-md border px-2.5 py-1 text-xs font-semibold capitalize transition-colors",
                  active
                    ? "border-crystal/60 bg-crystal/10 text-crystal"
                    : "border-border text-fg-muted hover:bg-bg-panel-hover hover:text-fg",
                  !active && rarityClass(r),
                )}
              >
                {r}
              </button>
            );
          })}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              Sort: {SORT_LABEL[sort]}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {(Object.keys(SORT_LABEL) as SortKey[]).map((key) => (
              <DropdownMenuItem key={key} onSelect={() => setSort(key)}>
                {SORT_LABEL[key]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <span className="ml-auto text-xs text-fg-muted">
          {fmtInt(shown.length)} shown
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="py-12 text-center text-sm text-fg-muted">
          No cards match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {shown.map((card) => {
            const m = metaByCard.get(card.card_id);
            return (
              <Link
                key={card.card_id}
                href={`/cards/${card.card_id}` as `/cards/${number}`}
                className="panel p-4 transition-all hover:panel-gold hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-3">
                  <CardImage
                    name={card.card_name}
                    rarity={card.rarity}
                    iconUrl={card.icon_url}
                    size={64}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-display text-base text-fg">
                      {card.card_name}
                    </div>
                    <div className={`text-xs capitalize ${rarityClass(card.rarity)}`}>
                      {card.rarity}
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-fg-muted">
                    Win rate:{" "}
                    <span className="text-fg">{fmtPct(m?.win_rate ?? null)}</span>
                  </span>
                  {m && <Badge variant="gold">#{m.popularity_rank}</Badge>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
