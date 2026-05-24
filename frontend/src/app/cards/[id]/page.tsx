import Link from "next/link";
import { notFound } from "next/navigation";
import { getCard, getCardMeta, listCardPairs } from "@/lib/api";
import { Panel } from "@/components/panel";
import { MockBanner } from "@/components/mock-banner";
import { fmtInt, fmtPct } from "@/lib/format";

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isFinite(cardId)) notFound();

  const [card, meta, pairs] = await Promise.all([
    getCard(cardId),
    getCardMeta(cardId),
    listCardPairs({ cardId, limit: 10 }),
  ]);
  if (!card) notFound();

  // Partner = the other card in each pair. Co-occurrence ratio = pair_count / this_card_appearances.
  const partners = pairs.map((p) => {
    const isA = p.card_id_a === cardId;
    return {
      partner_id: isA ? p.card_id_b : p.card_id_a,
      partner_name: isA ? p.card_name_b : p.card_name_a,
      co_occurrence_count: p.co_occurrence_count,
      co_occurrence_pct:
        meta && meta.appearance_count > 0
          ? (p.co_occurrence_count / meta.appearance_count) * 100
          : null,
      joint_win_rate: p.joint_win_rate,
    };
  });

  return (
    <div className="space-y-6">
      <Panel title={card.card_name.toUpperCase()} folio="§ I.">
        <div className="grid grid-cols-4 gap-6">
          <Stat label="rarity" value={card.rarity} />
          <Stat label="elixir" value={card.elixir_cost?.toFixed(1) ?? "—"} />
          <Stat label="max level" value={String(card.max_level)} />
          <Stat
            label="evo level"
            value={card.max_evolution_level?.toString() ?? "—"}
          />
        </div>
      </Panel>

      <Panel title="Usage" folio="§ II." keybind="U">
        {meta == null ? (
          <MockBanner endpoint={`GET /api/v1/card-meta/${card.card_id} (no data yet)`} />
        ) : (
          <>
            <p className="label-dim mb-3">
              source:{" "}
              <span className="text-[var(--color-fg)]">
                GET /api/v1/card-meta/{card.card_id}
              </span>
            </p>
            <div className="grid grid-cols-4 gap-6">
              <Stat
                label="usage %"
                value={meta.usage_pct != null ? fmtPct(meta.usage_pct * 100) : "—"}
              />
              <Stat
                label="inclusion %"
                value={
                  meta.inclusion_rate != null ? fmtPct(meta.inclusion_rate * 100) : "—"
                }
              />
              <Stat
                label="win % when included"
                value={meta.win_rate != null ? fmtPct(meta.win_rate * 100) : "—"}
              />
              <Stat label="appearances" value={fmtInt(meta.appearance_count)} />
              <Stat
                label="evolution %"
                value={meta.evolution_pct != null ? fmtPct(meta.evolution_pct * 100) : "—"}
              />
              <Stat label="popularity rank" value={`#${meta.popularity_rank}`} />
              <Stat
                label="avg card level"
                value={meta.avg_card_level != null ? meta.avg_card_level.toFixed(1) : "—"}
              />
              <Stat
                label="W-L-D"
                value={`${meta.win_count}-${meta.loss_count}-${meta.draw_count}`}
              />
            </div>
          </>
        )}
      </Panel>

      <Panel title="Top Partners" folio="§ III." keybind="P">
        {partners.length === 0 ? (
          <div className="py-6 text-center text-[var(--color-fg-muted)] label-dim">
            no partner data for this card
          </div>
        ) : (
          <>
            <p className="label-dim mb-3">
              source:{" "}
              <span className="text-[var(--color-fg)]">
                GET /api/v1/card-pairs?card_id={card.card_id}
              </span>
            </p>
            <table className="w-full text-sm">
              <thead className="text-left label-dim border-b border-[var(--color-rule)]">
                <tr>
                  <th className="py-2 pr-4 font-normal">partner</th>
                  <th className="py-2 pr-4 font-normal text-right">co-occurrence %</th>
                  <th className="py-2 pr-4 font-normal text-right">co-occurrence n</th>
                  <th className="py-2 pr-4 font-normal text-right">joint win %</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr
                    key={p.partner_id}
                    className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="py-1.5 pr-4">
                      <Link
                        href={`/cards/${p.partner_id}`}
                        className="hover:text-[var(--color-accent)]"
                      >
                        {p.partner_name ?? `#${p.partner_id}`}
                      </Link>
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {p.co_occurrence_pct != null ? fmtPct(p.co_occurrence_pct) : "—"}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                      {fmtInt(p.co_occurrence_count)}
                    </td>
                    <td className="py-1.5 pr-4 text-right tabular-nums">
                      {p.joint_win_rate != null ? fmtPct(p.joint_win_rate * 100) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </Panel>

      <div>
        <Link
          href="/cards"
          className="label-dim hover:text-[var(--color-accent)]"
        >
          ← back to catalog
        </Link>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="label-dim">{label}</div>
      <div className="mt-1 text-[var(--text-lg)] tabular-nums">{value}</div>
    </div>
  );
}
