use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct DeckMeta {
    pub deck_hash: String,
    pub deck_label: Option<String>,
    pub card_ids: Vec<i64>,
    pub total_elixir_cost: Option<f64>,
    pub avg_elixir_cost: Option<f64>,
    pub appearance_count: i64,
    pub win_count: i64,
    pub loss_count: i64,
    pub draw_count: i64,
    pub win_rate: Option<f64>,
    pub avg_trophy_change: Option<f64>,
    pub avg_crowns: Option<f64>,
    pub first_seen_at: String,
    pub last_seen_at: String,
    pub popularity_rank: i64,
}

impl DeckMeta {
    // card_ids (BIGINT[]) is read positionally last: the duckdb crate has no
    // FromSql for Vec<i64>, so it must be pulled out as a Value::List and mapped.
    pub const COLUMNS: &'static str = "deck_hash, deck_label, total_elixir_cost, avg_elixir_cost, appearance_count, win_count, loss_count, draw_count, win_rate, avg_trophy_change, avg_crowns, strftime(first_seen_at, '%Y-%m-%dT%H:%M:%S') AS first_seen_at, strftime(last_seen_at, '%Y-%m-%dT%H:%M:%S') AS last_seen_at, popularity_rank, card_ids";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        let card_ids = match row.get::<_, duckdb::types::Value>(14)? {
            duckdb::types::Value::List(items) => items
                .into_iter()
                .filter_map(|v| match v {
                    duckdb::types::Value::BigInt(i) => Some(i),
                    _ => None,
                })
                .collect(),
            _ => Vec::new(),
        };

        Ok(Self {
            deck_hash: row.get(0)?,
            deck_label: row.get(1)?,
            total_elixir_cost: row.get(2)?,
            avg_elixir_cost: row.get(3)?,
            appearance_count: row.get(4)?,
            win_count: row.get(5)?,
            loss_count: row.get(6)?,
            draw_count: row.get(7)?,
            win_rate: row.get(8)?,
            avg_trophy_change: row.get(9)?,
            avg_crowns: row.get(10)?,
            first_seen_at: row.get(11)?,
            last_seen_at: row.get(12)?,
            popularity_rank: row.get(13)?,
            card_ids,
        })
    }
}
