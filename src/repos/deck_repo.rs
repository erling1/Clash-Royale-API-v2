use async_duckdb::Pool;
use crate::models::DeckMeta;
use crate::error::AppError;

#[derive(Clone)]
pub struct DeckRepo {
    pool: Pool,
}

impl DeckRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self, limit: i64) -> Result<Vec<DeckMeta>, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_deck_meta ORDER BY popularity_rank ASC LIMIT ?",
            DeckMeta::COLUMNS
        );

        let decks = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([limit], DeckMeta::from_row)?;
            rows.collect::<duckdb::Result<Vec<DeckMeta>>>()
        }).await?;

        Ok(decks)
    }

    pub async fn get(&self, deck_hash: String) -> Result<DeckMeta, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_deck_meta WHERE deck_hash = ?",
            DeckMeta::COLUMNS
        );

        let deck = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([deck_hash], DeckMeta::from_row)
        }).await;

        match deck {
            Ok(d) => Ok(d),
            Err(async_duckdb::Error::Duckdb(duckdb::Error::QueryReturnedNoRows)) => {
                Err(AppError::NotFound)
            }
            Err(e) => Err(AppError::Db(e)),
        }
    }
}
