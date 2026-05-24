-- one row per (season, rank).
-- FKs: player_tag -> dim_players, clan_tag -> dim_clans.
select
    season_id,
    player_rank,
    player_tag,
    player_name,
    exp_level,
    elo_rating,
    clan_tag,
    extracted_date
from {{ ref('base_pol_rankings') }}
