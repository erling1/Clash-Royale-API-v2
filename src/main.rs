use actix_web::{web, App, HttpServer};

mod db;
mod error;
mod models;
mod repos;
mod routes;

use repos::CardRepo;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = db::build_pool("./database/data/mydb.duckdb")
        .await
        .expect("failed to open duckdb pool");

    let card_repo = web::Data::new(CardRepo::new(pool.clone()));

    HttpServer::new(move || {
        App::new()
            .app_data(card_repo.clone())
            .configure(routes::config)
    })
    .bind("0.0.0.0:3000")?
    .run()
    .await
}
