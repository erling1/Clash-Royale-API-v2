use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::DeckRepo;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct DeckListQuery {
    pub limit: Option<u32>,
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
    let decks = repo.list(limit).await?;
    Ok(HttpResponse::Ok().json(decks))
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
