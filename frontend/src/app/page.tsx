import Link from "next/link";
import { listCards, listDecks, listRankings } from "@/lib/api";
import { Panel } from "@/components/panel";
import { Ticker } from "@/components/ticker";
import { Delta } from "@/components/delta";
import { MockBanner } from "@/components/mock-banner";
import { fmtInt, fmtPct, displayTag } from "@/lib/format";

/* ─────────────────────────────────────────────────────────────────────
   MOCK DATA — replace once the listed endpoints exist.
   Search for `MOCK:` in this repo to find every site that needs a swap.
   ───────────────────────────────────────────────────────────────────── */

// MOCK: GET /api/v1/meta/ticker?window=24h
const MOCK_TICKER = [
  { card_name: "Goblin Drill", delta_pct: 2.1 },
  { card_name: "Mega Knight", delta_pct: -3.4 },
  { card_name: "Little Prince", delta_pct: 4.1 },
  { card_name: "Hog Rider", delta_pct: 0.1 },
  { card_name: "Skeleton King", delta_pct: -5.8 },
  { card_name: "Wall Breakers", delta_pct: 3.7 },
  { card_name: "Mother Witch", delta_pct: -3.2 },
  { card_name: "Musketeer", delta_pct: -0.3 },
  { card_name: "Fireball", delta_pct: 0.2 },
  { card_name: "Royal Recruits", delta_pct: 1.4 },
];

// MOCK: GET /api/v1/meta/lede
const MOCK_LEDE = {
  paragraphs: [
    "Three things shifted this week. Mega Knight usage collapsed after the Saturday balance patch — down 11 points in two days.",
    "Log-bait is quietly the highest win-rate archetype at 5000+ for the first time since Season 19. And a fringe X-Bow variant is climbing the top-200 ladder fast enough to matter.",
  ],
  editor: "the editor",
  date: "2026-05-25",
};

// MOCK: GET /api/v1/meta/movers
const MOCK_MOVERS = {
  rising: [
    { name: "Goblin Drill", delta: 6.2 },
    { name: "Little Prince", delta: 4.1 },
    { name: "Wall Breakers", delta: 3.7 },
    { name: "Royal Hogs", delta: 2.4 },
    { name: "Phoenix", delta: 1.9 },
  ],
  falling: [
    { name: "Mega Knight", delta: -11.4 },
    { name: "Skeleton King", delta: -5.8 },
    { name: "Mother Witch", delta: -3.2 },
    { name: "Pekka", delta: -2.7 },
    { name: "Goblin Cage", delta: -1.5 },
  ],
  anchored: [
    { name: "Hog Rider", delta: 0.1 },
    { name: "Musketeer", delta: -0.3 },
    { name: "Fireball", delta: 0.2 },
    { name: "Log", delta: -0.1 },
    { name: "Skeletons", delta: 0.0 },
  ],
};

/* ─────────────────────────────────────────────────────────────────── */

