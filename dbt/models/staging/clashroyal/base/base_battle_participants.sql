with source as (
    {{ clean(
        source    = "read_parquet('s3://clashroyale-data-erling/data/raw/battle_participants/**/*.parquet', hive_partitioning = true)",
        pks       = ['queried_player_tag', 'battleTime', 'side', 'slot'],
        order_col = 'dt'
    ) }}
),

base as (
    select
        queried_player_tag,
        try_strptime(battleTime, '%Y%m%dT%H%M%S.%gZ') as battle_time,
        side as participant_side,
        slot,
        player_tag,
        player_name,
        startingTrophies as starting_trophies,
        trophyChange as trophy_change,
        crowns,
        kingTowerHitPoints as king_tower_hit_points,
        princessTower1HP as princess_tower_1_hp,
        princessTower2HP as princess_tower_2_hp,
        clan_tag,
        clan_name,
        clan_badgeId as clan_badge_id,
        globalRank as global_rank,
        elixirLeaked as elixir_leaked,
        cast(dt as date) as extracted_date
    from source
)

select * from base
