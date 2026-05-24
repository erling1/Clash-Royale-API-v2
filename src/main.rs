use actix_web::{web, App, HttpServer};

mod db;
mod error;
mod models;
mod repos;
mod routes;

use repos::{
    ArenaRepo, BattleRepo, CardRepo, ClanRepo, GameModeRepo,
    PlayerRepo, PolRankingRepo, SupportCardRepo,
};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    let pool = db::build_pool("./database/data/mydb.duckdb")
        .await
        .expect("failed to open duckdb pool");

    let arena_repo = web::Data::new(ArenaRepo::new(pool.clone()));
    let battle_repo = web::Data::new(BattleRepo::new(pool.clone()));
    let card_repo = web::Data::new(CardRepo::new(pool.clone()));
    let clan_repo = web::Data::new(ClanRepo::new(pool.clone()));
    let game_mode_repo = web::Data::new(GameModeRepo::new(pool.clone()));
    let player_repo = web::Data::new(PlayerRepo::new(pool.clone()));
    let pol_ranking_repo = web::Data::new(PolRankingRepo::new(pool.clone()));
    let support_card_repo = web::Data::new(SupportCardRepo::new(pool.clone()));

    HttpServer::new(move || {
        App::new()
            .app_data(arena_repo.clone())
            .app_data(battle_repo.clone())
            .app_data(card_repo.clone())
            .app_data(clan_repo.clone())
            .app_data(game_mode_repo.clone())
            .app_data(player_repo.clone())
            .app_data(pol_ranking_repo.clone())
            .app_data(support_card_repo.clone())
            .configure(routes::config)
    })
    .bind("0.0.0.0:3000")?
    .run()
    .await
}
