use async_duckdb::Pool;
use crate::models::PolRanking;
use crate::error::AppError;

#[derive(Clone)]
pub struct PolRankingRepo {
    pool: Pool,
}

impl PolRankingRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(
        &self,
        season_id: Option<String>,
        limit: i64,
    ) -> Result<Vec<PolRanking>, AppError> {
        let sql_filtered = format!(
            "SELECT {} FROM marts.fct_pol_rankings WHERE season_id = ? ORDER BY player_rank ASC LIMIT ?",
            PolRanking::COLUMNS
        );
        let sql_all = format!(
            "SELECT {} FROM marts.fct_pol_rankings ORDER BY season_id DESC, player_rank ASC LIMIT ?",
            PolRanking::COLUMNS
        );

        let rankings = self.pool.conn(move |conn| {
            if let Some(season) = season_id {
                let mut stmt = conn.prepare_cached(&sql_filtered)?;
                let rows = stmt.query_map(duckdb::params![season, limit], PolRanking::from_row)?;
                rows.collect::<duckdb::Result<Vec<PolRanking>>>()
            } else {
                let mut stmt = conn.prepare_cached(&sql_all)?;
                let rows = stmt.query_map([limit], PolRanking::from_row)?;
                rows.collect::<duckdb::Result<Vec<PolRanking>>>()
            }
        }).await?;

        Ok(rankings)
    }
}
