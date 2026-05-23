select *
from read_parquet(
    'data/raw/battle_participants/**/*.parquet',
    hive_partitioning = true
)
