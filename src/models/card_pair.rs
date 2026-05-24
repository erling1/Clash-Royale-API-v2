use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct CardPair {
    pub card_id_a: i64,
    pub card_name_a: Option<String>,
    pub card_id_b: i64,
    pub card_name_b: Option<String>,
    pub co_occurrence_count: i64,
    pub win_count: i64,
    pub loss_count: i64,
    pub draw_count: i64,
    pub joint_win_rate: Option<f64>,
    pub popularity_rank: i64,
}

impl CardPair {
    pub const COLUMNS: &'static str = "card_id_a, card_name_a, card_id_b, card_name_b, co_occurrence_count, win_count, loss_count, draw_count, joint_win_rate, popularity_rank";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            card_id_a: row.get(0)?,
            card_name_a: row.get(1)?,
            card_id_b: row.get(2)?,
            card_name_b: row.get(3)?,
            co_occurrence_count: row.get(4)?,
            win_count: row.get(5)?,
            loss_count: row.get(6)?,
            draw_count: row.get(7)?,
            joint_win_rate: row.get(8)?,
            popularity_rank: row.get(9)?,
        })
    }
}
