select *
from read_parquet(
    'data/raw/battle_deck_cards/**/*.parquet',
    hive_partitioning = true
)
