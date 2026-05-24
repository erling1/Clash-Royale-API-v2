-- one row per (battle, side, slot).
-- FKs: battle_id -> fct_battles, player_tag -> dim_players (only top-100 players known),
--      clan_tag -> dim_clans.
-- derived: is_winner, total_tower_hp_remaining.
with crowns as (
    select
        battle_id,
        max(case when participant_side = 'team' then crowns end) as team_crowns,
        max(case when participant_side = 'opponent' then crowns end) as opponent_crowns
    from {{ ref('base_battle_participants') }}
    group by battle_id
)
select
    p.participant_id,
    p.battle_id,
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
left join crowns c on p.battle_id = c.battle_id
