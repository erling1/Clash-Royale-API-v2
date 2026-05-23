select *
from read_parquet(
    'data/raw/pol_rankings/**/*.parquet',
    hive_partitioning = true
)
