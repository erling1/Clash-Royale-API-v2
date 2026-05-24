use actix_web::{get, web, HttpResponse};
use crate::repos::ArenaRepo;
use crate::error::AppError;

#[get("/arenas")]
pub async fn list_arenas(
    repo: web::Data<ArenaRepo>,
) -> Result<HttpResponse, AppError> {
    let arenas = repo.list().await?;
    Ok(HttpResponse::Ok().json(arenas))
}

#[get("/arenas/{id}")]
pub async fn get_arena(
    repo: web::Data<ArenaRepo>,
    path: web::Path<i64>,
) -> Result<HttpResponse, AppError> {
    let id = path.into_inner();
    let arena = repo.get(id).await?;
    Ok(HttpResponse::Ok().json(arena))
}
