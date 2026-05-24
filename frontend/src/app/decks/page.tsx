import { Panel } from "@/components/panel";
import { MockBanner } from "@/components/mock-banner";
import { Delta } from "@/components/delta";

// MOCK: GET /api/v1/decks/top?limit=500
const MOCK_DECKS = [
  { rank: 1,  hash: "a1b2", name: "Drill Cycle 2.6",          avg_elixir: 2.6, win: 62.4, use: 4.1, delta: 1.3 },
  { rank: 2,  hash: "b2c3", name: "Log Bait",                 avg_elixir: 3.4, win: 58.9, use: 3.4, delta: 0.8 },
  { rank: 3,  hash: "c3d4", name: "Hog 2.6 Cycle",            avg_elixir: 2.6, win: 56.7, use: 5.2, delta: -0.2 },
  { rank: 4,  hash: "d4e5", name: "X-Bow 2.9",                avg_elixir: 2.9, win: 55.4, use: 2.1, delta: 2.4 },
  { rank: 5,  hash: "e5f6", name: "Royal Recruits Bridge",    avg_elixir: 4.0, win: 54.8, use: 1.9, delta: 0.4 },
  { rank: 6,  hash: "f6g7", name: "Pekka Bridge Spam",        avg_elixir: 3.7, win: 54.1, use: 3.7, delta: -1.1 },
  { rank: 7,  hash: "g7h8", name: "Mortar Cycle",             avg_elixir: 2.8, win: 53.9, use: 1.4, delta: 0.6 },
  { rank: 8,  hash: "h8i9", name: "Lava Loon",                avg_elixir: 4.1, win: 53.2, use: 2.8, delta: -0.7 },
  { rank: 9,  hash: "i9j0", name: "Goblin Giant Sparky",      avg_elixir: 4.3, win: 52.8, use: 1.7, delta: 1.1 },
  { rank: 10, hash: "j0k1", name: "Miner Wall Breakers",      avg_elixir: 3.0, win: 52.6, use: 2.3, delta: 0.9 },
  { rank: 11, hash: "k1l2", name: "Golem Beatdown",           avg_elixir: 4.4, win: 52.1, use: 1.2, delta: -0.4 },
  { rank: 12, hash: "l2m3", name: "Ram Rider Bait",           avg_elixir: 3.5, win: 51.8, use: 2.6, delta: 0.3 },
  { rank: 13, hash: "m3n4", name: "Three Musketeers",         avg_elixir: 4.2, win: 51.4, use: 1.1, delta: 0.2 },
  { rank: 14, hash: "n4o5", name: "Royal Giant Lightning",    avg_elixir: 3.8, win: 51.2, use: 1.9, delta: -0.5 },
  { rank: 15, hash: "o5p6", name: "Balloon Freeze",           avg_elixir: 3.6, win: 50.9, use: 1.4, delta: 0.7 },
];

export default function DecksPage() {
  return (
    <div className="space-y-6">
      <Panel title="Top Decks — Week 23.4" folio="§ I." keybind="D">
        <MockBanner endpoint="GET /api/v1/decks/top?week=current&limit=N" />
        <p className="prose-lede text-[var(--color-fg-dim)] max-w-[68ch]">
          This page renders the top decks aggregated server-side. The actix-web
          API exposes raw battles and deck-cards, but no aggregation. Once an
          endpoint that GROUPs deck-cards by participant and joins win-rates
          ships, swap the mock array in <span className="text-[var(--color-fg)]">src/app/decks/page.tsx</span>{" "}
          for a real fetch.
        </p>
      </Panel>

      <Panel title="Ranked" folio="§ II." noPadding>
        <table className="w-full text-sm">
          <thead className="text-left label-dim border-b border-[var(--color-rule)]">
            <tr>
              <th className="py-2 px-4 font-normal w-[48px]">#</th>
              <th className="py-2 pr-4 font-normal">deck</th>
              <th className="py-2 pr-4 font-normal text-right">avg elx</th>
              <th className="py-2 pr-4 font-normal text-right">win %</th>
              <th className="py-2 pr-4 font-normal text-right">use %</th>
              <th className="py-2 pr-4 font-normal text-right">Δ 7d</th>
              <th className="py-2 px-4 font-normal text-right text-[var(--color-fg-muted)]">
                hash
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_DECKS.map((d) => (
              <tr
                key={d.hash}
                className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
              >
                <td className="py-2 px-4 text-[var(--color-fg-dim)] tabular-nums">
                  {d.rank.toString().padStart(2, "0")}
                </td>
                <td className="py-2 pr-4">{d.name}</td>
                <td className="py-2 pr-4 text-right tabular-nums">
                  {d.avg_elixir.toFixed(1)}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums">
                  {d.win.toFixed(1)}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                  {d.use.toFixed(1)}
                </td>
                <td className="py-2 pr-4 text-right">
                  <Delta value={d.delta} />
                </td>
                <td className="py-2 px-4 text-right tabular-nums text-[var(--color-fg-muted)] text-xs">
                  {d.hash}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
