import Link from "next/link";
import { listCards } from "@/lib/api";
import { Panel } from "@/components/panel";
import { fmtInt } from "@/lib/format";

export default async function CardsPage() {
  const cards = await listCards();

  if (cards.length === 0) {
    return (
      <Panel title="Cards" folio="§">
        <div className="py-8 text-center text-[var(--color-fg-muted)] label-dim">
          No cards returned by /api/v1/cards — is the Rust API running on :3000?
        </div>
      </Panel>
    );
  }

  const byRarity = cards.reduce<Record<string, typeof cards>>((acc, c) => {
    (acc[c.rarity] ??= []).push(c);
    return acc;
  }, {});
  const rarities = Object.keys(byRarity).sort();

  return (
    <div className="space-y-6">
      <Panel
        title={`Card Catalog — ${fmtInt(cards.length)} cards`}
        folio="§ I."
        keybind="C"
      >
        <p className="label-dim mb-2">
          source: <span className="text-[var(--color-fg)]">GET /api/v1/cards</span>
        </p>
        <p className="prose-lede text-[var(--color-fg-dim)]">
          Usage %, win rate and weekly Δ are not exposed by the API yet. Once
          /api/v1/cards/stats exists, those columns appear here.
        </p>
      </Panel>

      {rarities.map((rarity) => (
        <Panel key={rarity} title={rarity.toUpperCase()} folio="§">
          <table className="w-full text-sm">
            <thead className="text-left label-dim border-b border-[var(--color-rule)]">
              <tr>
                <th className="py-2 pr-4 font-normal">card</th>
                <th className="py-2 pr-4 font-normal text-right">elixir</th>
                <th className="py-2 pr-4 font-normal text-right">max lvl</th>
                <th className="py-2 pr-4 font-normal text-right">evo lvl</th>
                <th className="py-2 pr-4 font-normal text-right text-[var(--color-fg-muted)]">
                  id
                </th>
              </tr>
            </thead>
            <tbody>
              {byRarity[rarity]
                .sort((a, b) => (a.elixir_cost ?? 99) - (b.elixir_cost ?? 99))
                .map((c) => (
                  <tr
                    key={c.card_id}
                    className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="py-1.5 pr-4">
                      <Link
                        href={`/cards/${c.card_id}`}
                        className="hover:text-[var(--color-accent)]"
                      >
                        {c.card_name}
                      </Link>
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {c.elixir_cost ?? "—"}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                      {c.max_level}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                      {c.max_evolution_level ?? "—"}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums text-[var(--color-fg-muted)] text-xs">
                      {c.card_id}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </Panel>
      ))}
    </div>
  );
}
