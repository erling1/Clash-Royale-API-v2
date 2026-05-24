interface DeltaProps {
  value: number;
  digits?: number;
  /** if true, show the arrow glyph; if false, just the signed number */
  arrow?: boolean;
}

export function Delta({ value, digits = 1, arrow = true }: DeltaProps) {
  const positive = value > 0;
  const negative = value < 0;
  const color = positive
    ? "text-[var(--color-accent)]"
    : negative
    ? "text-[var(--color-alert)]"
    : "text-[var(--color-fg-dim)]";
  const glyph = positive ? "↑" : negative ? "↓" : "·";
  const sign = positive ? "+" : "";

  return (
    <span className={`${color} tabular-nums`}>
      {sign}
      {value.toFixed(digits)}
      {arrow && <span className="ml-1">{glyph}</span>}
    </span>
  );
}
