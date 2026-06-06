use async_duckdb::Pool;
use crate::models::Player;
use crate::error::AppError;

#[derive(Clone)]
pub struct PlayerRepo {
    pool: Pool,
}

impl PlayerRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self, limit: i64, offset: i64) -> Result<Vec<Player>, AppError> {
        // Stable ORDER BY (player_tag breaks trophy ties) so LIMIT/OFFSET paging
        // is deterministic and the client can page server-side.
        let sql = format!(
            "SELECT {} FROM marts.dim_players ORDER BY trophies DESC, player_tag LIMIT ? OFFSET ?",
            Player::COLUMNS
        );

        let players = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map(duckdb::params![limit, offset], Player::from_row)?;
            rows.collect::<duckdb::Result<Vec<Player>>>()
        }).await?;

        Ok(players)
    }

    pub async fn count(&self) -> Result<i64, AppError> {
        let n = self.pool.conn(|conn| {
            let mut stmt = conn.prepare_cached("SELECT count(*) FROM marts.dim_players")?;
            stmt.query_row([], |row| row.get::<_, i64>(0))
        }).await?;

        Ok(n)
    }

    pub async fn get(&self, tag: String) -> Result<Player, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.dim_players WHERE player_tag = ?",
            Player::COLUMNS
        );

        let player = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([tag], Player::from_row)
        }).await;

        match player {
            Ok(p) => Ok(p),
            Err(async_duckdb::Error::Duckdb(duckdb::Error::QueryReturnedNoRows)) => {
                Err(AppError::NotFound)
            }
            Err(e) => Err(AppError::Db(e)),
        }
    }
}
