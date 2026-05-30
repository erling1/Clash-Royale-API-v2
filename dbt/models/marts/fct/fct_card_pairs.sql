-- one row per unordered pair (card_id_a, card_id_b) where card_id_a < card_id_b.
-- co_occurrence_count: number of decks containing both cards.
-- joint_win_rate: of those decks, what share won (draws excluded).
-- 8 cards per deck → 28 pairs per deck, so this stays small.
with pairs as (
    select
        a.card_id as card_id_a,
        b.card_id as card_id_b,
        a.is_winner
    from {{ ref('card_usages') }} a
    join {{ ref('card_usages') }} b
        on b.queried_player_tag = a.queried_player_tag
       and b.battle_time = a.battle_time
       and b.participant_side = a.participant_side
       and b.slot = a.slot
       and b.card_id > a.card_id
),
stats as (
    select
        card_id_a,
        card_id_b,
        count(*) as co_occurrence_count,
        sum(case when is_winner = true then 1 else 0 end) as win_count,
        sum(case when is_winner = false then 1 else 0 end) as loss_count,
        sum(case when is_winner is null then 1 else 0 end) as draw_count
    from pairs
    group by card_id_a, card_id_b
)
select
    s.card_id_a,
    ca.card_name as card_name_a,
    s.card_id_b,
    cb.card_name as card_name_b,
    s.co_occurrence_count,
    s.win_count,
    s.loss_count,
    s.draw_count,
    case
        when (s.win_count + s.loss_count) > 0
        then s.win_count::double / (s.win_count + s.loss_count)
    end as joint_win_rate,
    row_number() over (order by s.co_occurrence_count desc) as popularity_rank
from stats s
left join {{ ref('dim_cards') }} ca on ca.card_id = s.card_id_a and ca.card_variant = 'base'
left join {{ ref('dim_cards') }} cb on cb.card_id = s.card_id_b and cb.card_variant = 'base'
