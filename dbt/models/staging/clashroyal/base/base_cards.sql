with source as (
    {{ clean(
        source    = "read_parquet('data/raw/cards/**/*.parquet', hive_partitioning = true)",
        pks       = ['id'],
        order_col = 'dt'
    ) }}
),

base as (
    select
        id as card_id,
        name as card_name,
        rarity,
        elixirCost as elixir_cost,
        maxLevel as max_level,
        maxEvolutionLevel as max_evolution_level,
        iconUrls_medium as icon_url_medium,
        iconUrls_heroMedium as icon_url_hero_medium,
        iconUrls_evolutionMedium as icon_url_evolution_medium,
        cast(dt as date) as extracted_date
    from source
)

select * from base
