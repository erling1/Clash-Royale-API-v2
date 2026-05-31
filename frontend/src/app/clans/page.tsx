import { api } from "@/lib/api";
import { ClansGrid } from "@/components/clans-grid";
import { fmtInt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ClansPage() {
  const clans = await api.listClans(1000);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Clans</h1>
        <p className="mt-1 text-sm text-fg-muted">{fmtInt(clans.length)} clans indexed.</p>
      </div>

      <ClansGrid clans={clans} />
    </div>
  );
}
