import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { fmtInt } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function RankingsPage() {
  const rankings = await api.listRankings({ limit: 1000 });
  const sorted = [...rankings].sort((a, b) => a.player_rank - b.player_rank);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">
          Path of Legends — Rankings
        </h1>
        <p className="mt-1 text-sm text-fg-muted">
          Top players by Elo rating. {fmtInt(sorted.length)} entries.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rank</TableHead>
            <TableHead>Player</TableHead>
            <TableHead className="text-right">Elo</TableHead>
            <TableHead className="text-right">Level</TableHead>
            <TableHead>Clan</TableHead>
            <TableHead>Season</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => (
            <TableRow key={`${r.season_id}-${r.player_tag}`}>
              <TableCell>
                <Badge variant={r.player_rank <= 10 ? "gold" : "muted"}>
                  #{r.player_rank}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="text-fg">{r.player_name}</div>
                <div className="font-mono text-xs text-fg-dim">{r.player_tag}</div>
              </TableCell>
              <TableCell className="text-right font-display tabular-nums text-crystal-bright text-glow-crystal">
                {fmtInt(r.elo_rating)}
              </TableCell>
              <TableCell className="text-right tabular-nums text-fg">
                {fmtInt(r.exp_level)}
              </TableCell>
              <TableCell className="font-mono text-xs text-fg-muted">
                {r.clan_tag ?? "—"}
              </TableCell>
              <TableCell className="text-xs text-fg-muted">{r.season_id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
