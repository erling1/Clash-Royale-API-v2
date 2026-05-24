use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct Clan {
    pub clan_tag: String,
    pub clan_name: String,
    pub clan_badge_id: Option<f64>,
}

impl Clan {
    pub const COLUMNS: &'static str =
        "clan_tag, clan_name, clan_badge_id";

    pub fn from_row(row: &duckdb::Row) -> duckdb::Result<Self> {
        Ok(Self {
            clan_tag: row.get(0)?,
            clan_name: row.get(1)?,
            clan_badge_id: row.get(2)?,
        })
    }
}
