import Link from "next/link";
import { notFound } from "next/navigation";
import { getCard } from "@/lib/api";
import { Panel } from "@/components/panel";
import { MockBanner } from "@/components/mock-banner";
import { Delta } from "@/components/delta";

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cardId = Number(id);
  if (!Number.isFinite(cardId)) notFound();

  const card = await getCard(cardId);
  if (!card) notFound();

  // MOCK: GET /api/v1/cards/{id}/stats
  const MOCK_STATS = {
    usage_pct: 18.4,
    win_rate_when_included: 53.2,
    delta_usage_pct_week: 1.7,
    weighted_appearances: 14_209,
  };

  // MOCK: GET /api/v1/cards/{id}/partners
  const MOCK_PARTNERS = [
    { name: "Hog Rider", co_occurrence: 41.2 },
    { name: "Musketeer", co_occurrence: 35.8 },
    { name: "Skeletons", co_occurrence: 33.1 },
  ];

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
        <MockBanner endpoint={`GET /api/v1/cards/${card.card_id}/stats`} />
        <div className="grid grid-cols-4 gap-6">
          <Stat label="usage %" value={MOCK_STATS.usage_pct.toFixed(1)} />
          <Stat
            label="win % when included"
            value={MOCK_STATS.win_rate_when_included.toFixed(1)}
          />
          <Stat
            label="Δ usage 7d"
            value={<Delta value={MOCK_STATS.delta_usage_pct_week} />}
          />
          <Stat
            label="weighted apps"
            value={MOCK_STATS.weighted_appearances.toLocaleString()}
          />
        </div>
      </Panel>

      <Panel title="Top Partners" folio="§ III." keybind="P">
        <MockBanner endpoint={`GET /api/v1/cards/${card.card_id}/partners`} />
        <table className="w-full text-sm">
          <thead className="text-left label-dim border-b border-[var(--color-rule)]">
            <tr>
              <th className="py-2 pr-4 font-normal">partner</th>
              <th className="py-2 pr-4 font-normal text-right">co-occurrence %</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PARTNERS.map((p) => (
              <tr
                key={p.name}
                className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
              >
                <td className="py-1.5 pr-4">{p.name}</td>
                <td className="py-1.5 pr-4 text-right tabular-nums">
                  {p.co_occurrence.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
