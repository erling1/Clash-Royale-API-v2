-- one row per (participant, support_slot).
-- grain: (queried_player_tag, battle_time, participant_side, slot, support_slot).
-- FKs: (queried_player_tag, battle_time, participant_side, slot) -> fct_battle_participants,
--      (queried_player_tag, battle_time) -> fct_battles,
--      card_id -> dim_support_cards.
select
    queried_player_tag,
    battle_time,
    participant_side,
    slot,
    support_slot,
    card_id,
    card_level,
    extracted_date
from {{ ref('base_battle_support_cards') }}
