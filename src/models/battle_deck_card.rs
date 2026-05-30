use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct BattleDeckCard {
    pub queried_player_tag: String,
    pub battle_time: String,
    pub participant_side: String,
    pub slot: i64,
    pub deck_slot: i64,
    pub card_id: i64,
    pub card_level: i64,
    pub star_level: Option<f64>,
    pub evolution_level: Option<f64>,
    pub card_variant: String,
    pub extracted_date: String,
}

impl BattleDeckCard {
    pub const COLUMNS: &'static str = "queried_player_tag, strftime(battle_time, '%Y-%m-%dT%H:%M:%S') AS battle_time, participant_side, slot, deck_slot, card_id, card_level, star_level, evolution_level, card_variant, CAST(extracted_date AS VARCHAR) AS extracted_date";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            queried_player_tag: row.get(0)?,
            battle_time: row.get(1)?,
            participant_side: row.get(2)?,
            slot: row.get(3)?,
            deck_slot: row.get(4)?,
            card_id: row.get(5)?,
            card_level: row.get(6)?,
            star_level: row.get(7)?,
            evolution_level: row.get(8)?,
            card_variant: row.get(9)?,
            extracted_date: row.get(10)?,
        })
    }
}
