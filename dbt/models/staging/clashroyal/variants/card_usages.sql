-- one row per (physical participant, deck_slot). card-level usage with is_winner.
-- inherits the cross-queried-player dedupe from deck_usages.
select
    u.queried_player_tag,
    u.battle_time,
    u.participant_side,
    u.slot,
    u.player_tag,
    dc.deck_slot,
    dc.card_id,
    dc.card_level,
    dc.star_level,
    dc.evolution_level,
    u.is_winner,
    u.trophy_change,
    u.battle_type,
    u.game_mode_id,
    u.extracted_date
from {{ ref('deck_usages') }} u
join {{ ref('base_battle_deck_cards') }} dc
    on dc.queried_player_tag = u.queried_player_tag
   and dc.battle_time = u.battle_time
   and dc.participant_side = u.participant_side
   and dc.slot = u.slot
