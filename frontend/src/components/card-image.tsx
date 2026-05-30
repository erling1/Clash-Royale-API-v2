import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Renders a card icon if `iconUrl` is supplied. Per Supercell Fan Content
 * Policy, icon URLs MUST come from the official Clash Royale API
 * (developer.clashroyale.com) — never scraped or modified. When no URL is
 * available the component falls back to a generic rarity-colored medallion
 * (composed locally, no Supercell assets).
 *
 * Today the Rust backend does not expose iconUrls; once it does, pass them
 * through via the `iconUrl` prop and the real image will appear.
 */
export interface CardImageProps {
  name: string;
  rarity?: string | null;
  elixir?: number | null;
  iconUrl?: string | null;
  size?: number;
  className?: string;
}

const RARITY_RING: Record<string, string> = {
  common: "ring-rarity-common/60",
  rare: "ring-rarity-rare/70",
  epic: "ring-rarity-epic/70",
  legendary: "ring-rarity-legendary/80",
  champion: "ring-rarity-champion/80",
};

export function CardImage({
  name,
  rarity,
  elixir,
  iconUrl,
  size = 64,
  className,
}: CardImageProps) {
  const ring = rarity ? RARITY_RING[rarity.toLowerCase()] ?? "ring-border" : "ring-border";

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-lg ring-2 ring-inset bg-gradient-to-br from-bg-panel to-bg-elevated overflow-hidden",
        ring,
        className,
      )}
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {iconUrl ? (
        <Image
          src={iconUrl}
          alt={name}
          width={size}
          height={size}
          className="object-contain"
          unoptimized
        />
      ) : (
        <span className="font-display text-xs text-fg-muted text-center px-1 leading-tight">
          {name.slice(0, 3).toUpperCase()}
        </span>
      )}
      {typeof elixir === "number" && (
        <span
          className="absolute -bottom-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-b from-magic to-purple text-[10px] font-bold text-fg ring-2 ring-bg shadow"
          aria-label={`Elixir cost ${elixir}`}
        >
          {elixir}
        </span>
      )}
    </div>
  );
}
