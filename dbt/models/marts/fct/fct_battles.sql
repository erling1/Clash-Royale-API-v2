-- one row per battle.
-- FKs: queried_player_tag -> dim_players, arena_id -> dim_arenas, game_mode_id -> dim_game_modes.
-- derived: team_crowns, opponent_crowns, winner_side.
with crowns as (
    select
        battle_id,
        max(case when participant_side = 'team' then crowns end) as team_crowns,
        max(case when participant_side = 'opponent' then crowns end) as opponent_crowns
    from {{ ref('base_battle_participants') }}
    group by battle_id
)
select
    b.battle_id,
    b.queried_player_tag,
    b.battle_type,
    b.battle_time,
    b.is_ladder_tournament,
    b.is_hosted_match,
    b.league_number,
    b.deck_selection,
    b.arena_id,
    b.game_mode_id,
    c.team_crowns,
    c.opponent_crowns,
    case
        when c.team_crowns > c.opponent_crowns then 'team'
        when c.opponent_crowns > c.team_crowns then 'opponent'
        when c.team_crowns is not null and c.team_crowns = c.opponent_crowns then 'draw'
    end as winner_side,
    b.extracted_date
from {{ ref('base_battles') }} b
left join crowns c on b.battle_id = c.battle_id
