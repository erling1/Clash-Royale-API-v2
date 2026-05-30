use async_duckdb::Pool;
use crate::models::Clan;
use crate::error::AppError;

#[derive(Clone)]
pub struct ClanRepo {
    pool: Pool,
}

impl ClanRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self, limit: i64) -> Result<Vec<Clan>, AppError> {
        let sql = format!("SELECT {} FROM marts.dim_clans LIMIT ?", Clan::COLUMNS);

        let clans = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([limit], Clan::from_row)?;
            rows.collect::<duckdb::Result<Vec<Clan>>>()
        }).await?;

        Ok(clans)
    }

    pub async fn get(&self, tag: String) -> Result<Clan, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.dim_clans WHERE clan_tag = ?",
            Clan::COLUMNS
        );

        let clan = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([tag], Clan::from_row)
        }).await;

        match clan {
            Ok(c) => Ok(c),
            Err(async_duckdb::Error::Duckdb(duckdb::Error::QueryReturnedNoRows)) => {
                Err(AppError::NotFound)
            }
            Err(e) => Err(AppError::Db(e)),
        }
    }
}
