import Link from "next/link";
import { CardImage } from "@/components/card-image";
import { cn } from "@/lib/utils";
import type { Card } from "@/lib/types";

/**
 * Renders a deck as the classic Clash Royale 4-column grid — eight cards wrap
 * into two rows of four. Card metadata (name, rarity, elixir, icon) is resolved
 * from `cardsById`; unknown ids fall back to a placeholder medallion so the
 * grid always keeps its 2×4 shape.
 */
export interface DeckGridProps {
  cardIds: number[];
  cardsById: Map<number, Card>;
  /** Icon size in px. */
  size?: number;
  /** Wrap each icon in a link to its card detail page. Defaults to true. */
  linkCards?: boolean;
  className?: string;
}

export function DeckGrid({
  cardIds,
  cardsById,
  size = 56,
  linkCards = true,
  className,
}: DeckGridProps) {
  return (
    <div className={cn("grid grid-cols-4 justify-items-center gap-2", className)}>
      {cardIds.map((id, i) => {
        const card = cardsById.get(id);
        const icon = (
          <CardImage
            name={card?.card_name ?? `#${id}`}
            rarity={card?.rarity ?? null}
            elixir={card?.elixir_cost ?? null}
            iconUrl={card?.icon_url ?? null}
            size={size}
          />
        );

        if (linkCards && card) {
          return (
            <Link
              key={`${id}-${i}`}
              href={`/cards/${id}` as `/cards/${number}`}
              className="transition-transform hover:-translate-y-0.5"
              title={card.card_name}
            >
              {icon}
            </Link>
          );
        }

        return (
          <div key={`${id}-${i}`} title={card?.card_name}>
            {icon}
          </div>
        );
      })}
    </div>
  );
}
