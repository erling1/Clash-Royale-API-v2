-- one row per (physical participant, battle). foundation for deck/card meta analytics.
-- deck identity = md5 hash of sorted card_ids; deck-slot order is not part of identity.
-- dedupes cross-queried-player duplicates: when two top-100 players battle each other,
--   the same physical battle appears in both their battlelogs. keep one canonical row
--   per (player_tag, battle_time).
-- evolutions and star levels are deck-instance attributes, not deck identity.
with deck_card_lists as (
    select
        queried_player_tag,
        battle_time,
        participant_side,
        slot,
        list_sort(array_agg(card_id)) as deck_card_ids,
        md5(string_agg(card_id::varchar, '|' order by card_id)) as deck_hash,
        sum(case when coalesce(evolution_level, 0) > 0 then 1 else 0 end) as evolutions_used,
        avg(card_level) as avg_card_level
    from {{ ref('base_battle_deck_cards') }}
    group by queried_player_tag, battle_time, participant_side, slot
),
crowns as (
    select
        queried_player_tag,
        battle_time,
        max(case when participant_side = 'team' then crowns end) as team_crowns,
        max(case when participant_side = 'opponent' then crowns end) as opponent_crowns
    from {{ ref('base_battle_participants') }}
    group by queried_player_tag, battle_time
),
participant_usages as (
    select
        p.queried_player_tag,
        p.battle_time,
        p.participant_side,
        p.slot,
        p.player_tag,
        p.crowns,
        p.trophy_change,
        case
            when p.participant_side = 'team' and c.team_crowns > c.opponent_crowns then true
            when p.participant_side = 'opponent' and c.opponent_crowns > c.team_crowns then true
            when c.team_crowns = c.opponent_crowns then null
            else false
        end as is_winner,
        b.battle_type,
        b.game_mode_id,
        b.arena_id,
        b.league_number,
        b.extracted_date,
        d.deck_hash,
        d.deck_card_ids,
        d.evolutions_used,
        d.avg_card_level
    from {{ ref('base_battle_participants') }} p
    join {{ ref('base_battles') }} b
        on b.queried_player_tag = p.queried_player_tag
       and b.battle_time = p.battle_time
    join deck_card_lists d
        on d.queried_player_tag = p.queried_player_tag
       and d.battle_time = p.battle_time
       and d.participant_side = p.participant_side
       and d.slot = p.slot
    left join crowns c
        on c.queried_player_tag = p.queried_player_tag
       and c.battle_time = p.battle_time
),
deduped as (
    select
        *,
        row_number() over (
            partition by player_tag, battle_time
            order by queried_player_tag
        ) as rn
    from participant_usages
    where player_tag is not null
)
select
    queried_player_tag,
    battle_time,
    participant_side,
    slot,
    player_tag,
    deck_hash,
    deck_card_ids,
    crowns,
    trophy_change,
    is_winner,
    evolutions_used,
    avg_card_level,
    battle_type,
    game_mode_id,
    arena_id,
    league_number,
    extracted_date
from deduped
where rn = 1
