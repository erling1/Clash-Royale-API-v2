select *
from read_parquet(
    'data/raw/battles/**/*.parquet',
    hive_partitioning = true
)
