use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::PolRankingRepo;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct RankingQuery {
    pub season_id: Option<String>,
    pub limit: Option<u32>,
}

fn clamp_limit(raw: Option<u32>) -> i64 {
    raw.unwrap_or(100).min(1000) as i64
}

#[get("/rankings")]
pub async fn list_rankings(
    repo: web::Data<PolRankingRepo>,
    query: web::Query<RankingQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let rankings = repo.list(q.season_id, limit).await?;
    Ok(HttpResponse::Ok().json(rankings))
}
