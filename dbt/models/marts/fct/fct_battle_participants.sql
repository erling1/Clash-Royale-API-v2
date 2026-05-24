-- one row per (battle, side, slot). grain: (queried_player_tag, battle_time, participant_side, slot).
-- FKs: (queried_player_tag, battle_time) -> fct_battles,
--      player_tag -> dim_players (only top-100 players known),
--      clan_tag -> dim_clans.
-- note: player_tag is the participant's own tag (can be opponent), distinct from queried_player_tag.
-- derived: is_winner, total_tower_hp_remaining.
with crowns as (
    select
        queried_player_tag,
        battle_time,
        max(case when participant_side = 'team' then crowns end) as team_crowns,
        max(case when participant_side = 'opponent' then crowns end) as opponent_crowns
    from {{ ref('base_battle_participants') }}
    group by queried_player_tag, battle_time
)
select
    p.queried_player_tag,
    p.battle_time,
    p.participant_side,
    p.slot,
    p.player_tag,
    p.player_name,
    p.starting_trophies,
    p.trophy_change,
    p.crowns,
    p.king_tower_hit_points,
    p.princess_tower_1_hp,
    p.princess_tower_2_hp,
    coalesce(p.king_tower_hit_points, 0)
        + coalesce(p.princess_tower_1_hp, 0)
        + coalesce(p.princess_tower_2_hp, 0) as total_tower_hp_remaining,
    p.clan_tag,
    p.global_rank,
    p.elixir_leaked,
    case
        when p.participant_side = 'team' and c.team_crowns > c.opponent_crowns then true
        when p.participant_side = 'opponent' and c.opponent_crowns > c.team_crowns then true
        when c.team_crowns = c.opponent_crowns then null
        else false
    end as is_winner,
    p.extracted_date
from {{ ref('base_battle_participants') }} p
left join crowns c
    on p.queried_player_tag = c.queried_player_tag
   and p.battle_time = c.battle_time
