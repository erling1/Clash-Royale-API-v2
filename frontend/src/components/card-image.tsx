"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Renders an official Clash Royale card icon at its native aspect ratio.
 * Per the Supercell Fan Content Policy, icon URLs MUST come from the official
 * Clash Royale API (developer.clashroyale.com). Next.js image optimization
 * (resize + webp + caching) is allowed — only the source asset is unchanged.
 *
 * The official card assets are 285×420 (portrait). `size` is the display WIDTH
 * in px; height follows the asset ratio so nothing is stretched or cropped.
 * When no URL is available we fall back to a rarity-colored medallion of the
 * same shape (composed locally, no Supercell assets).
 */
const CARD_W = 285;
const CARD_H = 420;

export interface CardImageProps {
  name: string;
  rarity?: string | null;
  iconUrl?: string | null;
  /** Display width in px. Height follows the 285:420 asset aspect ratio. */
  size?: number;
  /** Rounded corners. Disable for flush deck tiling. Defaults to true. */
  rounded?: boolean;
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
  iconUrl,
  size = 64,
  rounded = true,
  className,
}: CardImageProps) {
  const height = Math.round((size * CARD_H) / CARD_W);
  // The optimizer endpoint (/_next/image) can transiently 500 under cold-cache
  // bursts; on error we retry with the raw CDN URL, bypassing the optimizer.
  const [optimizerFailed, setOptimizerFailed] = useState(false);

  if (!iconUrl) {
    const ring = rarity
      ? RARITY_RING[rarity.toLowerCase()] ?? "ring-border"
      : "ring-border";
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center bg-gradient-to-br from-bg-panel to-bg-elevated ring-1 ring-inset",
          ring,
          rounded && "rounded-md",
          className,
        )}
        style={{ width: size, height }}
        aria-label={name}
      >
        <span className="font-display text-xs text-fg-muted text-center px-1 leading-tight">
          {name.slice(0, 3).toUpperCase()}
        </span>
      </div>
    );
  }

  return (
    <Image
      src={iconUrl}
      alt={name}
      width={CARD_W}
      height={CARD_H}
      sizes={`${size}px`}
      unoptimized={optimizerFailed}
      onError={() => setOptimizerFailed(true)}
      className={cn("block h-auto shrink-0", rounded && "rounded-md", className)}
      style={{ width: size }}
    />
  );
}
