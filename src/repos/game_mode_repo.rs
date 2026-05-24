use async_duckdb::Pool;
use crate::models::GameMode;
use crate::error::AppError;

#[derive(Clone)]
pub struct GameModeRepo {
    pool: Pool,
}

impl GameModeRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self) -> Result<Vec<GameMode>, AppError> {
        let sql = format!("SELECT {} FROM marts.dim_game_modes", GameMode::COLUMNS);

        let modes = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([], GameMode::from_row)?;
            rows.collect::<duckdb::Result<Vec<GameMode>>>()
        }).await?;

        Ok(modes)
    }

    pub async fn get(&self, id: i64) -> Result<GameMode, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.dim_game_modes WHERE game_mode_id = ?",
            GameMode::COLUMNS
        );

        let mode = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([id], GameMode::from_row)
        }).await;

        match mode {
            Ok(m) => Ok(m),
            Err(async_duckdb::Error::Duckdb(duckdb::Error::QueryReturnedNoRows)) => {
                Err(AppError::NotFound)
            }
            Err(e) => Err(AppError::Db(e)),
        }
    }
}
