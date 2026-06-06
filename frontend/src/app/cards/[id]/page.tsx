import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { CardImage } from "@/components/card-image";
import { DeckGrid } from "@/components/deck-grid";
import { FavoriteButton } from "@/components/favorite-button";
import { Stat } from "@/components/stat";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cardsById } from "@/lib/cards";
import { fmtFloat, fmtInt, fmtPct, rarityClass, winRateVariant } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!Number.isFinite(id)) notFound();

  let card, meta, pairs, allCards, decksWithCard;
  try {
    [card, meta, pairs, allCards, decksWithCard] = await Promise.all([
      api.getCard(id),
      api.getCardMeta(id).catch(() => null),
      api.listCardPairs({ card_id: id, limit: 25 }),
      api.listCards(),
      // Server-side filter: the most popular decks that run this card, across the
      // full set (no client over-fetch, no >rank-1000 omission).
      api.listDecks({ card_id: id, limit: 12 }),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const byId = cardsById(allCards);

  return (
    <div className="space-y-8">
      <Link href="/cards" className="text-sm text-fg-muted hover:text-fg">
        ← All cards
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <CardImage
          name={card.card_name}
          rarity={card.rarity}
          iconUrl={card.icon_url}
          size={128}
          className="rounded-xl"
        />
        <div className="flex-1">
          <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">
            {card.card_name}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="muted" className={`capitalize ${rarityClass(card.rarity)}`}>
              {card.rarity}
            </Badge>
            {card.elixir_cost !== null && (
              <Badge variant="magic">{card.elixir_cost} elixir</Badge>
            )}
            <Badge variant="muted">Max level {card.max_level}</Badge>
            {card.max_evolution_level !== null && (
              <Badge variant="crystal">Evo lv {card.max_evolution_level}</Badge>
            )}
            {meta && <Badge variant="gold">#{meta.popularity_rank} popular</Badge>}
          </div>
          <div className="mt-3">
            <FavoriteButton
              fav={{
                type: "card",
                id: String(card.card_id),
                label: card.card_name,
                href: `/cards/${card.card_id}`,
              }}
              withLabel
            />
          </div>
        </div>
      </div>

      {meta && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Win rate" value={fmtPct(meta.win_rate)} />
          <Stat label="Usage" value={fmtPct(meta.usage_pct)} />
          <Stat label="Appearances" value={fmtInt(meta.appearance_count)} />
          <Stat label="Avg level" value={fmtFloat(meta.avg_card_level, 1)} />
        </div>
      )}

      {decksWithCard.length > 0 && (
        <section className="space-y-3">
          <div>
            <h2 className="font-display text-xl text-fg">Popular decks with this card</h2>
            <p className="text-xs text-fg-muted">Most-played tracked decks that run this card.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {decksWithCard.map((d) => (
              <Link
                key={d.deck_hash}
                href={`/decks/${d.deck_hash}` as `/decks/${string}`}
                className="panel flex items-center justify-between gap-3 p-3 transition hover:panel-gold hover:-translate-y-0.5"
              >
                <DeckGrid cardIds={d.card_ids} cardsById={byId} size={34} linkCards={false} />
                <div className="shrink-0 text-right text-xs">
                  <div className="text-fg-muted">#{d.popularity_rank}</div>
                  <Badge variant={winRateVariant(d.win_rate)}>{fmtPct(d.win_rate)}</Badge>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Best pairings</CardTitle>
        </CardHeader>
        <CardContent>
          {pairs.length === 0 ? (
            <p className="text-sm text-fg-muted">No pairings recorded yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead className="text-right">Co-occur</TableHead>
                  <TableHead className="text-right">Joint win rate</TableHead>
                  <TableHead className="text-right">#Rank</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pairs.map((p) => {
                  const partnerId = p.card_id_a === id ? p.card_id_b : p.card_id_a;
                  const partnerName =
                    p.card_id_a === id ? p.card_name_b : p.card_name_a;
                  const partner = byId.get(partnerId);
                  return (
                    <TableRow key={`${p.card_id_a}-${p.card_id_b}`}>
                      <TableCell>
                        <Link
                          href={`/cards/${partnerId}` as `/cards/${number}`}
                          className="flex items-center gap-2 text-fg hover:text-gold-bright"
                        >
                          <CardImage
                            name={partner?.card_name ?? `#${partnerId}`}
                            rarity={partner?.rarity ?? null}
                            iconUrl={partner?.icon_url ?? null}
                            size={36}
                          />
                          {partnerName ?? `#${partnerId}`}
                        </Link>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtInt(p.co_occurrence_count)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {fmtPct(p.joint_win_rate)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-fg-muted">
                        #{p.popularity_rank}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
