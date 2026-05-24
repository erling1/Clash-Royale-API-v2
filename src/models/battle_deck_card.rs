use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct BattleDeckCard {
    pub participant_id: String,
    pub battle_id: String,
    pub deck_slot: i64,
    pub card_id: i64,
    pub card_level: i64,
    pub star_level: Option<f64>,
    pub evolution_level: Option<f64>,
    pub extracted_date: String,
}

impl BattleDeckCard {
    pub const COLUMNS: &'static str = "participant_id, battle_id, deck_slot, card_id, card_level, star_level, evolution_level, CAST(extracted_date AS VARCHAR) AS extracted_date";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            participant_id: row.get(0)?,
            battle_id: row.get(1)?,
            deck_slot: row.get(2)?,
            card_id: row.get(3)?,
            card_level: row.get(4)?,
            star_level: row.get(5)?,
            evolution_level: row.get(6)?,
            extracted_date: row.get(7)?,
        })
    }
}
