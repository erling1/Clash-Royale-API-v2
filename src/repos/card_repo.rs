use async_duckdb::Pool;
use crate::models::{Card, CardMeta, CardPair};
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
        let sql = format!(
            "SELECT {} FROM marts.dim_cards WHERE card_variant = 'base'",
            Card::COLUMNS
        );

        let cards = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([], Card::from_row)?;
            rows.collect::<duckdb::Result<Vec<Card>>>()
        }).await?;

        Ok(cards)
    }

    pub async fn get(&self, id: i64) -> Result<Card, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.dim_cards WHERE card_id = ? AND card_variant = 'base'",
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

    pub async fn meta_list(&self, limit: i64) -> Result<Vec<CardMeta>, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_card_meta ORDER BY popularity_rank ASC LIMIT ?",
            CardMeta::COLUMNS
        );

        let rows = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([limit], CardMeta::from_row)?;
            rows.collect::<duckdb::Result<Vec<CardMeta>>>()
        }).await?;

        Ok(rows)
    }

    pub async fn meta_get(&self, id: i64) -> Result<CardMeta, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_card_meta WHERE card_id = ?",
            CardMeta::COLUMNS
        );

        let meta = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([id], CardMeta::from_row)
        }).await;

        match meta {
            Ok(m) => Ok(m),
            Err(async_duckdb::Error::Duckdb(duckdb::Error::QueryReturnedNoRows)) => {
                Err(AppError::NotFound)
            }
            Err(e) => Err(AppError::Db(e)),
        }
    }

    pub async fn pairs_list(
        &self,
        card_id: Option<i64>,
        limit: i64,
    ) -> Result<Vec<CardPair>, AppError> {
        let sql_filtered = format!(
            "SELECT {} FROM marts.fct_card_pairs WHERE card_id_a = ? OR card_id_b = ? ORDER BY co_occurrence_count DESC LIMIT ?",
            CardPair::COLUMNS
        );
        let sql_all = format!(
            "SELECT {} FROM marts.fct_card_pairs ORDER BY popularity_rank ASC LIMIT ?",
            CardPair::COLUMNS
        );

        let rows = self.pool.conn(move |conn| {
            if let Some(id) = card_id {
                let mut stmt = conn.prepare_cached(&sql_filtered)?;
                let rows = stmt.query_map(duckdb::params![id, id, limit], CardPair::from_row)?;
                rows.collect::<duckdb::Result<Vec<CardPair>>>()
            } else {
                let mut stmt = conn.prepare_cached(&sql_all)?;
                let rows = stmt.query_map([limit], CardPair::from_row)?;
                rows.collect::<duckdb::Result<Vec<CardPair>>>()
            }
        }).await?;

        Ok(rows)
    }
}
