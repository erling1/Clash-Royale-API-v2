use async_duckdb::Pool;
use crate::models::SupportCard;
use crate::error::AppError;

#[derive(Clone)]
pub struct SupportCardRepo {
    pool: Pool,
}

impl SupportCardRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self) -> Result<Vec<SupportCard>, AppError> {
        let sql = format!("SELECT {} FROM marts.dim_support_cards", SupportCard::COLUMNS);

        let cards = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([], SupportCard::from_row)?;
            rows.collect::<duckdb::Result<Vec<SupportCard>>>()
        }).await?;

        Ok(cards)
    }

    pub async fn get(&self, id: i64) -> Result<SupportCard, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.dim_support_cards WHERE card_id = ?",
            SupportCard::COLUMNS
        );

        let card = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([id], SupportCard::from_row)
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
