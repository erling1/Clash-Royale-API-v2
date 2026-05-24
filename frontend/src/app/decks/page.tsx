import { listDecks } from "@/lib/api";
import { Panel } from "@/components/panel";
import { fmtInt, fmtPct } from "@/lib/format";

export default async function DecksPage() {
  const decks = await listDecks(200);

  if (decks.length === 0) {
    return (
      <Panel title="Top Decks" folio="§ I." keybind="D">
        <div className="py-8 text-center text-[var(--color-fg-muted)] label-dim">
          No deck data — is the Rust API running on :3000? Has{" "}
          <span className="text-[var(--color-fg)]">marts.fct_deck_meta</span> been
          built yet?
        </div>
      </Panel>
    );
  }

  return (
    <div className="space-y-6">
      <Panel title="Top Decks" folio="§ I." keybind="D">
        <p className="label-dim mb-2">
          source: <span className="text-[var(--color-fg)]">GET /api/v1/decks</span>
        </p>
        <p className="prose-lede text-[var(--color-fg-dim)] max-w-[68ch]">
          {fmtInt(decks.length)} decks observed in the current data window. Win-rate
          excludes draws. Decks with few appearances have noisy win-rates — sort
          and filter accordingly.
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
              <th className="py-2 pr-4 font-normal text-right">games</th>
              <th className="py-2 pr-4 font-normal text-right text-[var(--color-fg-muted)]">
                W-L-D
              </th>
              <th className="py-2 px-4 font-normal text-right text-[var(--color-fg-muted)]">
                hash
              </th>
            </tr>
          </thead>
          <tbody>
            {decks.map((d) => (
              <tr
                key={d.deck_hash}
                className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
              >
                <td className="py-2 px-4 text-[var(--color-fg-dim)] tabular-nums">
                  {d.popularity_rank.toString().padStart(2, "0")}
                </td>
                <td className="py-2 pr-4">{d.deck_label ?? "—"}</td>
                <td className="py-2 pr-4 text-right tabular-nums">
                  {d.avg_elixir_cost != null ? d.avg_elixir_cost.toFixed(1) : "—"}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums">
                  {d.win_rate != null ? fmtPct(d.win_rate * 100) : "—"}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                  {fmtInt(d.appearance_count)}
                </td>
                <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-fg-muted)] text-xs">
                  {d.win_count}-{d.loss_count}-{d.draw_count}
                </td>
                <td className="py-2 px-4 text-right tabular-nums text-[var(--color-fg-muted)] text-xs">
                  {d.deck_hash.slice(0, 8)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
