-- one row per (participant, deck_slot).
-- FKs: participant_id -> fct_battle_participants, battle_id -> fct_battles, card_id -> dim_cards.
-- dropped redundant card metadata (name, rarity, elixir_cost, max_*) - now in dim_cards.
select
    participant_id,
    battle_id,
    deck_slot,
    card_id,
    card_level,
    star_level,
    evolution_level,
    extracted_date
from {{ ref('base_battle_deck_cards') }}