export default async function HomePage() {
  // Real data — fetched server-side. Falls back gracefully if API is down.
  const [cards, rankings, decks] = await Promise.all([
    listCards(),
    listRankings(10),
    listDecks(6),
  ]);

  return (
    <div className="space-y-6">
      {/* TICKER — mocked */}
      <Ticker events={MOCK_TICKER} />

      {/* LEDE — mocked */}
      <Panel title="The Lede" folio="§ I." keybind="L">
        <MockBanner endpoint="GET /api/v1/meta/lede" />
        <div className="prose-lede max-w-[68ch] space-y-3">
          {MOCK_LEDE.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
        <div className="mt-4 label-dim">
          — by {MOCK_LEDE.editor} · {MOCK_LEDE.date}
        </div>
      </Panel>

      {/* META MAP — placeholder; signature viz lands here */}
      <Panel title="The Meta Map" folio="§ II." keybind="M" noPadding>
        <div className="px-4 py-3">
          <MockBanner endpoint="GET /api/v1/meta/snapshot" />
        </div>
        <div className="relative h-[420px] border-t border-[var(--color-rule)] flex items-center justify-center text-[var(--color-fg-muted)]">
          <div className="text-center space-y-2">
            <div className="label-section">[ signature viz ]</div>
            <div className="label-dim">
              usage % × win-rate · sized by appearances · colored by Δ
            </div>
            <div className="label-dim">
              awaiting <span className="text-[var(--color-fg)]">/meta/snapshot</span>
            </div>
          </div>
        </div>
      </Panel>

      {/* MOVERS */}
      <Panel title="Movers" folio="§ III." keybind="V">
        <MockBanner endpoint="GET /api/v1/meta/movers" />
        <div className="grid grid-cols-3 gap-6">
          <MoversColumn label="Rising" tone="up" items={MOCK_MOVERS.rising} />
          <MoversColumn label="Falling" tone="down" items={MOCK_MOVERS.falling} />
          <MoversColumn label="Anchored" tone="flat" items={MOCK_MOVERS.anchored} />
        </div>
      </Panel>

      {/* TOP DECKS */}
      <Panel
        title="Top Decks"
        folio="§ IV."
        keybind="G D"
        rightSlot={
          <Link
            href="/decks"
            className="label-dim hover:text-[var(--color-accent)]"
          >
            see all →
          </Link>
        }
      >
        {decks.length === 0 ? (
          <EmptyState message="No deck data — has marts.fct_deck_meta been built?" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left label-dim border-b border-[var(--color-rule)]">
              <tr>
                <th className="py-2 pr-4 font-normal w-[36px]">#</th>
                <th className="py-2 pr-4 font-normal">deck</th>
                <th className="py-2 pr-4 font-normal text-right">avg elx</th>
                <th className="py-2 pr-4 font-normal text-right">win %</th>
                <th className="py-2 pr-4 font-normal text-right">games</th>
              </tr>
            </thead>
            <tbody>
              {decks.map((d) => (
                <tr
                  key={d.deck_hash}
                  className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
                >
                  <td className="py-2 pr-4 text-[var(--color-fg-dim)] tabular-nums">
                    {d.popularity_rank.toString().padStart(2, "0")}
                  </td>
                  <td className="py-2 pr-4">{d.deck_label ?? "—"}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                    {d.avg_elixir_cost != null ? d.avg_elixir_cost.toFixed(1) : "—"}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {d.win_rate != null ? fmtPct(d.win_rate * 100) : "—"}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                    {fmtInt(d.appearance_count)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* TOP PLAYERS — REAL data from /rankings */}
      <Panel
        title="Path of Legends — Top 10"
        folio="§ V."
        keybind="G P"
        rightSlot={
          <Link
            href="/players"
            className="label-dim hover:text-[var(--color-accent)]"
          >
            see all →
          </Link>
        }
      >
        {rankings.length === 0 ? (
          <EmptyState message="No rankings data — is the Rust API running on :3000?" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left label-dim border-b border-[var(--color-rule)]">
              <tr>
                <th className="py-2 pr-4 font-normal w-[36px]">#</th>
                <th className="py-2 pr-4 font-normal">player</th>
                <th className="py-2 pr-4 font-normal text-[var(--color-fg-muted)]">tag</th>
                <th className="py-2 pr-4 font-normal text-right">elo</th>
                <th className="py-2 pr-4 font-normal text-right">lvl</th>
              </tr>
            </thead>
            <tbody>
              {rankings.slice(0, 10).map((r) => (
                <tr
                  key={r.player_tag}
                  className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
                >
                  <td className="py-2 pr-4 text-[var(--color-fg-dim)] tabular-nums">
                    {r.player_rank.toString().padStart(2, "0")}
                  </td>
                  <td className="py-2 pr-4">
                    <Link
                      href={`/players/${encodeURIComponent(r.player_tag)}`}
                      className="hover:text-[var(--color-accent)]"
                    >
                      {r.player_name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-[var(--color-fg-muted)] text-xs">
                    {displayTag(r.player_tag)}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">{fmtInt(r.elo_rating)}</td>
                  <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                    {r.exp_level}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Panel>

      {/* CARDS — REAL data from /cards */}
      <Panel
        title="Card Catalog"
        folio="§ VI."
        keybind="G C"
        rightSlot={
          <Link
            href="/cards"
            className="label-dim hover:text-[var(--color-accent)]"
          >
            see all →
          </Link>
        }
      >
        {cards.length === 0 ? (
          <EmptyState message="No cards data — is the Rust API running on :3000?" />
        ) : (
          <div className="label-dim mb-3">
            {fmtInt(cards.length)} cards · sorted by elixir cost
          </div>
        )}
        {cards.length > 0 && (
          <div className="grid grid-cols-2 gap-x-8">
            {[...cards]
              .sort((a, b) => (a.elixir_cost ?? 99) - (b.elixir_cost ?? 99))
              .slice(0, 16)
              .map((c) => (
                <Link
                  key={c.card_id}
                  href={`/cards/${c.card_id}`}
                  className="flex justify-between py-1.5 border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-accent)] text-sm"
                >
                  <span>{c.card_name}</span>
                  <span className="flex gap-3 text-xs text-[var(--color-fg-dim)]">
                    <span className="uppercase tracking-wider">{c.rarity}</span>
                    <span className="tabular-nums w-6 text-right">
                      {c.elixir_cost ?? "—"}
                    </span>
                  </span>
                </Link>
              ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ─────────────── helper components scoped to this page ─────────────── */

function MoversColumn({
  label,
  tone,
  items,
}: {
  label: string;
  tone: "up" | "down" | "flat";
  items: { name: string; delta: number }[];
}) {
  return (
    <div>
      <div className="label-section pb-2 border-b border-[var(--color-rule)] flex justify-between">
        <span>{label}</span>
        <span className="label-dim">last 7d</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {items.map((it) => (
          <li key={it.name} className="flex justify-between text-sm">
            <span>{it.name}</span>
            <span className="tabular-nums">
              <Delta value={it.delta} arrow={tone !== "flat"} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-8 text-center text-[var(--color-fg-muted)] label-dim">
      {message}
    </div>
  );
}
