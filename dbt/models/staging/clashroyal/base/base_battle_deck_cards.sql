select
    participant_id,
    battle_id,
    deck_slot,
    card_id,
    card_name,
    level as card_level,
    starLevel as star_level,
    evolutionLevel as evolution_level,
    maxLevel as max_level,
    maxEvolutionLevel as max_evolution_level,
    rarity,
    elixirCost as elixir_cost,
    cast(dt as date) as extracted_date
from read_parquet(
    'data/raw/battle_deck_cards/**/*.parquet',
    hive_partitioning = true
)
