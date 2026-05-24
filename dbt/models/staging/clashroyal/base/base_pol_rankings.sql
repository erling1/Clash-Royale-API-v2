select
    tag as player_tag,
    name as player_name,
    expLevel as exp_level,
    eloRating as elo_rating,
    rank as player_rank,
    "clan.tag" as clan_tag,
    "clan.name" as clan_name,
    "clan.badgeId" as clan_badge_id,
    seasonId as season_id,
    cast(dt as date) as extracted_date
from read_parquet(
    'data/raw/pol_rankings/**/*.parquet',
    hive_partitioning = true
)
