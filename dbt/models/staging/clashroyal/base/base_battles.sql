with source as (
    {{ clean(
        source    = "read_parquet('s3://clashroyale-data-erling/data/raw/battles/**/*.parquet', hive_partitioning = true)",
        pks       = ['queried_player_tag', 'battleTime'],
        order_col = 'dt'
    ) }}
),

base as (
    select
        queried_player_tag,
        type as battle_type,
        try_strptime(battleTime, '%Y%m%dT%H%M%S.%gZ') as battle_time,
        battleTime as battle_time_raw,
        isLadderTournament as is_ladder_tournament,
        isHostedMatch as is_hosted_match,
        leagueNumber as league_number,
        deckSelection as deck_selection,
        arena_id,
        arena_name,
        gameMode_id as game_mode_id,
        gameMode_name as game_mode_name,
        cast(dt as date) as extracted_date
    from source
)

select * from base
