use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Card {
    pub card_id: i64,
    pub card_name: String,
    pub rarity: String,
    pub elixir_cost: Option<f64>,
    pub max_level: i64,
    pub max_evolution_level: Option<f64>,
    pub icon_url: Option<String>,            // base variant
    pub icon_url_evolution: Option<String>,  // NULL when no evolution exists
    pub icon_url_hero: Option<String>,       // NULL when no hero variant exists
}

impl Card {
    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            card_id: row.get(0)?,
            card_name: row.get(1)?,
            rarity: row.get(2)?,
            elixir_cost: row.get(3)?,
            max_level: row.get(4)?,
            max_evolution_level: row.get(5)?,
            icon_url: row.get(6)?,
            icon_url_evolution: row.get(7)?,
            icon_url_hero: row.get(8)?,
        })
    }
}
