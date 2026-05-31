use async_duckdb::Pool;
use crate::models::DeckMatchup;
use crate::error::AppError;

#[derive(Clone)]
pub struct DeckMatchupsRepo {
    pool: Pool,
}

impl DeckMatchupsRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self, limit: i64, offset: i64) -> Result<Vec<DeckMatchup>, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_deck_matchups ORDER BY matchup_count DESC LIMIT ? OFFSET ?",
            DeckMatchup::COLUMNS
        );

        let matchups = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map(duckdb::params![limit, offset], DeckMatchup::from_row)?;
            rows.collect::<duckdb::Result<Vec<DeckMatchup>>>()
        }).await?;

        Ok(matchups)
    }

    pub async fn by_deck(&self, deck_hash: String) -> Result<Vec<DeckMatchup>, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_deck_matchups WHERE deck_hash = ? ORDER BY matchup_count DESC",
            DeckMatchup::COLUMNS
        );

        let matchups = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map(duckdb::params![deck_hash], DeckMatchup::from_row)?;
            rows.collect::<duckdb::Result<Vec<DeckMatchup>>>()
        }).await?;

        Ok(matchups)
    }
}
