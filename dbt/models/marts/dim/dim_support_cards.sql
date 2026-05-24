select distinct
    card_id,
    card_name,
    rarity,
    max_level
from {{ ref('base_battle_support_cards') }}
