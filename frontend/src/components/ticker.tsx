import { Delta } from "./delta";

export interface TickerEvent {
  card_name: string;
  delta_pct: number;
}

interface TickerProps {
  events: TickerEvent[];
}

/**
 * Continuous left-scrolling strip. Doubles the events array so the
 * CSS keyframe (translateX 0 → -50%) creates a seamless loop.
 */
export function Ticker({ events }: TickerProps) {
  if (events.length === 0) return null;
  const loop = [...events, ...events];
  return (
    <div className="border-y border-[var(--color-rule)] bg-[var(--color-bg-elev)] overflow-hidden">
      <div className="ticker-track flex whitespace-nowrap py-2 will-change-transform">
        {loop.map((e, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-4 border-r border-[var(--color-rule)] text-xs"
          >
            <span className="text-[var(--color-fg)]">{e.card_name}</span>
            <Delta value={e.delta_pct} />
          </span>
        ))}
      </div>
    </div>
  );
}
