import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Crown,
  LayoutGrid,
  Layers,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { fmtInt } from "@/lib/format";
import { cn } from "@/lib/utils";
import { TopCardsByWinrate, TopDecksByPopularity } from "./dashboard-charts";
import type { PolRanking } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Tiles use the count endpoints (not full lists); the chart inputs stay small.
  const [cardMeta, topDecks, playerCount, deckCount, rankings] = await Promise.all([
    api.listCardMeta(1000),
    api.listDecks({ limit: 10 }),
    api.countPlayers(),
    api.countDecks(),
    api.listRankings({ limit: 5 }),
  ]);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="panel relative overflow-hidden p-0">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="p-8 md:p-12">
            <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-success">
              <TrendingUp className="h-4 w-4" />
              TRACK. ANALYZE. DOMINATE.
            </div>
            <h1 className="mt-4 font-display text-4xl leading-tight text-fg md:text-5xl">
              Your source for
              <br />
              Arena <span className="text-crystal">Insights</span>
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-fg-muted">
              Real-time stats and data about the meta, decks, cards and players.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/cards">
                  <Layers className="h-4 w-4" />
                  Browse Cards
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-crystal">
                <Link href="/decks">
                  <Crown className="h-4 w-4" />
                  Top Decks
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-crystal">
                <Link href="/rankings">
                  <BarChart3 className="h-4 w-4" />
                  Leaderboard
                </Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[220px] overflow-hidden">
            <Image
              src="/hero-banner.jpg"
              alt="Clash Royale heroes charging into battle"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
              // Fade the left (and a touch of the bottom) edge into the white
              // hero panel so the art blends in instead of sitting in a box.
              style={{
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 38%), linear-gradient(to top, transparent 0%, black 18%)",
                maskComposite: "intersect",
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 38%), linear-gradient(to top, transparent 0%, black 18%)",
                WebkitMaskComposite: "source-in",
              }}
            />
          </div>
        </div>
      </section>

      {/* Stat tiles */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatTile icon={Layers} iconClass="bg-crystal/10 text-crystal" label="Tracked cards" value={fmtInt(cardMeta.length)} />
        <StatTile icon={LayoutGrid} iconClass="bg-success/10 text-success" label="Tracked decks" value={fmtInt(deckCount)} />
        <StatTile icon={Users} iconClass="bg-purple/10 text-purple" label="Tracked players" value={fmtInt(playerCount)} />
        <StatTile
          icon={Trophy}
          iconClass="bg-gold/15 text-gold"
          label="Top Elo"
          value={fmtInt(rankings[0]?.elo_rating ?? null)}
          accent
          subtitle={rankings[0] ? "Rank #1" : undefined}
        />
      </section>

      {/* Charts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top cards by win rate</CardTitle>
            <p className="text-xs text-fg-muted">Min. 50 appearances · top 10</p>
          </CardHeader>
          <CardContent>
            <TopCardsByWinrate cards={cardMeta} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most popular decks</CardTitle>
            <p className="text-xs text-fg-muted">By appearance count · top 10</p>
          </CardHeader>
          <CardContent>
            <TopDecksByPopularity decks={topDecks} />
          </CardContent>
        </Card>
      </section>

      {/* Leaderboard */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl text-fg">
            <Crown className="h-5 w-5 text-gold" />
            CURRENT LEADERBOARD
          </h2>
          <Link
            href="/rankings"
            className="inline-flex items-center gap-1.5 rounded-lg border border-success/40 px-3 py-1.5 text-sm font-medium text-success transition-colors hover:bg-success/10"
          >
            View full leaderboard
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {rankings.map((r, i) => (
            <LeaderCard key={`${r.season_id}-${r.player_tag}`} rank={r} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatTile({
  icon: Icon,
  iconClass,
  label,
  value,
  accent,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
  value: string;
  accent?: boolean;
  subtitle?: string;
}) {
  return (
    <div className={cn("p-5", accent ? "panel-accent" : "panel")}>
      <div className="flex items-center gap-3">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", iconClass)}>
          <Icon className="h-6 w-6" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
          {label}
        </span>
      </div>
      <div
        className={cn(
          "mt-3 font-display text-3xl",
          accent ? "text-success" : "text-fg",
        )}
      >
        {value}
      </div>
      {subtitle && <div className="mt-1 text-xs text-fg-muted">{subtitle}</div>}
    </div>
  );
}

const RANK_BADGE = ["bg-gold", "bg-fg-dim", "bg-[#cd7f32]"] as const;

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

function LeaderCard({ rank, index }: { rank: PolRanking; index: number }) {
  return (
    <Link
      href={`/players/${encodeURIComponent(rank.player_tag)}` as `/players/${string}`}
      className={cn(
        "relative flex flex-col items-center rounded-xl p-5 text-center transition-all hover:-translate-y-0.5",
        index === 0 ? "panel-gold" : "panel hover:panel-gold",
      )}
    >
      <span
        className={cn(
          "absolute left-3 top-3 flex h-6 w-7 items-center justify-center rounded-md text-xs font-bold text-white",
          RANK_BADGE[index] ?? "bg-royal",
        )}
      >
        {rank.player_rank}
      </span>
      <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-royal-bright to-purple font-display text-xl text-white ring-2 ring-bg-panel">
        {initials(rank.player_name)}
      </span>
      <div className="mt-3 max-w-full truncate font-display text-fg">{rank.player_name}</div>
      <div className="text-xs text-fg-dim">{rank.player_tag}</div>
      <div className="mt-2 flex items-center gap-1.5 font-display text-xl text-success">
        <Trophy className="h-4 w-4 text-gold" />
        {fmtInt(rank.elo_rating)}
      </div>
    </Link>
  );
}
