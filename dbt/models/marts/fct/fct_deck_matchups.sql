-- one row per directional matchup (deck_hash vs opponent_deck_hash).
-- directional: deck_hash is the 'team' side, opponent_deck_hash is the 'opponent' side,
--   so (A vs B) and (B vs A) are distinct rows. win_rate is from deck_hash's perspective.
-- win_rate excludes draws from the denominator (matches fct_deck_meta / fct_card_pairs).
-- note: matchup grain is sparse (decks are 8-card combos) — most pairs have very few
--   battles, so filter on matchup_count before trusting a win_rate.
with matchups as (
    select
        t.deck_hash as deck_hash,
        o.deck_hash as opponent_deck_hash,
        t.is_winner
    from {{ ref('deck_usages') }} t
    join {{ ref('deck_usages') }} o
        on o.queried_player_tag = t.queried_player_tag
       and o.battle_time = t.battle_time
       and t.participant_side = 'team'
       and o.participant_side = 'opponent'
),
stats as (
    select
        deck_hash,
        opponent_deck_hash,
        count(*) as matchup_count,
        sum(case when is_winner = true then 1 else 0 end) as win_count,
        sum(case when is_winner = false then 1 else 0 end) as loss_count,
        sum(case when is_winner is null then 1 else 0 end) as draw_count
    from matchups
    group by deck_hash, opponent_deck_hash
)
select
    s.deck_hash,
    d.deck_label,
    s.opponent_deck_hash,
    o.deck_label as opponent_deck_label,
    s.matchup_count,
    s.win_count,
    s.loss_count,
    s.draw_count,
    case
        when (s.win_count + s.loss_count) > 0
        then s.win_count::double / (s.win_count + s.loss_count)
    end as win_rate
from stats s
left join {{ ref('dim_decks') }} d on d.deck_hash = s.deck_hash
left join {{ ref('dim_decks') }} o on o.deck_hash = s.opponent_deck_hash
