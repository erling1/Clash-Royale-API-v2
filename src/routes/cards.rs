use actix_web::{get, web, HttpResponse};
use crate::repos::CardRepo;
use crate::error::AppError;

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
