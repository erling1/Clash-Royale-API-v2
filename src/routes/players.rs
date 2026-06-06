use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::{BattleRepo, PlayerRepo};
use crate::error::AppError;
use crate::routes::common::{clamp_limit, clamp_offset, CountResponse, LimitQuery};

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[get("/players")]
pub async fn list_players(
    repo: web::Data<PlayerRepo>,
    query: web::Query<ListQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let offset = clamp_offset(q.offset);
    let players = repo.list(limit, offset).await?;
    Ok(HttpResponse::Ok().json(players))
}

#[get("/players/count")]
pub async fn count_players(
    repo: web::Data<PlayerRepo>,
) -> Result<HttpResponse, AppError> {
    let count = repo.count().await?;
    Ok(HttpResponse::Ok().json(CountResponse { count }))
}

/// Batch endpoint: every deck card for a player's most-recent `limit` battles in
/// one request, so the battles tab no longer fans out one query per battle row.
/// Rows carry `battle_time`, so the client groups them per battle.
#[get("/players/{player_tag}/battle-deck-cards")]
pub async fn list_player_battle_deck_cards(
    repo: web::Data<BattleRepo>,
    path: web::Path<String>,
    query: web::Query<LimitQuery>,
) -> Result<HttpResponse, AppError> {
    let tag = path.into_inner();
    let limit = clamp_limit(query.into_inner().limit);
    let rows = repo.deck_cards_for_player(tag, limit).await?;
    Ok(HttpResponse::Ok().json(rows))
}

#[get("/players/{tag}")]
pub async fn get_player(
    repo: web::Data<PlayerRepo>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let tag = path.into_inner();
    let player = repo.get(tag).await?;
    Ok(HttpResponse::Ok().json(player))
}
