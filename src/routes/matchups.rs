use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::DeckMatchupsRepo;
use crate::error::AppError;
use crate::routes::common::{clamp_limit, clamp_offset, LimitQuery};

#[derive(Debug, Deserialize)]
pub struct MatchupListQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[get("/matchups")]
pub async fn list_matchups(
    repo: web::Data<DeckMatchupsRepo>,
    query: web::Query<MatchupListQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let offset = clamp_offset(q.offset);
    let matchups = repo.list(limit, offset).await?;
    Ok(HttpResponse::Ok().json(matchups))
}

#[get("/matchups/{deck_hash}")]
pub async fn get_deck_matchups(
    repo: web::Data<DeckMatchupsRepo>,
    path: web::Path<String>,
    query: web::Query<LimitQuery>,
) -> Result<HttpResponse, AppError> {
    let hash = path.into_inner();
    let limit = clamp_limit(query.into_inner().limit);
    let matchups = repo.by_deck(hash, limit).await?;
    Ok(HttpResponse::Ok().json(matchups))
}
