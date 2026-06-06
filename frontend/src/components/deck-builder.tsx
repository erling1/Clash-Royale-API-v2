"use client";

import * as React from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { deckHash } from "@/lib/deck-hash";
import { useCardsById } from "@/lib/cards";
import { CardImage } from "@/components/card-image";
import { DeckGrid } from "@/components/deck-grid";
import { DeckActions } from "@/components/deck-actions";
import { DeckMatchups } from "@/components/deck-matchups";
import { FavoriteButton } from "@/components/favorite-button";
import { RarityFilter, deriveRarities } from "@/components/rarity-filter";
import { Stat } from "@/components/stat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card as Panel, CardContent } from "@/components/ui/card";
import { fmtFloat, fmtInt, fmtPct, rarityClass } from "@/lib/format";
import { cn } from "@/lib/utils";

const DECK_SIZE = 8;
// Deck-slot tile size, matching the 285:420 card art ratio used elsewhere.
const SLOT_W = 76;
const SLOT_H = Math.round((SLOT_W * 420) / 285);

function parseCards(raw: string | null): number[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n))
    .slice(0, DECK_SIZE);
}

export function DeckBuilder() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { data: cards } = useQuery({
    queryKey: ["cards"],
    queryFn: () => api.listCards(),
    staleTime: 5 * 60 * 1000,
  });
  const cardsById = useCardsById(cards);

  const [selected, setSelected] = React.useState<number[]>(() =>
    parseCards(searchParams.get("cards")),
  );
  const [q, setQ] = React.useState("");
  const [activeRarities, setActiveRarities] = React.useState<Set<string>>(new Set());

  const rarities = React.useMemo(() => deriveRarities(cards ?? []), [cards]);

  const toggleRarity = (r: string) =>
    setActiveRarities((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });

  // Keep the URL in sync so a built deck is shareable.
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selected.length) params.set("cards", selected.join(","));
    else params.delete("cards");
    router.replace(`${pathname}?${params.toString()}` as Route, { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, pathname]);

  const toggle = (id: number) =>
    setSelected((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= DECK_SIZE) return prev;
      return [...prev, id];
    });

  const full = selected.length === DECK_SIZE;
  const hash = full ? deckHash(selected) : null;

  const {
    data: result,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["builder", hash],
    enabled: Boolean(hash),
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      try {
        const [deck, matchups] = await Promise.all([
          api.getDeck(hash!),
          api.getDeckMatchups(hash!),
        ]);
        return { deck, matchups };
      } catch (err) {
        // 404 = this exact 8-card combo isn't in the tracked battles.
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });

  const query = q.trim().toLowerCase();
  const filtered = React.useMemo(() => {
    const base = (cards ?? []).filter((c) => {
      if (query && !c.card_name.toLowerCase().includes(query)) return false;
      if (activeRarities.size && !activeRarities.has(c.rarity.toLowerCase())) return false;
      return true;
    });
    return [...base].sort((a, b) => a.card_name.localeCompare(b.card_name));
  }, [cards, query, activeRarities]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">
          Deck Builder
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Pick 8 cards to see how the deck performs in tracked battles — win rate,
          popularity and its best/worst matchups.
        </p>
      </div>

      {/* Selected deck — a 2×4 grid that fills as you pick, like the decks overview */}
      <div className="panel p-5">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs uppercase tracking-wider text-fg-muted">
            Your deck · {selected.length}/{DECK_SIZE}
          </span>
          {selected.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        <div className="mt-4 grid w-fit grid-cols-4 gap-1.5">
          {Array.from({ length: DECK_SIZE }).map((_, i) => {
            const id = selected[i];
            if (id === undefined) {
              return (
                <div
                  key={`empty-${i}`}
                  className="rounded-md border-2 border-dashed border-border bg-bg-panel-hover/40"
                  style={{ width: SLOT_W, height: SLOT_H }}
                />
              );
            }
            const c = cardsById.get(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggle(id)}
                title={`Remove ${c?.card_name ?? id}`}
                className="group relative"
              >
                <CardImage
                  name={c?.card_name ?? `#${id}`}
                  rarity={c?.rarity ?? null}
                  iconUrl={c?.icon_url ?? null}
                  size={SLOT_W}
                />
                <span className="absolute inset-0 flex items-center justify-center rounded-md bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                  <X className="h-5 w-5 text-white" />
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {full && (
        <div className="space-y-6">
          {isLoading ? (
            <p className="text-sm text-fg-muted">Looking up this deck…</p>
          ) : isError ? (
            <p className="text-danger">Something went wrong looking up this deck.</p>
          ) : result === null ? (
            <Panel>
              <CardContent className="space-y-3 py-8 text-center">
                <p className="text-sm text-fg-muted">
                  This exact 8-card deck hasn’t appeared in tracked battles yet, so
                  there are no stats for it.
                </p>
                <div className="flex justify-center">
                  <DeckActions deckHash={hash!} cardIds={selected} />
                </div>
              </CardContent>
            </Panel>
          ) : result ? (
            <>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <DeckGrid cardIds={result.deck.card_ids} cardsById={cardsById} size={72} />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="gold">#{result.deck.popularity_rank} popular</Badge>
                    <FavoriteButton
                      fav={{
                        type: "deck",
                        id: result.deck.deck_hash,
                        label: result.deck.deck_label ?? `Deck #${result.deck.popularity_rank}`,
                        href: `/decks/${result.deck.deck_hash}`,
                      }}
                      withLabel
                    />
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Stat label="Win rate" value={fmtPct(result.deck.win_rate)} />
                    <Stat label="Plays" value={fmtInt(result.deck.appearance_count)} />
                    <Stat label="Avg elixir" value={fmtFloat(result.deck.avg_elixir_cost, 1)} />
                    <Stat label="Avg crowns" value={fmtFloat(result.deck.avg_crowns, 2)} />
                  </div>
                  <div className="mt-4">
                    <DeckActions deckHash={result.deck.deck_hash} cardIds={result.deck.card_ids} />
                  </div>
                </div>
              </div>
              <DeckMatchups matchups={result.matchups} cards={cards ?? []} />
            </>
          ) : null}
        </div>
      )}

      {/* Card catalog */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <Input
            placeholder="Search cards to add…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-xs"
          />
          <RarityFilter rarities={rarities} active={activeRarities} onToggle={toggleRarity} />
          <span className="ml-auto text-xs text-fg-muted">{fmtInt(filtered.length)} cards</span>
        </div>
        <div
          className="grid gap-2"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))" }}
        >
          {filtered.map((c) => {
            const picked = selected.includes(c.card_id);
            const disabled = !picked && selected.length >= DECK_SIZE;
            return (
              <button
                key={c.card_id}
                type="button"
                onClick={() => toggle(c.card_id)}
                disabled={disabled}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border p-2 text-center transition-all",
                  picked
                    ? "border-success/60 bg-success/10"
                    : "border-transparent hover:bg-bg-panel-hover",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                <CardImage
                  name={c.card_name}
                  rarity={c.rarity}
                  iconUrl={c.icon_url}
                  size={84}
                />
                <span className="w-full truncate text-xs text-fg">{c.card_name}</span>
                <span className={cn("text-[0.65rem] capitalize", rarityClass(c.rarity))}>
                  {c.rarity}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
