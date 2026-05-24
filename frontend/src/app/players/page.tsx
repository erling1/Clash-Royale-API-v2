import Link from "next/link";
import { listRankings } from "@/lib/api";
import { Panel } from "@/components/panel";
import { fmtInt, displayTag } from "@/lib/format";

export default async function PlayersPage() {
  const rankings = await listRankings(100);

  return (
    <div className="space-y-6">
      <Panel title="Path of Legends — Leaderboard" folio="§ I." keybind="P">
        <p className="label-dim mb-2">
          source: <span className="text-[var(--color-fg)]">GET /api/v1/rankings?limit=100</span>
        </p>
        {rankings.length === 0 && (
          <div className="py-8 text-center text-[var(--color-fg-muted)] label-dim">
            No rankings returned — is the Rust API running on :3000? Is the
            DuckDB warehouse populated?
          </div>
        )}
      </Panel>

      {rankings.length > 0 && (
        <Panel title={`${fmtInt(rankings.length)} ranked players`} folio="§ II." noPadding>
          <table className="w-full text-sm">
            <thead className="text-left label-dim border-b border-[var(--color-rule)]">
              <tr>
                <th className="py-2 px-4 font-normal w-[56px]">#</th>
                <th className="py-2 pr-4 font-normal">player</th>
                <th className="py-2 pr-4 font-normal text-[var(--color-fg-muted)]">
                  tag
                </th>
                <th className="py-2 pr-4 font-normal text-right">elo</th>
                <th className="py-2 pr-4 font-normal text-right">lvl</th>
                <th className="py-2 px-4 font-normal text-[var(--color-fg-muted)]">
                  clan
                </th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((r) => (
                <tr
                  key={r.player_tag}
                  className="border-b border-[var(--color-rule)] hover:bg-[var(--color-bg-hover)]"
                >
                  <td className="py-2 px-4 text-[var(--color-fg-dim)] tabular-nums">
                    {r.player_rank.toString().padStart(3, "0")}
                  </td>
                  <td className="py-2 pr-4">
                    <Link
                      href={`/players/${encodeURIComponent(r.player_tag)}`}
                      className="hover:text-[var(--color-accent)]"
                    >
                      {r.player_name}
                    </Link>
                  </td>
                  <td className="py-2 pr-4 text-[var(--color-fg-muted)] text-xs">
                    {displayTag(r.player_tag)}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums">
                    {fmtInt(r.elo_rating)}
                  </td>
                  <td className="py-2 pr-4 text-right tabular-nums text-[var(--color-fg-dim)]">
                    {r.exp_level}
                  </td>
                  <td className="py-2 px-4 text-[var(--color-fg-muted)] text-xs">
                    {r.clan_tag ? displayTag(r.clan_tag) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}
