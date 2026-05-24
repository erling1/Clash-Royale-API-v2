-- one row per distinct card_id seen in deck-card observations.
-- max_evolution_level is null for non-evolvable cards; pick the most informative row.
with ranked as (
    select
        card_id,
        card_name,
        rarity,
        elixir_cost,
        max_level,
        max_evolution_level,
        row_number() over (
            partition by card_id
            order by max_evolution_level desc nulls last,
                     max_level desc nulls last
        ) as rn
    from {{ ref('base_battle_deck_cards') }}
)
select
    card_id,
    card_name,
    rarity,
    elixir_cost,
    max_level,
    max_evolution_level
from ranked
where rn = 1
