"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CardMeta, DeckMeta } from "@/lib/types";

const AXIS_TICK = { fill: "#647084", fontSize: 11 };
const GRID_STROKE = "#e6e9f1";
const TOOLTIP_STYLE = {
  background: "#ffffff",
  border: "1px solid #e6e9f1",
  borderRadius: 8,
  color: "#1b2433",
  boxShadow: "0 8px 24px -12px rgba(16,24,40,0.2)",
} as const;
const CURSOR_FILL = "rgba(47,111,237,0.06)";

export function TopCardsByWinrate({ cards }: { cards: CardMeta[] }) {
  const data = cards
    .filter((c) => c.win_rate !== null && c.appearance_count >= 50)
    .sort((a, b) => (b.win_rate ?? 0) - (a.win_rate ?? 0))
    .slice(0, 10)
    .map((c) => ({
      name: c.card_name ?? `#${c.card_id}`,
      winRatePct: Math.round((c.win_rate ?? 0) * 1000) / 10,
    }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24, top: 8, bottom: 8 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={AXIS_TICK} domain={[0, 100]} unit="%" />
        <YAxis
          type="category"
          dataKey="name"
          tick={AXIS_TICK}
          width={120}
          interval={0}
        />
        <Tooltip
          cursor={{ fill: CURSOR_FILL }}
          contentStyle={TOOLTIP_STYLE}
          formatter={(v) => [`${v as number}%`, "Win rate"]}
        />
        <Bar dataKey="winRatePct" fill="#2faa4d" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TopDecksByPopularity({ decks }: { decks: DeckMeta[] }) {
  const data = [...decks]
    .sort((a, b) => a.popularity_rank - b.popularity_rank)
    .slice(0, 10)
    .map((d) => ({
      name: (d.deck_label ?? d.deck_hash).slice(0, 18),
      plays: d.appearance_count,
      winRate: Math.round((d.win_rate ?? 0) * 1000) / 10,
    }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ left: 0, right: 16, top: 8, bottom: 24 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={AXIS_TICK}
          interval={0}
          angle={-25}
          textAnchor="end"
          height={60}
        />
        <YAxis tick={AXIS_TICK} />
        <Tooltip cursor={{ fill: CURSOR_FILL }} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey="plays" fill="#3b82f6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
