use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::PolRankingRepo;
use crate::error::AppError;
use crate::routes::common::clamp_limit;

#[derive(Debug, Deserialize)]
pub struct RankingQuery {
    pub season_id: Option<String>,
    pub limit: Option<u32>,
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
