use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct SupportCard {
    pub card_id: i64,
    pub card_name: String,
    pub rarity: String,
    pub max_level: i64,
}

impl SupportCard {
    pub const COLUMNS: &'static str = "card_id, card_name, rarity, max_level";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            card_id: row.get(0)?,
            card_name: row.get(1)?,
            rarity: row.get(2)?,
            max_level: row.get(3)?,
        })
    }
}
