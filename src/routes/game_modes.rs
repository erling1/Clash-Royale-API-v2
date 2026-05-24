use actix_web::{get, web, HttpResponse};
use crate::repos::GameModeRepo;
use crate::error::AppError;

#[get("/game-modes")]
pub async fn list_game_modes(
    repo: web::Data<GameModeRepo>,
) -> Result<HttpResponse, AppError> {
    let modes = repo.list().await?;
    Ok(HttpResponse::Ok().json(modes))
}

#[get("/game-modes/{id}")]
pub async fn get_game_mode(
    repo: web::Data<GameModeRepo>,
    path: web::Path<i64>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let mode = repo.get(id).await?;
    Ok(HttpResponse::Ok().json(mode))
}
