select
    participant_id,
    battle_id,
    support_slot,
    card_id,
    card_name,
    level as card_level,
    maxLevel as max_level,
    rarity,
    cast(dt as date) as extracted_date
from read_parquet(
    'data/raw/battle_support_cards/**/*.parquet',
    hive_partitioning = true
)
