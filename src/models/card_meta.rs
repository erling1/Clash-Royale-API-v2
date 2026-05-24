use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CardMeta {
    pub card_id: i64,
    pub card_name: Option<String>,
    pub rarity: Option<String>,
    pub elixir_cost: Option<f64>,
    pub appearance_count: i64,
    pub inclusion_rate: Option<f64>,
    pub usage_pct: Option<f64>,
    pub win_count: i64,
    pub loss_count: i64,
    pub draw_count: i64,
    pub win_rate: Option<f64>,
    pub evolution_count: i64,
    pub evolution_pct: Option<f64>,
    pub avg_card_level: Option<f64>,
    pub popularity_rank: i64,
}

impl CardMeta {
    pub const COLUMNS: &'static str = "card_id, card_name, rarity, elixir_cost, appearance_count, inclusion_rate, usage_pct, win_count, loss_count, draw_count, win_rate, evolution_count, evolution_pct, avg_card_level, popularity_rank";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            card_id: row.get(0)?,
            card_name: row.get(1)?,
            rarity: row.get(2)?,
            elixir_cost: row.get(3)?,
            appearance_count: row.get(4)?,
            inclusion_rate: row.get(5)?,
            usage_pct: row.get(6)?,
            win_count: row.get(7)?,
            loss_count: row.get(8)?,
            draw_count: row.get(9)?,
            win_rate: row.get(10)?,
            evolution_count: row.get(11)?,
            evolution_pct: row.get(12)?,
            avg_card_level: row.get(13)?,
            popularity_rank: row.get(14)?,
        })
    }
}
