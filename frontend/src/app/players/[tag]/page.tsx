import Link from "next/link";
import { notFound } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { PlayerBattlesTab } from "./battles-tab";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fmtInt, fmtPct } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);

  let player;
  try {
    player = await api.getPlayer(decodedTag);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  return (
    <div className="space-y-8">
      <Link href="/players" className="text-sm text-fg-muted hover:text-fg">
        ← All players
      </Link>

      <header className="space-y-2">
        <h1 className="font-display text-4xl tracking-wide text-fg text-glow-gold">
          {player.player_name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Badge variant="muted" className="font-mono">{player.player_tag}</Badge>
          {player.clan_tag && <Badge variant="crystal">Clan {player.clan_tag}</Badge>}
          {player.clan_role && <Badge variant="magic" className="capitalize">{player.clan_role}</Badge>}
          <Badge variant="gold">Level {player.exp_level}</Badge>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Trophies" value={fmtInt(player.trophies)} accent="gold" />
        <Stat label="Best trophies" value={fmtInt(player.best_trophies)} />
        <Stat label="Win rate" value={fmtPct(player.win_rate)} accent="crystal" />
        <Stat label="Battles" value={fmtInt(player.battle_count)} />
        <Stat label="Wins" value={fmtInt(player.wins)} />
        <Stat label="Losses" value={fmtInt(player.losses)} />
        <Stat label="3-crown wins" value={fmtInt(player.three_crown_wins)} />
        <Stat label="Streak" value={fmtInt(player.current_win_lose_streak)} />
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="battles">Battles</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailGroup
              title="Donations"
              items={[
                ["Donations", fmtInt(player.donations)],
                ["Received", fmtInt(player.donations_received)],
                ["Total", fmtInt(player.total_donations)],
                ["Clan cards collected", fmtInt(player.clan_cards_collected)],
              ]}
            />
            <DetailGroup
              title="Tournaments & challenges"
              items={[
                ["Challenge cards won", fmtInt(player.challenge_cards_won)],
                ["Challenge max wins", fmtInt(player.challenge_max_wins)],
                ["Tournament cards", fmtInt(player.tournament_cards_won)],
                ["Tournament battles", fmtInt(player.tournament_battle_count)],
              ]}
            />
            <DetailGroup
              title="Progression"
              items={[
                ["XP points", fmtInt(player.exp_points)],
                ["Total XP", fmtInt(player.total_exp_points)],
                ["Star points", fmtInt(player.star_points)],
                ["War day wins", fmtInt(player.war_day_wins)],
              ]}
            />
            <DetailGroup
              title="Meta"
              items={[
                ["Arena ID", String(player.arena_id)],
                ["Extracted", player.extracted_date],
                [
                  "Legacy trophy road",
                  player.legacy_trophy_road_high_score === null
                    ? "—"
                    : fmtInt(player.legacy_trophy_road_high_score),
                ],
              ]}
            />
          </div>
        </TabsContent>
        <TabsContent value="battles">
          <PlayerBattlesTab playerTag={player.player_tag} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "gold" | "crystal";
}) {
  const tone =
    accent === "gold"
      ? "text-gold text-glow-gold"
      : accent === "crystal"
        ? "text-crystal-bright text-glow-crystal"
        : "text-fg";
  return (
    <div className="panel px-4 py-3">
      <div className="text-xs uppercase tracking-wider text-fg-muted">{label}</div>
      <div className={`mt-1 font-display text-2xl ${tone}`}>{value}</div>
    </div>
  );
}

function DetailGroup({ title, items }: { title: string; items: [string, string][] }) {
  return (
    <div className="panel p-4">
      <h3 className="font-display text-lg text-fg mb-3">{title}</h3>
      <dl className="space-y-1.5 text-sm">
        {items.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-3">
            <dt className="text-fg-muted">{k}</dt>
            <dd className="tabular-nums text-fg">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
