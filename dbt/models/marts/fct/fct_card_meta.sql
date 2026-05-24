-- one row per card_id. headline card-meta aggregates.
-- inclusion_rate: share of decks that contain this card (8 cards per deck → max 1.0).
-- usage_pct: share of all deck slots filled by this card (sums to 1.0 across all cards).
-- win_rate excludes draws from the denominator.
-- evolution_pct: of this card's appearances, what share were as the evolution variant.
with totals as (
    select
        count(*) as total_card_slots,
        count(distinct (queried_player_tag, battle_time, participant_side, slot)) as total_decks
    from {{ ref('card_usages') }}
),
stats as (
    select
        card_id,
        count(*) as appearance_count,
        sum(case when is_winner = true then 1 else 0 end) as win_count,
        sum(case when is_winner = false then 1 else 0 end) as loss_count,
        sum(case when is_winner is null then 1 else 0 end) as draw_count,
        sum(case when coalesce(evolution_level, 0) > 0 then 1 else 0 end) as evolution_count,
        avg(card_level) as avg_card_level
    from {{ ref('card_usages') }}
    group by card_id
)
select
    s.card_id,
    c.card_name,
    c.rarity,
    c.elixir_cost,
    s.appearance_count,
    s.appearance_count::double / nullif(t.total_decks, 0) as inclusion_rate,
    s.appearance_count::double / nullif(t.total_card_slots, 0) as usage_pct,
    s.win_count,
    s.loss_count,
    s.draw_count,
    case
        when (s.win_count + s.loss_count) > 0
        then s.win_count::double / (s.win_count + s.loss_count)
    end as win_rate,
    s.evolution_count,
    s.evolution_count::double / nullif(s.appearance_count, 0) as evolution_pct,
    s.avg_card_level,
    row_number() over (order by s.appearance_count desc) as popularity_rank
from stats s
cross join totals t
left join {{ ref('dim_cards') }} c on c.card_id = s.card_id
