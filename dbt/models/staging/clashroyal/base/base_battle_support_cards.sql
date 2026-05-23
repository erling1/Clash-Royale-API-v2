select *
from read_parquet(
    'data/raw/battle_support_cards/**/*.parquet',
    hive_partitioning = true
)
