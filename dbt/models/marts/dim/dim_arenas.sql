select distinct
    arena_id,
    arena_name
from {{ ref('base_battles') }}
where arena_id is not null
