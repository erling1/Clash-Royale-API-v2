use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct DeckMatchup {
    pub deck_hash: String,
    pub deck_label: Option<String>,
    pub opponent_deck_hash: String,
    pub opponent_deck_label: Option<String>,
    pub matchup_count: i64,
    pub win_count: i64,
    pub loss_count: i64,
    pub draw_count: i64,
    pub win_rate: Option<f64>,
}

impl DeckMatchup {
    pub const COLUMNS: &'static str = "deck_hash, deck_label, opponent_deck_hash, opponent_deck_label, matchup_count, win_count, loss_count, draw_count, win_rate";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            deck_hash: row.get(0)?,
            deck_label: row.get(1)?,
            opponent_deck_hash: row.get(2)?,
            opponent_deck_label: row.get(3)?,
            matchup_count: row.get(4)?,
            win_count: row.get(5)?,
            loss_count: row.get(6)?,
            draw_count: row.get(7)?,
            win_rate: row.get(8)?,
        })
    }
}
