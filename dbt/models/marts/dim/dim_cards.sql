-- one row per unique card image URL.
-- grain: (card_id, card_variant) where card_variant ∈ {'base', 'hero', 'evolution'}.
-- a card always has a 'base' row; 'hero' and 'evolution' rows appear only when
-- the official /cards API provides those iconUrls.
--
-- joins:
--   - aggregate fact tables (fct_card_meta, fct_card_pairs) join on
--       card_id AND card_variant = 'base'   -- canonical image
--   - fct_battle_deck_cards exposes a derived card_variant column and joins on
--       (card_id, card_variant)             -- evolution image when applicable
with latest as (
    select
        card_id,
        card_name,
        rarity,
        elixir_cost,
        max_level,
        max_evolution_level,
        icon_url_medium,
        icon_url_hero_medium,
        icon_url_evolution_medium,
        row_number() over (
            partition by card_id
            order by extracted_date desc
        ) as rn
    from {{ ref('base_cards') }}
),
canonical as (
    select * from latest where rn = 1
),
variants as (
    select
        card_id,
        'base' as card_variant,
        icon_url_medium as icon_url
    from canonical
    where icon_url_medium is not null

    union all

    select
        card_id,
        'hero' as card_variant,
        icon_url_hero_medium as icon_url
    from canonical
    where icon_url_hero_medium is not null

    union all

    select
        card_id,
        'evolution' as card_variant,
        icon_url_evolution_medium as icon_url
    from canonical
    where icon_url_evolution_medium is not null
)
select
    v.card_id,
    c.card_name,
    c.rarity,
    c.elixir_cost,
    c.max_level,
    c.max_evolution_level,
    v.card_variant,
    v.icon_url
from variants v
join canonical c using (card_id)
