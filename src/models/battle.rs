use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Battle {
    pub queried_player_tag: String,
    pub battle_time: String,
    pub battle_type: String,
    pub is_ladder_tournament: bool,
    pub is_hosted_match: bool,
    pub league_number: Option<i64>,
    pub deck_selection: String,
    pub arena_id: i64,
    pub game_mode_id: i64,
    pub team_crowns: i64,
    pub opponent_crowns: i64,
    pub winner_side: String,
    pub extracted_date: String,
}

impl Battle {
    pub const COLUMNS: &'static str = "queried_player_tag, strftime(battle_time, '%Y-%m-%dT%H:%M:%S') AS battle_time, battle_type, is_ladder_tournament, is_hosted_match, league_number, deck_selection, arena_id, game_mode_id, team_crowns, opponent_crowns, winner_side, CAST(extracted_date AS VARCHAR) AS extracted_date";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            queried_player_tag: row.get(0)?,
            battle_time: row.get(1)?,
            battle_type: row.get(2)?,
            is_ladder_tournament: row.get(3)?,
            is_hosted_match: row.get(4)?,
            league_number: row.get(5)?,
            deck_selection: row.get(6)?,
            arena_id: row.get(7)?,
            game_mode_id: row.get(8)?,
            team_crowns: row.get(9)?,
            opponent_crowns: row.get(10)?,
            winner_side: row.get(11)?,
            extracted_date: row.get(12)?,
        })
    }
}
