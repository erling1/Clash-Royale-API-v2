use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::ClanRepo;
use crate::error::AppError;
use crate::routes::common::{clamp_limit, clamp_offset};

#[derive(Debug, Deserialize)]
pub struct ListQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
}

#[get("/clans")]
pub async fn list_clans(
    repo: web::Data<ClanRepo>,
    query: web::Query<ListQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let offset = clamp_offset(q.offset);
    let clans = repo.list(limit, offset).await?;
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
