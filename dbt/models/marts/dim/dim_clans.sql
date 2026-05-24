-- union clans seen across participants, players, and pol rankings.
-- collapse on clan_tag, keeping the most recent non-null name/badge.
with raw_clans as (
    select clan_tag, clan_name, clan_badge_id, extracted_date
    from {{ ref('base_battle_participants') }}
    where clan_tag is not null

    union all

    select clan_tag, clan_name, clan_badge_id, extracted_date
    from {{ ref('base_players') }}
    where clan_tag is not null

    union all

    select clan_tag, clan_name, clan_badge_id, extracted_date
    from {{ ref('base_pol_rankings') }}
    where clan_tag is not null
),
ranked as (
    select
        clan_tag,
        clan_name,
        clan_badge_id,
        row_number() over (
            partition by clan_tag
            order by extracted_date desc,
                     clan_name is null,
                     clan_badge_id is null
        ) as rn
    from raw_clans
)
select
    clan_tag,
    clan_name,
    clan_badge_id
from ranked
where rn = 1
