select *
from read_parquet(
    'data/raw/players/**/*.parquet',
    hive_partitioning = true
)
