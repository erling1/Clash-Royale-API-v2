import { api } from "@/lib/api";
import { CardsGrid } from "@/components/cards-grid";
import { fmtInt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CardsPage() {
  const [cards, meta] = await Promise.all([
    api.listCards(),
    api.listCardMeta(1000),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">
            Cards
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            {fmtInt(cards.length)} cards in the catalog · filter and sort below.
          </p>
        </div>
      </div>

      <CardsGrid cards={cards} meta={meta} />
    </div>
  );
}
