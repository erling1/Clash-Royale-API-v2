import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { DeckGrid } from "@/components/deck-grid";
import { DeckActions } from "@/components/deck-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { fmtFloat, fmtInt, fmtPct } from "@/lib/format";
import type { Card as CardModel, DeckMatchup } from "@/lib/types";

export const dynamic = "force-dynamic";

// Matchups with fewer battles than this are too noisy to rank by win rate
// (a single game would read as 0% or 100%), so they're excluded from the
// best/worst lists.
const MIN_BATTLES = 3;
const TOP_N = 10;

function winRateVariant(wr: number | null) {
  if (wr === null) return "muted" as const;
  if (wr >= 0.55) return "success" as const;
  if (wr < 0.45) return "danger" as const;
  return "muted" as const;
}

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ hash: string }>;
}) {
  const { hash } = await params;

  let deck, matchups, allCards;
  try {
    [deck, matchups, allCards] = await Promise.all([
      api.getDeck(hash),
      api.getDeckMatchups(hash),
      api.listCards(),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const cardsById = new Map<number, CardModel>(
    allCards.map((c) => [c.card_id, c]),
  );
  // The matchup rows carry the opponent deck's label (comma-separated card
  // names) but not its card_ids, so rebuild the ids from the label to render
  // the opponent deck as a grid. Names come from the same dim_cards source as
  // listCards(), so they match exactly.
  const idByName = new Map<string, number>(
    allCards.map((c) => [c.card_name, c.card_id]),
  );
  const labelToCardIds = (label: string | null): number[] => {
    if (!label) return [];
    return label
      .split(",")
      .map((n) => idByName.get(n.trim()))
      .filter((id): id is number => typeof id === "number");
  };

  const ranked = matchups.filter(
    (m) => m.win_rate !== null && m.matchup_count >= MIN_BATTLES,
  );
  const best = [...ranked]
    .sort((a, b) => b.win_rate! - a.win_rate! || b.matchup_count - a.matchup_count)
    .slice(0, TOP_N);
  const worst = [...ranked]
    .sort((a, b) => a.win_rate! - b.win_rate! || b.matchup_count - a.matchup_count)
    .slice(0, TOP_N);

  return (
    <div className="space-y-8">
      <Link href="/decks" className="text-sm text-fg-muted hover:text-fg">
        ← All decks
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        <DeckGrid cardIds={deck.card_ids} cardsById={cardsById} size={84} />
        <div className="flex-1">
          <h1 className="font-display text-3xl tracking-wide text-fg text-glow-gold">
            Deck #{deck.popularity_rank}
          </h1>
          <p className="mt-1 text-sm text-fg-muted">{deck.deck_label ?? deck.deck_hash}</p>
          <div className="mt-3">
            <DeckActions deckHash={deck.deck_hash} cardIds={deck.card_ids} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Stat label="Win rate" value={fmtPct(deck.win_rate)} />
            <Stat label="Plays" value={fmtInt(deck.appearance_count)} />
            <Stat label="Avg elixir" value={fmtFloat(deck.avg_elixir_cost, 1)} />
            <Stat label="Avg crowns" value={fmtFloat(deck.avg_crowns, 2)} />
          </div>
        </div>
      </div>

      {ranked.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-fg-muted">
            Not enough matchup data yet (need at least {MIN_BATTLES} battles
            against an opponent deck to rank a matchup).
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <MatchupTable
            title="Best matchups"
            rows={best}
            cardsById={cardsById}
            labelToCardIds={labelToCardIds}
          />
          <MatchupTable
            title="Worst matchups"
            rows={worst}
            cardsById={cardsById}
            labelToCardIds={labelToCardIds}
          />
        </div>
      )}
    </div>
  );
}

function MatchupTable({
  title,
  rows,
  cardsById,
  labelToCardIds,
}: {
  title: string;
  rows: DeckMatchup[];
  cardsById: Map<number, CardModel>;
  labelToCardIds: (label: string | null) => number[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Opponent deck</TableHead>
              <TableHead className="text-right">Record</TableHead>
              <TableHead className="text-right">Win rate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((m) => (
              <TableRow key={m.opponent_deck_hash}>
                <TableCell className="py-3">
                  <Link
                    href={`/decks/${m.opponent_deck_hash}` as `/decks/${string}`}
                    className="inline-block transition hover:brightness-110"
                    title={m.opponent_deck_label ?? m.opponent_deck_hash}
                  >
                    <DeckGrid
                      cardIds={labelToCardIds(m.opponent_deck_label)}
                      cardsById={cardsById}
                      size={40}
                      linkCards={false}
                    />
                  </Link>
                </TableCell>
                <TableCell className="text-right align-middle tabular-nums text-fg-muted">
                  {m.win_count}–{m.loss_count}
                  {m.draw_count > 0 ? `–${m.draw_count}` : ""}
                  <div className="text-xs text-fg-dim">{fmtInt(m.matchup_count)} games</div>
                </TableCell>
                <TableCell className="text-right align-middle">
                  <Badge variant={winRateVariant(m.win_rate)}>{fmtPct(m.win_rate)}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-fg-muted">{label}</div>
      <div className="mt-1 font-display text-2xl text-fg text-glow-crystal">{value}</div>
    </div>
  );
}
