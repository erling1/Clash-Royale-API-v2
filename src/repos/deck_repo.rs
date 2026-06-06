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

    pub async fn list(
        &self,
        limit: i64,
        offset: i64,
        card_id: Option<i64>,
        order_by: &str,
    ) -> Result<Vec<DeckMeta>, AppError> {
        // `order_by` is a whitelisted clause built by the route (never raw user
        // input), so interpolating it here is injection-safe. Two prepared
        // variants: the filtered one has an extra `?` for card_id, so the param
        // counts differ and the SQL strings can't be shared.
        let sql_all = format!(
            "SELECT {} FROM marts.fct_deck_meta ORDER BY {order_by} LIMIT ? OFFSET ?",
            DeckMeta::COLUMNS
        );
        let sql_by_card = format!(
            "SELECT {} FROM marts.fct_deck_meta WHERE list_contains(card_ids, ?) \
             ORDER BY {order_by} LIMIT ? OFFSET ?",
            DeckMeta::COLUMNS
        );

        let decks = self.pool.conn(move |conn| {
            if let Some(id) = card_id {
                let mut stmt = conn.prepare_cached(&sql_by_card)?;
                let rows = stmt.query_map(duckdb::params![id, limit, offset], DeckMeta::from_row)?;
                rows.collect::<duckdb::Result<Vec<DeckMeta>>>()
            } else {
                let mut stmt = conn.prepare_cached(&sql_all)?;
                let rows = stmt.query_map(duckdb::params![limit, offset], DeckMeta::from_row)?;
                rows.collect::<duckdb::Result<Vec<DeckMeta>>>()
            }
        }).await?;

        Ok(decks)
    }

    pub async fn count(&self) -> Result<i64, AppError> {
        let n = self.pool.conn(|conn| {
            let mut stmt = conn.prepare_cached("SELECT count(*) FROM marts.fct_deck_meta")?;
            stmt.query_row([], |row| row.get::<_, i64>(0))
        }).await?;

        Ok(n)
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
