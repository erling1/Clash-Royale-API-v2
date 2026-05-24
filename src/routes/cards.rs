use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::CardRepo;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct CardPairsQuery {
    pub card_id: Option<i64>,
    pub limit: Option<u32>,
}

#[derive(Debug, Deserialize)]
pub struct CardMetaListQuery {
    pub limit: Option<u32>,
}

fn clamp_limit(raw: Option<u32>) -> i64 {
    raw.unwrap_or(100).min(1000) as i64
}

#[get("/cards")]
pub async fn list_cards(
    repo: web::Data<CardRepo>,
) -> Result<HttpResponse, AppError> {
    let cards = repo.list().await?;
    Ok(HttpResponse::Ok().json(cards))
}

#[get("/cards/{id}")]
pub async fn get_card(
    repo: web::Data<CardRepo>,
    path: web::Path<i64>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let card = repo.get(id).await?;
    Ok(HttpResponse::Ok().json(card))
}

#[get("/card-meta")]
pub async fn list_card_meta(
    repo: web::Data<CardRepo>,
    query: web::Query<CardMetaListQuery>,
) -> Result<HttpResponse, AppError> {
    let limit = clamp_limit(query.into_inner().limit);
    let rows = repo.meta_list(limit).await?;
    Ok(HttpResponse::Ok().json(rows))
}

#[get("/card-meta/{id}")]
pub async fn get_card_meta(
    repo: web::Data<CardRepo>,
    path: web::Path<i64>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let meta = repo.meta_get(id).await?;
    Ok(HttpResponse::Ok().json(meta))
}

#[get("/card-pairs")]
pub async fn list_card_pairs(
    repo: web::Data<CardRepo>,
    query: web::Query<CardPairsQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let rows = repo.pairs_list(q.card_id, limit).await?;
    Ok(HttpResponse::Ok().json(rows))
}
