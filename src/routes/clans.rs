use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::ClanRepo;
use crate::error::AppError;

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub limit: Option<u32>,
}

fn clamp_limit(raw: Option<u32>) -> i64 {
    raw.unwrap_or(100).min(1000) as i64
}

#[get("/clans")]
pub async fn list_clans(
    repo: web::Data<ClanRepo>,
    query: web::Query<ListQuery>,
) -> Result<HttpResponse, AppError> {
    let limit = clamp_limit(query.limit);
    let clans = repo.list(limit).await?;
    Ok(HttpResponse::Ok().json(clans))
}

#[get("/clans/{tag}")]
pub async fn get_clan(
    repo: web::Data<ClanRepo>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let tag = path.into_inner();
    let clan = repo.get(tag).await?;
    Ok(HttpResponse::Ok().json(clan))
}
