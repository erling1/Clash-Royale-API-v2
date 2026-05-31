import Link from "next/link";
import { CardImage } from "@/components/card-image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { rarityClass } from "@/lib/format";
import type { Card } from "@/lib/types";

/**
 * Renders a deck as the classic Clash Royale 4-column block — eight cards in
 * two rows of four, flush against each other (no gaps) so the deck reads as a
 * single unit. Separate decks should be spaced apart by their container.
 * Card metadata is resolved from `cardsById`; unknown ids fall back to a
 * placeholder so the block always keeps its 2×4 shape.
 *
 * Variant icon selection (the "hybrid" rule):
 *   The deck aggregate only knows which cards *can* be evo/hero (not which were
 *   evolved in any single battle — that info is dropped at deck identity). So we
 *   arrange the lead slots by capability:
 *     Spot 1 → first evo-capable card, shown as its EVOLUTION icon
 *     Spot 2 → first remaining hero-capable card, shown as its HERO icon
 *     Spot 3 → best remaining by priority HERO > EVOLUTION > base
 *     Spots 4–8 → remaining cards in their incoming order, base icons
 *   Falls back to base icons whenever a variant isn't available.
 */
export interface DeckGridProps {
  cardIds: number[];
  cardsById: Map<number, Card>;
  /** Per-card width in px. */
  size?: number;
  /** Wrap each icon in a link to its card detail page. Defaults to true. */
  linkCards?: boolean;
  className?: string;
}

type Variant = "evolution" | "hero" | "base";

interface DeckSlot {
  key: string;
  cardId: number;
  card: Card | undefined;
  iconUrl: string | null;
}

function variantIcon(card: Card | undefined, variant: Variant): string | null {
  if (!card) return null;
  if (variant === "evolution") return card.icon_url_evolution ?? card.icon_url ?? null;
  if (variant === "hero") return card.icon_url_hero ?? card.icon_url ?? null;
  return card.icon_url ?? null;
}

function arrangeDeck(
  cardIds: number[],
  cardsById: Map<number, Card>,
): DeckSlot[] {
  // Preserve the incoming (numeric-sorted) order; tag each with its capability.
  const pool = cardIds.map((id, idx) => {
    const card = cardsById.get(id);
    return {
      idx,
      cardId: id,
      card,
      hasEvo: Boolean(card?.icon_url_evolution),
      hasHero: Boolean(card?.icon_url_hero),
    };
  });

  const taken = new Set<number>();
  type Entry = (typeof pool)[number];
  const take = (pred: (c: Entry) => boolean): Entry | undefined => {
    const found = pool.find((c) => !taken.has(c.idx) && pred(c));
    if (found) taken.add(found.idx);
    return found;
  };

  const slots: DeckSlot[] = [];
  const push = (entry: Entry | undefined, variant: Variant) => {
    if (!entry) return;
    slots.push({
      key: `${entry.cardId}-${entry.idx}`,
      cardId: entry.cardId,
      card: entry.card,
      iconUrl: variantIcon(entry.card, variant),
    });
  };

  // Spot 1: first evo-capable card (else first card), rendered as evolution.
  push(take((c) => c.hasEvo) ?? take(() => true), "evolution");

  // Spot 2: first remaining hero-capable card (else first remaining), as hero.
  push(take((c) => c.hasHero) ?? take(() => true), "hero");

  // Spot 3: HERO > EVOLUTION > base among the remaining cards.
  const heroThird = take((c) => c.hasHero);
  if (heroThird) push(heroThird, "hero");
  else {
    const evoThird = take((c) => c.hasEvo);
    if (evoThird) push(evoThird, "evolution");
    else push(take(() => true), "base");
  }

  // Spots 4–8: everything else in original order, base icons.
  for (const c of pool) {
    if (!taken.has(c.idx)) {
      taken.add(c.idx);
      push(c, "base");
    }
  }

  return slots;
}

export function DeckGrid({
  cardIds,
  cardsById,
  size = 52,
  linkCards = true,
  className,
}: DeckGridProps) {
  const slots = arrangeDeck(cardIds, cardsById);
  // Two rows of four. Card icons carry baked-in transparent top/bottom padding,
  // so the rows read as far apart even at gap-0. A small negative overlap pulls
  // them together so the eight cards read as one deck — without altering the
  // card aspect ratio or clipping any visible art.
  const rows = [slots.slice(0, 4), slots.slice(4)];
  const overlap = Math.round(size * 0.11);

  const renderSlot = (slot: DeckSlot) => {
    const card = slot.card;
    const icon = (
      <CardImage
        name={card?.card_name ?? `#${slot.cardId}`}
        rarity={card?.rarity ?? null}
        iconUrl={slot.iconUrl}
        size={size}
        rounded={false}
      />
    );

    // Unknown cards get no tooltip — nothing meaningful to show.
    if (!card) {
      return (
        <div key={slot.key} className="block">
          {icon}
        </div>
      );
    }

    const trigger =
      linkCards ? (
        <Link
          href={`/cards/${slot.cardId}` as `/cards/${number}`}
          className="block transition hover:brightness-110"
        >
          {icon}
        </Link>
      ) : (
        <span className="block">{icon}</span>
      );

    return (
      <Tooltip key={slot.key}>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent>
          <div className="font-display text-sm text-fg">{card.card_name}</div>
          <div className="flex items-center gap-2 text-xs">
            <span className={cn("capitalize", rarityClass(card.rarity))}>
              {card.rarity}
            </span>
            {card.elixir_cost !== null && (
              <span className="text-fg-muted">{card.elixir_cost} elixir</span>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className={cn("inline-block overflow-hidden rounded-md", className)}>
      {rows.map((row, ri) => (
        <div
          key={ri}
          className="flex"
          style={ri > 0 ? { marginTop: -overlap } : undefined}
        >
          {row.map(renderSlot)}
        </div>
      ))}
    </div>
  );
}
