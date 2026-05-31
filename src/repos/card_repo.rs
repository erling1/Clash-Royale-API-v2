use async_duckdb::Pool;
use crate::models::{Card, CardMeta, CardPair};
use crate::error::AppError;

/// Collapses the long (card_id × variant) rows of `dim_cards` into one wide row
/// per card, exposing the base/evolution/hero icon URLs as columns.
/// STOPGAP — see NOTES.md: this belongs in a proper wide `dim_cards` model.
const CARD_PIVOT: &str = "
    SELECT
        card_id,
        any_value(card_name)             AS card_name,
        any_value(rarity)                AS rarity,
        any_value(elixir_cost)           AS elixir_cost,
        any_value(max_level)             AS max_level,
        any_value(max_evolution_level)   AS max_evolution_level,
        max(icon_url) FILTER (WHERE card_variant = 'base')      AS icon_url,
        max(icon_url) FILTER (WHERE card_variant = 'evolution') AS icon_url_evolution,
        max(icon_url) FILTER (WHERE card_variant = 'hero')      AS icon_url_hero
    FROM marts.dim_cards";

#[derive(Clone)]
pub struct CardRepo {
    pool: Pool,
}

impl CardRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(&self) -> Result<Vec<Card>, AppError> {
        let sql = format!("{CARD_PIVOT} GROUP BY card_id");

        let cards = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([], Card::from_row)?;
            rows.collect::<duckdb::Result<Vec<Card>>>()
        }).await?;

        Ok(cards)
    }

    pub async fn get(&self, id: i64) -> Result<Card, AppError> {
        let sql = format!("{CARD_PIVOT} WHERE card_id = ? GROUP BY card_id");

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
