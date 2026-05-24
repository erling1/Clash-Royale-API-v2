use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Arena {
    pub arena_id: i64,
    pub arena_name: String,
}

impl Arena {
    pub const COLUMNS: &'static str = "arena_id, arena_name";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            arena_id: row.get(0)?,
            arena_name: row.get(1)?,
        })
    }
}
