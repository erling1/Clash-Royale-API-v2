"use client";

import * as React from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import type { Card } from "@/lib/types";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CardImage } from "@/components/card-image";
import { DeckGrid } from "@/components/deck-grid";
import { fmtInt, rarityClass } from "@/lib/format";
import { cn } from "@/lib/utils";

const PER_GROUP = 6;

interface Item {
  key: string;
  href: string;
  node: React.ReactNode;
}

interface Group {
  title: string;
  items: Item[];
}

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState(0);

  // Global Cmd/Ctrl+K toggles the palette from anywhere.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Reset the query each time the palette opens.
  React.useEffect(() => {
    if (open) setQ("");
  }, [open]);

  // Datasets are fetched only once the palette is opened, then cached. These
  // query keys are shared with the pages that already load the same lists.
  const enabled = open;
  const { data: cards } = useQuery({
    queryKey: ["cards"],
    queryFn: () => api.listCards(),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
  const { data: players } = useQuery({
    queryKey: ["players", "all"],
    queryFn: () => api.listPlayers(1000),
    staleTime: 5 * 60 * 1000,
    enabled,
  });
  const { data: decks } = useQuery({
    queryKey: ["decks", "all"],
    queryFn: () => api.listDecks({ limit: 1000 }),
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  const cardsById = React.useMemo(
    () => new Map<number, Card>((cards ?? []).map((c) => [c.card_id, c])),
    [cards],
  );

  const query = q.trim().toLowerCase();

  const groups = React.useMemo<Group[]>(() => {
    if (!query) return [];
    const out: Group[] = [];

    const playerItems = (players ?? [])
      .filter(
        (p) =>
          p.player_name.toLowerCase().includes(query) ||
          p.player_tag.toLowerCase().includes(query),
      )
      .slice(0, PER_GROUP)
      .map<Item>((p) => ({
        key: `player-${p.player_tag}`,
        href: `/players/${p.player_tag}`,
        node: (
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-fg">{p.player_name}</div>
              <div className="font-mono text-xs text-fg-dim">{p.player_tag}</div>
            </div>
            <span className="shrink-0 font-display text-sm text-gold">
              {fmtInt(p.trophies)}
            </span>
          </div>
        ),
      }));
    if (playerItems.length) out.push({ title: "Players", items: playerItems });

    const cardItems = (cards ?? [])
      .filter((c) => c.card_name.toLowerCase().includes(query))
      .slice(0, PER_GROUP)
      .map<Item>((c) => ({
        key: `card-${c.card_id}`,
        href: `/cards/${c.card_id}`,
        node: (
          <div className="flex items-center gap-3">
            <CardImage
              name={c.card_name}
              rarity={c.rarity}
              iconUrl={c.icon_url}
              size={28}
            />
            <div className="min-w-0">
              <div className="truncate text-fg">{c.card_name}</div>
              <div className={cn("text-xs capitalize", rarityClass(c.rarity))}>
                {c.rarity}
              </div>
            </div>
          </div>
        ),
      }));
    if (cardItems.length) out.push({ title: "Cards", items: cardItems });

    const deckItems = (decks ?? [])
      .filter((d) => (d.deck_label ?? "").toLowerCase().includes(query))
      .slice(0, PER_GROUP)
      .map<Item>((d) => ({
        key: `deck-${d.deck_hash}`,
        href: `/decks/${d.deck_hash}`,
        node: (
          <div className="flex items-center gap-3">
            <DeckGrid
              cardIds={d.card_ids}
              cardsById={cardsById}
              size={26}
              linkCards={false}
            />
            <span className="text-xs text-fg-muted">
              #{d.popularity_rank} · {fmtInt(d.appearance_count)} plays
            </span>
          </div>
        ),
      }));
    if (deckItems.length) out.push({ title: "Decks", items: deckItems });

    return out;
  }, [query, players, cards, decks, cardsById]);

  // Flatten for keyboard navigation.
  const flat = React.useMemo(() => groups.flatMap((g) => g.items), [groups]);

  React.useEffect(() => {
    setActive(0);
  }, [query, flat.length]);

  const go = React.useCallback(
    (href: string) => {
      onOpenChange(false);
      router.push(href as Route);
    },
    [onOpenChange, router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!flat.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % flat.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + flat.length) % flat.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[active];
      if (item) go(item.href);
    }
  };

  let flatIndex = -1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={undefined}
        className="top-[12%] max-w-xl translate-y-0 gap-0 p-0"
      >
        <DialogTitle className="sr-only">Search</DialogTitle>
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-fg-muted" />
          {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search players, cards, decks…"
            className="h-12 w-full bg-transparent text-sm text-fg placeholder:text-fg-dim focus:outline-none"
          />
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {!query ? (
            <p className="px-2 py-6 text-center text-sm text-fg-muted">
              Type to search across players, cards and decks.
            </p>
          ) : flat.length === 0 ? (
            <p className="px-2 py-6 text-center text-sm text-fg-muted">
              No matches for “{q}”.
            </p>
          ) : (
            groups.map((group) => (
              <div key={group.title} className="mb-2 last:mb-0">
                <div className="px-2 py-1 font-display text-xs uppercase tracking-wider text-fg-muted">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  flatIndex += 1;
                  const isActive = flatIndex === active;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => go(item.href)}
                      onMouseMove={() => setActive(flat.indexOf(item))}
                      className={cn(
                        "w-full rounded-md px-2 py-2 text-left transition-colors",
                        isActive ? "bg-bg-panel-hover" : "hover:bg-bg-panel-hover/60",
                      )}
                    >
                      {item.node}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
