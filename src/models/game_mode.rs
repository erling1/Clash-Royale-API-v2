use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct GameMode {
    pub game_mode_id: i64,
    pub game_mode_name: String,
}

impl GameMode {
    pub const COLUMNS: &'static str = "game_mode_id, game_mode_name";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            game_mode_id: row.get(0)?,
            game_mode_name: row.get(1)?,
        })
    }
}
