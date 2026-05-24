use async_duckdb::Pool;
use crate::models::Card;
use crate::error::AppError;

#[derive(Clone)]
pub struct CardRepo {
    pool: Pool,
}

impl CardRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self) -> Result<Vec<Card>, AppError> {
        let sql = format!("SELECT {} FROM marts.dim_cards", Card::COLUMNS);

        let cards = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([], Card::from_row)?;
            rows.collect::<duckdb::Result<Vec<Card>>>()
        }).await?;

        Ok(cards)
    }

    pub async fn get(&self, id: i64) -> Result<Card, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.dim_cards WHERE card_id = ?",
            Card::COLUMNS
        );

        let card = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([id], Card::from_row)
        }).await;

        match card {
            Ok(c) => Ok(c),
            Err(async_duckdb::Error::Duckdb(duckdb::Error::QueryReturnedNoRows)) => {
                Err(AppError::NotFound)
            }
            Err(e) => Err(AppError::Db(e)),
        }
    }
}
