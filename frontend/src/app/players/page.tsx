import { api } from "@/lib/api";
import { PlayersGrid } from "@/components/players-grid";
import { PAGE_SIZE } from "@/lib/pagination";
import { fmtInt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const rawPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;

  // Only the visible page is fetched; total drives the result count + last page.
  const [players, total] = await Promise.all([
    api.listPlayers({ limit: PAGE_SIZE, offset: page * PAGE_SIZE }),
    api.countPlayers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Players</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {fmtInt(total)} tracked players · sorted by trophies.
        </p>
      </div>

      <PlayersGrid
        players={players}
        page={page}
        total={total}
        hasNext={(page + 1) * PAGE_SIZE < total}
      />
    </div>
  );
}
