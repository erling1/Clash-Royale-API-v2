use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::BattleRepo;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct BattleListQuery {
    pub player_tag: Option<String>,
    pub limit: Option<u32>,
}

fn clamp_limit(raw: Option<u32>) -> i64 {
    raw.unwrap_or(100).min(1000) as i64
}

#[get("/battles")]
pub async fn list_battles(
    repo: web::Data<BattleRepo>,
    query: web::Query<BattleListQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let battles = repo.list(q.player_tag, limit).await?;
    Ok(HttpResponse::Ok().json(battles))
}

#[get("/battles/{queried_player_tag}/{battle_time}")]
pub async fn get_battle(
    repo: web::Data<BattleRepo>,
    path: web::Path<(String, String)>,
) -> Result<HttpResponse, AppError> {
    let (tag, time) = path.into_inner();
    let battle = repo.get(tag, time).await?;
    Ok(HttpResponse::Ok().json(battle))
}

#[get("/battles/{queried_player_tag}/{battle_time}/participants")]
pub async fn list_battle_participants(
    repo: web::Data<BattleRepo>,
    path: web::Path<(String, String)>,
) -> Result<HttpResponse, AppError> {
    let (tag, time) = path.into_inner();
    let rows = repo.participants(tag, time).await?;
    Ok(HttpResponse::Ok().json(rows))
}

#[get("/battles/{queried_player_tag}/{battle_time}/deck-cards")]
pub async fn list_battle_deck_cards(
    repo: web::Data<BattleRepo>,
    path: web::Path<(String, String)>,
) -> Result<HttpResponse, AppError> {
    let (tag, time) = path.into_inner();
    let rows = repo.deck_cards(tag, time).await?;
    Ok(HttpResponse::Ok().json(rows))
}

#[get("/battles/{queried_player_tag}/{battle_time}/support-cards")]
pub async fn list_battle_support_cards(
    repo: web::Data<BattleRepo>,
    path: web::Path<(String, String)>,
) -> Result<HttpResponse, AppError> {
    let (tag, time) = path.into_inner();
    let rows = repo.support_cards(tag, time).await?;
    Ok(HttpResponse::Ok().json(rows))
}
