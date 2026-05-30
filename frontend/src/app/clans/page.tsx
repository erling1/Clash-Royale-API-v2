import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {clans.map((c) => (
          <Card key={c.clan_tag}>
            <CardHeader>
              <CardTitle className="truncate text-xl">{c.clan_name}</CardTitle>
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="muted" className="font-mono">{c.clan_tag}</Badge>
                {c.clan_badge_id !== null && (
                  <Badge variant="crystal">Badge #{c.clan_badge_id}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  );
}
