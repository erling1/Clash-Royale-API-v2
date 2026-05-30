-- macros/clean.sql
{% macro clean(source, pks, order_col) %}

with base as (
    select
        *,
        row_number() over (
            partition by {{ pks | join(', ') }}
            order by {{ order_col }} desc
        ) as rn
    from {{ source }}
),

filter_to_newest as (
    select *
    from base
    where rn = 1
)

select * from filter_to_newest

{% endmacro %}
