use actix_web::{get, web, HttpResponse};
use crate::repos::SupportCardRepo;
use crate::error::AppError;

#[get("/support-cards")]
pub async fn list_support_cards(
    repo: web::Data<SupportCardRepo>,
) -> Result<HttpResponse, AppError> {
    let cards = repo.list().await?;
    Ok(HttpResponse::Ok().json(cards))
}

#[get("/support-cards/{id}")]
pub async fn get_support_card(
    repo: web::Data<SupportCardRepo>,
    path: web::Path<i64>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let card = repo.get(id).await?;
    Ok(HttpResponse::Ok().json(card))
}
