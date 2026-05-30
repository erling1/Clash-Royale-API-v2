-- one row per (participant, deck_slot).
-- grain: (queried_player_tag, battle_time, participant_side, slot, deck_slot).
-- FKs: (queried_player_tag, battle_time, participant_side, slot) -> fct_battle_participants,
--      (queried_player_tag, battle_time) -> fct_battles,
--      (card_id, card_variant) -> dim_cards.
-- card_variant is derived so joins to dim_cards stay 1:1; when no evolution
-- image exists for a card, a LEFT JOIN keeps the fact row.
select
    queried_player_tag,
    battle_time,
    participant_side,
    slot,
    deck_slot,
    card_id,
    card_level,
    star_level,
    evolution_level,
    case
        when evolution_level >= 1 then 'evolution'
        else 'base'
    end as card_variant,
    extracted_date
from {{ ref('base_battle_deck_cards') }}
