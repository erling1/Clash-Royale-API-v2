use actix_web::{get, web, HttpResponse};
use crate::repos::ClanRepo;
use crate::error::AppError;

#[get("/clans")]
pub async fn list_clans(
    repo: web::Data<ClanRepo>,
) -> Result<HttpResponse, AppError> {
    let clans = repo.list().await?;
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
