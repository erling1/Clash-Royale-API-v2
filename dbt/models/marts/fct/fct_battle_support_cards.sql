-- one row per (participant, support_slot).
-- FKs: participant_id -> fct_battle_participants, battle_id -> fct_battles, card_id -> dim_support_cards.
select
    participant_id,
    battle_id,
    support_slot,
    card_id,
    card_level,
    extracted_date
from {{ ref('base_battle_support_cards') }}
