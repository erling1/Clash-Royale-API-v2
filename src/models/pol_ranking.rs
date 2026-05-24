use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct PolRanking {
    pub season_id: String,
    pub player_rank: i64,
    pub player_tag: String,
    pub player_name: String,
    pub exp_level: i64,
    pub elo_rating: i64,
    pub clan_tag: Option<String>,
    pub extracted_date: String,
}

impl PolRanking {
    pub const COLUMNS: &'static str = "season_id, player_rank, player_tag, player_name, exp_level, elo_rating, clan_tag, CAST(extracted_date AS VARCHAR) AS extracted_date";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            season_id: row.get(0)?,
            player_rank: row.get(1)?,
            player_tag: row.get(2)?,
            player_name: row.get(3)?,
            exp_level: row.get(4)?,
            elo_rating: row.get(5)?,
            clan_tag: row.get(6)?,
            extracted_date: row.get(7)?,
        })
    }
}
