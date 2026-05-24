-- slim consumer-facing player dimension.
-- FK columns: clan_tag -> dim_clans, arena_id -> dim_arenas.
-- assumption: one row per player_tag (the daily snapshot from extract).
-- when extract runs more than once, latest row per (player_tag, extracted_date) wins.
with latest as (
    select
        *,
        row_number() over (
            partition by player_tag
            order by extracted_date desc
        ) as rn
    from {{ ref('base_players') }}
)
select
    player_tag,
    player_name,
    exp_level,
    trophies,
    best_trophies,
    wins,
    losses,
    battle_count,
    three_crown_wins,
    donations,
    donations_received,
    total_donations,
    clan_cards_collected,
    star_points,
    exp_points,
    total_exp_points,
    war_day_wins,
    challenge_cards_won,
    challenge_max_wins,
    tournament_cards_won,
    tournament_battle_count,
    current_win_lose_streak,
    legacy_trophy_road_high_score,
    clan_role,
    clan_tag,
    arena_id,
    case
        when (wins + losses) > 0
        then wins::double / (wins + losses)
    end as win_rate,
    extracted_date
from latest
where rn = 1
