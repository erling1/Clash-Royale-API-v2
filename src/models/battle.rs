use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Battle {
    pub battle_id: String,
    pub queried_player_tag: String,
    pub battle_type: String,
    pub battle_time: String,
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
    pub const COLUMNS: &'static str = "battle_id, queried_player_tag, battle_type, CAST(battle_time AS VARCHAR) AS battle_time, is_ladder_tournament, is_hosted_match, league_number, deck_selection, arena_id, game_mode_id, team_crowns, opponent_crowns, winner_side, CAST(extracted_date AS VARCHAR) AS extracted_date";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            battle_id: row.get(0)?,
            queried_player_tag: row.get(1)?,
            battle_type: row.get(2)?,
            battle_time: row.get(3)?,
            is_ladder_tournament: row.get(4)?,
            is_hosted_match: row.get(5)?,
            league_number: row.get(6)?,
            deck_selection: row.get(7)?,
            arena_id: row.get(8)?,
            game_mode_id: row.get(9)?,
            team_crowns: row.get(10)?,
            opponent_crowns: row.get(11)?,
            winner_side: row.get(12)?,
            extracted_date: row.get(13)?,
        })
    }
}
