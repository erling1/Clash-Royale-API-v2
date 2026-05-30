use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Card {
    pub card_id: i64,
    pub card_name: String,
    pub rarity: String,
    pub elixir_cost: Option<f64>,
    pub max_level: i64,
    pub max_evolution_level: Option<f64>,
    pub card_variant: String,
    pub icon_url: Option<String>,
}

impl Card {
    pub const COLUMNS: &'static str =
        "card_id, card_name, rarity, elixir_cost, max_level, max_evolution_level, card_variant, icon_url";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            card_id: row.get(0)?,
            card_name: row.get(1)?,
            rarity: row.get(2)?,
            elixir_cost: row.get(3)?,
            max_level: row.get(4)?,
            max_evolution_level: row.get(5)?,
            card_variant: row.get(6)?,
            icon_url: row.get(7)?,
        })
    }
}
