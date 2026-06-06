import { api } from "@/lib/api";
import { ClansGrid } from "@/components/clans-grid";
import { PAGE_SIZE } from "@/lib/pagination";

export const dynamic = "force-dynamic";

export default async function ClansPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const rawPage = Number.parseInt(pageParam ?? "1", 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;

  const clans = await api.listClans({ limit: PAGE_SIZE, offset: page * PAGE_SIZE });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Clans</h1>
        <p className="mt-1 text-sm text-fg-muted">Browse tracked clans, sorted by name.</p>
      </div>

      <ClansGrid clans={clans} page={page} hasNext={clans.length === PAGE_SIZE} />
    </div>
  );
}
