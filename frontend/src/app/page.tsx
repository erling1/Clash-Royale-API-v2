import Link from "next/link";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { fmtInt } from "@/lib/format";
import { TopCardsByWinrate, TopDecksByPopularity } from "./dashboard-charts";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [cards, decks, players, rankings] = await Promise.all([
    api.listCardMeta(1000),
    api.listDecks(1000),
    api.listPlayers(1000),
    api.listRankings({ limit: 5 }),
  ]);

  return (
    <div className="space-y-10">
      <section className="panel panel-gold relative overflow-hidden p-8 md:p-12">
        <div className="relative z-10 max-w-2xl">
          <Badge variant="crystal" className="mb-3">unofficial · community stats</Badge>
          <h1 className="font-display text-5xl md:text-6xl tracking-wide text-fg text-glow-gold">
            Arena Insights
          </h1>
          <p className="mt-4 text-fg-muted text-lg leading-relaxed">
            A non-commercial fan dashboard for exploring battle, deck, and player data.
            Browse the meta, dig into card synergies, and follow Path of Legends leaderboards.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/cards" className="panel px-5 py-2.5 font-display tracking-wide hover:panel-gold">
              Browse cards →
            </Link>
            <Link href="/decks" className="panel px-5 py-2.5 font-display tracking-wide hover:panel-gold">
              Top decks →
            </Link>
            <Link href="/rankings" className="panel px-5 py-2.5 font-display tracking-wide hover:panel-gold">
              Leaderboard →
            </Link>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Tile label="Tracked cards" value={fmtInt(cards.length)} />
        <Tile label="Tracked decks" value={fmtInt(decks.length)} />
        <Tile label="Tracked players" value={fmtInt(players.length)} />
        <Tile label="Top Elo" value={fmtInt(rankings[0]?.elo_rating ?? null)} accent="crystal" />
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top cards by win rate</CardTitle>
            <p className="text-xs text-fg-muted">Min. 50 appearances · top 10</p>
          </CardHeader>
          <CardContent>
            <TopCardsByWinrate cards={cards} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most popular decks</CardTitle>
            <p className="text-xs text-fg-muted">By appearance count · top 10</p>
          </CardHeader>
          <CardContent>
            <TopDecksByPopularity decks={decks} />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="font-display text-2xl tracking-wide text-fg mb-3">
          Current leaderboard
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {rankings.map((r) => (
            <Link key={`${r.season_id}-${r.player_tag}`} href={`/players/${r.player_tag}` as `/players/${string}`}>
              <div className="panel p-4 transition-all hover:panel-gold hover:-translate-y-0.5">
                <Badge variant={r.player_rank <= 3 ? "gold" : "muted"}>#{r.player_rank}</Badge>
                <div className="mt-2 truncate font-display text-lg text-fg">{r.player_name}</div>
                <div className="text-xs text-fg-dim">{r.player_tag}</div>
                <div className="mt-2 font-display text-xl text-crystal-bright text-glow-crystal">
                  {fmtInt(r.elo_rating)} <span className="text-xs text-fg-muted">Elo</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "crystal";
}) {
  const tone =
    accent === "crystal"
      ? "text-crystal-bright text-glow-crystal"
      : "text-gold text-glow-gold";
  return (
    <div className="panel p-4">
      <div className="text-xs uppercase tracking-wider text-fg-muted">{label}</div>
      <div className={`mt-1 font-display text-3xl ${tone}`}>{value}</div>
    </div>
  );
}
