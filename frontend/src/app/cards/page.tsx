import Link from "next/link";
import { api } from "@/lib/api";
import { CardImage } from "@/components/card-image";
import { Badge } from "@/components/ui/badge";
import { fmtPct, fmtInt, rarityClass } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const [cards, meta] = await Promise.all([
    api.listCards(),
    api.listCardMeta(1000),
  ]);

  const metaByCard = new Map(meta.map((m) => [m.card_id, m] as const));
  const sorted = [...cards].sort((a, b) => {
    const ra = metaByCard.get(a.card_id)?.popularity_rank ?? 9999;
    const rb = metaByCard.get(b.card_id)?.popularity_rank ?? 9999;
    return ra - rb;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">
            Cards
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {fmtInt(cards.length)} cards in the catalog · ranked by current popularity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sorted.map((card) => {
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
                  elixir={card.elixir_cost ?? null}
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
                {m && (
                  <Badge variant="gold">#{m.popularity_rank}</Badge>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
