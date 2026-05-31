-- macros/clean.sql
--
-- Universal deduplication: keep the newest row per natural key.
--
--   source    : a relation expression to read from (e.g. a read_parquet(...) call
--               or {{ source(...) }}). Used verbatim in the FROM clause.
--   pks       : list of column names that form the natural key (raw column names,
--               since this runs before any renaming).
--   order_col : column/expression used to pick the survivor; newest wins (DESC).
--
-- Usage (dedup the raw source first, then rename in a downstream CTE):
--
--   with source as (
--       {{ clean(
--           source    = "read_parquet('data/raw/players/**/*.parquet', hive_partitioning = true)",
--           pks       = ['tag'],
--           order_col = 'dt'
--       ) }}
--   ),
--   base as ( select tag as player_tag, /* ... */ from source )
--   select * from base
--
-- Internal CTEs are prefixed with _clean_ so they never collide with the
-- caller's own CTE names. The rn helper column is dropped via EXCLUDE.
{% macro clean(source, pks, order_col) %}

with _clean_base as (
    select
        *,
        row_number() over (
            partition by {{ pks | join(', ') }}
            order by {{ order_col }} desc
        ) as rn
    from {{ source }}
),

_clean_newest as (
    select * exclude (rn)
    from _clean_base
    where rn = 1
)

select * from _clean_newest

{% endmacro %}
