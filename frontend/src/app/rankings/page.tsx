import { api } from "@/lib/api";
import { RankingsTable } from "@/components/rankings-table";
import { DataFreshness } from "@/components/data-freshness";
import { PAGE_SIZE } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const rawPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;

  // Already ordered by player_rank server-side; fetch only the visible page.
  const rankings = await api.listRankings({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">
            Path of Legends — Rankings
          </h1>
          <p className="mt-1 text-sm text-fg-muted">
            Top players by Elo rating, ranked by Path of Legends standing.
          </p>
        </div>
        <DataFreshness iso={rankings[0]?.extracted_date} />
      </div>

      <RankingsTable rankings={rankings} page={page} hasNext={rankings.length === PAGE_SIZE} />
    </div>
  );
}
