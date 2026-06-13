with source as (
    {{ clean(
        source    = "read_parquet('s3://clashroyale-data-erling/data/raw/battle_support_cards/**/*.parquet', hive_partitioning = true)",
        pks       = ['queried_player_tag', 'battleTime', 'side', 'slot', 'support_slot'],
        order_col = 'dt'
    ) }}
),

base as (
    select
        queried_player_tag,
        try_strptime(battleTime, '%Y%m%dT%H%M%S.%gZ') as battle_time,
        side as participant_side,
        slot,
        support_slot,
        card_id,
        card_name,
        level as card_level,
        maxLevel as max_level,
        rarity,
        cast(dt as date) as extracted_date
    from source
)

select * from base
