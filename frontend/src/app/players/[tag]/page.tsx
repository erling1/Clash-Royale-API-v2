import Link from "next/link";
import { notFound } from "next/navigation";
import { getPlayer, listBattles } from "@/lib/api";
import { Panel } from "@/components/panel";
import { fmtInt, fmtPct, displayTag, fmtDate } from "@/lib/format";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);

  const [player, battles] = await Promise.all([
    getPlayer(decoded),
    listBattles({ playerTag: decoded, limit: 30 }),
  ]);

  if (!player) notFound();

  const winLoss = player.wins + player.losses;
  const winRate = winLoss > 0 ? (player.wins / winLoss) * 100 : 0;

  return (
    <div className="space-y-6">
      <Panel title={player.player_name.toUpperCase()} folio="§ I.">
        <div className="flex items-baseline gap-3 mb-4">
          <span className="label-dim">{displayTag(player.player_tag)}</span>
          {player.clan_tag && (
            <span className="label-dim">
              · clan <span className="text-[var(--color-fg)]">{displayTag(player.clan_tag)}</span>
              {player.clan_role && <span> · {player.clan_role}</span>}
            </span>
          )}
        </div>
        <div className="grid grid-cols-4 gap-6">
          <Stat label="trophies" value={fmtInt(player.trophies)} />
          <Stat label="best" value={fmtInt(player.best_trophies)} />
          <Stat label="exp lvl" value={String(player.exp_level)} />
          <Stat label="arena" value={`#${player.arena_id}`} />
        </div>
      </Panel>

      <Panel title="Ladder Record" folio="§ II.">
        <div className="grid grid-cols-4 gap-6">
          <Stat label="battles" value={fmtInt(player.battle_count)} />
          <Stat label="wins" value={fmtInt(player.wins)} />
          <Stat label="losses" value={fmtInt(player.losses)} />
          <Stat
            label="win rate"
            value={player.win_rate != null ? fmtPct(player.win_rate * 100) : fmtPct(winRate)}
          />
        </div>
      </Panel>

      <Panel title="Challenge Record" folio="§ III.">
        <div className="grid grid-cols-4 gap-6">
          <Stat label="3-crown wins" value={fmtInt(player.three_crown_wins)} />
          <Stat label="war day wins" value={fmtInt(player.war_day_wins)} />
          <Stat label="challenge cards" value={fmtInt(player.challenge_cards_won)} />
          <Stat label="challenge max" value={fmtInt(player.challenge_max_wins)} />
        </div>
      </Panel>

      <Panel
        title={`Recent Battles — ${battles.length}`}
        folio="§ IV."
        keybind="B"
      >
        {battles.length === 0 ? (
          <div className="py-6 text-center text-[var(--color-fg-muted)] label-dim">
            no battles returned for this tag
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left label-dim border-b border-[var(--color-rule)]">
              <tr>
                <th className="py-2 pr-4 font-normal">time</th>
                <th className="py-2 pr-4 font-normal">mode</th>
                <th className="py-2 pr-4 font-normal">arena</th>
                <th className="py-2 pr-4 font-normal text-center">crowns</th>
                <th className="py-2 pr-4 font-normal text-right">result</th>
                <th className="py-2 pr-4 font-normal text-right text-[var(--color-fg-muted)]">
                  battle
                </th>
              </tr>
            </thead>
            <tbody>
              {battles.map((b) => {
                const score = `${b.team_crowns}–${b.opponent_crowns}`;
                const won = b.winner_side === "team";
                return (
                  <tr
                    key={b.battle_id}
                    className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="py-1.5 pr-4 text-[var(--color-fg-dim)]">
                      {fmtDate(b.battle_time)}
                    </td>
                    <td className="py-1.5 pr-4">{b.battle_type}</td>
                    <td className="py-1.5 pr-4 text-[var(--color-fg-dim)]">
                      #{b.arena_id}
                    </td>
                    <td className="py-1.5 pr-4 text-center tabular-nums">{score}</td>
                    <td
                      className={`py-1.5 pr-4 text-right uppercase tracking-wider text-[10px] ${
                        won
                          ? "text-[var(--color-accent)]"
                          : "text-[var(--color-alert)]"
                      }`}
                    >
                      {won ? "win" : "loss"}
                    </td>
                    <td className="py-1.5 pr-4 text-right text-[var(--color-fg-muted)] text-xs">
                      <span className="font-mono">{b.battle_id.slice(0, 8)}…</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>

      <div>
        <Link href="/players" className="label-dim hover:text-[var(--color-accent)]">
          ← back to leaderboard
        </Link>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="label-dim">{label}</div>
      <div className="mt-1 text-[var(--text-lg)] tabular-nums">{value}</div>
    </div>
  );
}
