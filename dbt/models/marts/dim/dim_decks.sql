-- one row per unique deck (set of 8 card_ids).
-- card_ids is the sorted list; deck_label is a comma-joined card-name string for display.
-- card_count should always be 8 for a valid deck (sanity check).
with deck_ids as (
    select
        deck_hash,
        any_value(deck_card_ids) as deck_card_ids
    from {{ ref('deck_usages') }}
    group by deck_hash
),
expanded as (
    select
        deck_hash,
        deck_card_ids,
        unnest(deck_card_ids) as card_id
    from deck_ids
),
with_card_info as (
    select
        e.deck_hash,
        e.deck_card_ids,
        e.card_id,
        c.card_name,
        c.elixir_cost,
        c.rarity
    from expanded e
    left join {{ ref('dim_cards') }} c on c.card_id = e.card_id and c.card_variant = 'base'
)
select
    deck_hash,
    any_value(deck_card_ids) as card_ids,
    string_agg(card_name, ', ' order by card_name) as deck_label,
    sum(elixir_cost) as total_elixir_cost,
    avg(elixir_cost) as avg_elixir_cost,
    count(*) as card_count
from with_card_info
group by deck_hash
