import { api } from "@/lib/api";
import { RankingsTable } from "@/components/rankings-table";
import { DataFreshness } from "@/components/data-freshness";
import { fmtInt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const rankings = await api.listRankings({ limit: 1000 });
  const sorted = [...rankings].sort((a, b) => a.player_rank - b.player_rank);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">
            Path of Legends — Rankings
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Top players by Elo rating. {fmtInt(sorted.length)} entries.
          </p>
        </div>
        <DataFreshness iso={sorted[0]?.extracted_date} />
      </div>

      <RankingsTable rankings={sorted} />
    </div>
  );
}
