use actix_web::{get, web, HttpResponse};
use serde::{Deserialize, Serialize};
use crate::repos::DeckRepo;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct DeckListQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[derive(Debug, Serialize)]
pub struct CountResponse {
    pub count: i64,
}

fn clamp_limit(raw: Option<u32>) -> i64 {
    raw.unwrap_or(100).min(1000) as i64
}

#[get("/decks")]
pub async fn list_decks(
    repo: web::Data<DeckRepo>,
    query: web::Query<DeckListQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let offset = q.offset.unwrap_or(0) as i64;
    let decks = repo.list(limit, offset).await?;
    Ok(HttpResponse::Ok().json(decks))
}

#[get("/decks/count")]
pub async fn count_decks(
    repo: web::Data<DeckRepo>,
) -> Result<HttpResponse, AppError> {
    let count = repo.count().await?;
    Ok(HttpResponse::Ok().json(CountResponse { count }))
}

#[get("/decks/{deck_hash}")]
pub async fn get_deck(
    repo: web::Data<DeckRepo>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let hash = path.into_inner();
    let deck = repo.get(hash).await?;
    Ok(HttpResponse::Ok().json(deck))
}
