import { api } from "@/lib/api";
import { PlayersGrid } from "@/components/players-grid";
import { fmtInt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PlayersPage() {
  const players = await api.listPlayers(1000);
  const sorted = [...players].sort((a, b) => b.trophies - a.trophies);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">Players</h1>
        <p className="mt-1 text-sm text-fg-muted">
          {fmtInt(players.length)} tracked players · sorted by trophies.
        </p>
      </div>

      <PlayersGrid players={sorted} />
    </div>
  );
}
