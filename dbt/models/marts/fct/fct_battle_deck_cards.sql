-- one row per (participant, deck_slot).
-- grain: (queried_player_tag, battle_time, participant_side, slot, deck_slot).
-- FKs: (queried_player_tag, battle_time, participant_side, slot) -> fct_battle_participants,
--      (queried_player_tag, battle_time) -> fct_battles,
--      card_id -> dim_cards.
-- dropped redundant card metadata (name, rarity, elixir_cost, max_*) - now in dim_cards.
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
    extracted_date
from {{ ref('base_battle_deck_cards') }}
