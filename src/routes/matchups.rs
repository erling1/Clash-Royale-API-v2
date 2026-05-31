use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::DeckMatchupsRepo;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct MatchupListQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

fn clamp_limit(raw: Option<u32>) -> i64 {
    raw.unwrap_or(100).min(1000) as i64
}

#[get("/matchups")]
pub async fn list_matchups(
    repo: web::Data<DeckMatchupsRepo>,
    query: web::Query<MatchupListQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let offset = q.offset.unwrap_or(0) as i64;
    let matchups = repo.list(limit, offset).await?;
    Ok(HttpResponse::Ok().json(matchups))
}

#[get("/matchups/{deck_hash}")]
pub async fn get_deck_matchups(
    repo: web::Data<DeckMatchupsRepo>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let hash = path.into_inner();
    let matchups = repo.by_deck(hash).await?;
    Ok(HttpResponse::Ok().json(matchups))
}
