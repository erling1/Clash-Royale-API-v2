import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtInt, fmtPct } from "@/lib/format";

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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((p) => (
          <Link
            key={p.player_tag}
            href={`/players/${p.player_tag}` as `/players/${string}`}
          >
            <Card className="transition-all hover:panel-gold hover:-translate-y-0.5">
              <CardHeader>
                <CardTitle className="text-xl">{p.player_name}</CardTitle>
                <p className="text-xs font-mono text-fg-dim">{p.player_tag}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Stat label="Trophies" value={fmtInt(p.trophies)} highlight />
                  <Stat label="Best" value={fmtInt(p.best_trophies)} />
                  <Stat label="Win rate" value={fmtPct(p.win_rate)} />
                  <Stat label="Wins" value={fmtInt(p.wins)} />
                  <Stat label="Losses" value={fmtInt(p.losses)} />
                  <Stat label="Level" value={fmtInt(p.exp_level)} />
                </div>
                {p.clan_tag && (
                  <div className="mt-3">
                    <Badge variant="crystal">Clan {p.clan_tag}</Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-fg-dim">{label}</div>
      <div className={highlight ? "font-display text-gold text-glow-gold" : "text-fg"}>{value}</div>
    </div>
  );
}
