use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct BattleSupportCard {
    pub participant_id: String,
    pub battle_id: String,
    pub support_slot: i64,
    pub card_id: i64,
    pub card_level: i64,
    pub extracted_date: String,
}

impl BattleSupportCard {
    pub const COLUMNS: &'static str = "participant_id, battle_id, support_slot, card_id, card_level, CAST(extracted_date AS VARCHAR) AS extracted_date";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            participant_id: row.get(0)?,
            battle_id: row.get(1)?,
            support_slot: row.get(2)?,
            card_id: row.get(3)?,
            card_level: row.get(4)?,
            extracted_date: row.get(5)?,
        })
    }
}
