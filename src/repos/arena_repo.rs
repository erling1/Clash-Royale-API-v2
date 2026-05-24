use async_duckdb::Pool;
use crate::models::Arena;
use crate::error::AppError;

#[derive(Clone)]
pub struct ArenaRepo {
    pool: Pool,
}

impl ArenaRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self) -> Result<Vec<Arena>, AppError> {
        let sql = format!("SELECT {} FROM marts.dim_arenas", Arena::COLUMNS);

        let arenas = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([], Arena::from_row)?;
            rows.collect::<duckdb::Result<Vec<Arena>>>()
        }).await?;

        Ok(arenas)
    }

    pub async fn get(&self, id: i64) -> Result<Arena, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.dim_arenas WHERE arena_id = ?",
            Arena::COLUMNS
        );

        let arena = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([id], Arena::from_row)
        }).await;

        match arena {
            Ok(a) => Ok(a),
            Err(async_duckdb::Error::Duckdb(duckdb::Error::QueryReturnedNoRows)) => {
                Err(AppError::NotFound)
            }
            Err(e) => Err(AppError::Db(e)),
        }
    }
}
