select distinct
    game_mode_id,
    game_mode_name
from {{ ref('base_battles') }}
where game_mode_id is not null
