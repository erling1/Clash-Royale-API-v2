use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::PlayerRepo;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub limit: Option<u32>,
}

fn clamp_limit(raw: Option<u32>) -> i64 {
    raw.unwrap_or(100).min(1000) as i64
}

#[get("/players")]
pub async fn list_players(
    repo: web::Data<PlayerRepo>,
    query: web::Query<ListQuery>,
) -> Result<HttpResponse, AppError> {
    let limit = clamp_limit(query.limit);
    let players = repo.list(limit).await?;
    Ok(HttpResponse::Ok().json(players))
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
