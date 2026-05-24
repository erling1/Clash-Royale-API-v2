-- one row per deck_hash. headline deck-meta aggregates.
-- win_rate excludes draws from the denominator.
-- to scope to a specific battle context (e.g. PoL ranked 1v1), add a where-clause filter on
--   battle_type / game_mode_id in the stats CTE.
with stats as (
    select
        deck_hash,
        count(*) as appearance_count,
        sum(case when is_winner = true then 1 else 0 end) as win_count,
        sum(case when is_winner = false then 1 else 0 end) as loss_count,
        sum(case when is_winner is null then 1 else 0 end) as draw_count,
        avg(trophy_change) as avg_trophy_change,
        avg(crowns) as avg_crowns,
        min(battle_time) as first_seen_at,
        max(battle_time) as last_seen_at
    from {{ ref('deck_usages') }}
    group by deck_hash
)
select
    s.deck_hash,
    d.deck_label,
    d.card_ids,
    d.total_elixir_cost,
    d.avg_elixir_cost,
    s.appearance_count,
    s.win_count,
    s.loss_count,
    s.draw_count,
    case
        when (s.win_count + s.loss_count) > 0
        then s.win_count::double / (s.win_count + s.loss_count)
    end as win_rate,
    s.avg_trophy_change,
    s.avg_crowns,
    s.first_seen_at,
    s.last_seen_at,
    row_number() over (order by s.appearance_count desc) as popularity_rank
from stats s
left join {{ ref('dim_decks') }} d on d.deck_hash = s.deck_hash
