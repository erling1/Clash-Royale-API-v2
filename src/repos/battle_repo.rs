use async_duckdb::Pool;
use crate::models::{Battle, BattleParticipant, BattleDeckCard, BattleSupportCard};
use crate::error::AppError;

#[derive(Clone)]
pub struct BattleRepo {
    pool: Pool,
}

impl BattleRepo {
    pub fn new(pool: Pool) -> Self {
        Self { pool }
    }

    pub async fn list(
        &self,
        player_tag: Option<String>,
        limit: i64,
    ) -> Result<Vec<Battle>, AppError> {
        let sql_filtered = format!(
            "SELECT {} FROM marts.fct_battles WHERE queried_player_tag = ? ORDER BY battle_time DESC LIMIT ?",
            Battle::COLUMNS
        );
        let sql_all = format!(
            "SELECT {} FROM marts.fct_battles ORDER BY battle_time DESC LIMIT ?",
            Battle::COLUMNS
        );

        let battles = self.pool.conn(move |conn| {
            if let Some(tag) = player_tag {
                let mut stmt = conn.prepare_cached(&sql_filtered)?;
                let rows = stmt.query_map(duckdb::params![tag, limit], Battle::from_row)?;
                rows.collect::<duckdb::Result<Vec<Battle>>>()
            } else {
                let mut stmt = conn.prepare_cached(&sql_all)?;
                let rows = stmt.query_map([limit], Battle::from_row)?;
                rows.collect::<duckdb::Result<Vec<Battle>>>()
            }
        }).await?;

        Ok(battles)
    }

    pub async fn get(&self, id: String) -> Result<Battle, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_battles WHERE battle_id = ?",
            Battle::COLUMNS
        );

        let battle = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            stmt.query_row([id], Battle::from_row)
        }).await;

        match battle {
            Ok(b) => Ok(b),
            Err(async_duckdb::Error::Duckdb(duckdb::Error::QueryReturnedNoRows)) => {
                Err(AppError::NotFound)
            }
            Err(e) => Err(AppError::Db(e)),
        }
    }

    pub async fn participants(&self, battle_id: String) -> Result<Vec<BattleParticipant>, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_battle_participants WHERE battle_id = ? ORDER BY participant_side, slot",
            BattleParticipant::COLUMNS
        );

        let rows = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([battle_id], BattleParticipant::from_row)?;
            rows.collect::<duckdb::Result<Vec<BattleParticipant>>>()
        }).await?;

        Ok(rows)
    }

    pub async fn deck_cards(&self, battle_id: String) -> Result<Vec<BattleDeckCard>, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_battle_deck_cards WHERE battle_id = ? ORDER BY participant_id, deck_slot",
            BattleDeckCard::COLUMNS
        );

        let rows = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([battle_id], BattleDeckCard::from_row)?;
            rows.collect::<duckdb::Result<Vec<BattleDeckCard>>>()
        }).await?;

        Ok(rows)
    }

    pub async fn support_cards(&self, battle_id: String) -> Result<Vec<BattleSupportCard>, AppError> {
        let sql = format!(
            "SELECT {} FROM marts.fct_battle_support_cards WHERE battle_id = ? ORDER BY participant_id, support_slot",
            BattleSupportCard::COLUMNS
        );

        let rows = self.pool.conn(move |conn| {
            let mut stmt = conn.prepare_cached(&sql)?;
            let rows = stmt.query_map([battle_id], BattleSupportCard::from_row)?;
            rows.collect::<duckdb::Result<Vec<BattleSupportCard>>>()
        }).await?;

        Ok(rows)
    }
}
