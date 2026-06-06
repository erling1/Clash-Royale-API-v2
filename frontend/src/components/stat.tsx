import { cn } from "@/lib/utils";

type Accent = "gold" | "crystal";

/**
 * Shared stat tile. The default (panel) form is used on the card / deck / player
 * detail pages; `compact` is the dense form used inside player cards in the
 * players grid. Consolidates five near-identical local copies.
 */
export function Stat({
  label,
  value,
  accent,
  compact,
}: {
  label: string;
  value: string;
  accent?: Accent;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <div>
        <div className="text-fg-dim">{label}</div>
        <div className={accent === "gold" ? "font-display text-gold text-glow-gold" : "text-fg"}>
          {value}
        </div>
      </div>
    );
  }

  const tone =
    accent === "gold"
      ? "text-gold text-glow-gold"
      : accent === "crystal"
        ? "text-crystal-bright text-glow-crystal"
        : "text-fg text-glow-crystal";

  return (
    <div className="panel px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-fg-muted">{label}</div>
      <div className={cn("mt-1 font-display text-2xl", tone)}>{value}</div>
    </div>
  );
}
