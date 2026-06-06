use actix_web::{middleware, web, App, HttpServer};
use actix_web_prom::PrometheusMetricsBuilder;

mod db;
mod error;
mod models;
mod repos;
mod routes;

use repos::{
    ArenaRepo, BattleRepo, CardRepo, ClanRepo, DeckMatchupsRepo, DeckRepo, GameModeRepo,
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
    let deck_repo = web::Data::new(DeckRepo::new(pool.clone()));
    let deck_matchups_repo = web::Data::new(DeckMatchupsRepo::new(pool.clone()));
    let game_mode_repo = web::Data::new(GameModeRepo::new(pool.clone()));
    let player_repo = web::Data::new(PlayerRepo::new(pool.clone()));
    let pol_ranking_repo = web::Data::new(PolRankingRepo::new(pool.clone()));
    let support_card_repo = web::Data::new(SupportCardRepo::new(pool.clone()));

    // Prometheus metrics. Built once (shared registry) and cloned into each
    // worker. Exposes GET /metrics with per-route request totals + latency
    // histograms. Internal only — Caddy never proxies here; Alloy scrapes
    // api:3000/metrics over the compose network.
    let prometheus = PrometheusMetricsBuilder::new("api")
        .endpoint("/metrics")
        .build()
        .expect("failed to build prometheus middleware");

    HttpServer::new(move || {
        App::new()
            // Metrics first so it observes every request (incl. those handled
            // by later middleware).
            .wrap(prometheus.clone())
            // gzip/br/zstd negotiated via Accept-Encoding (actix-web default features)
            .wrap(middleware::Compress::default())
            // Mart data changes only on the pipeline cadence — let browsers/CDN cache GETs.
            // NOTE: DefaultHeaders applies to every response incl. 4xx/5xx; revisit if we
            // ever return per-user or rapidly-changing data.
            .wrap(
                middleware::DefaultHeaders::new()
                    .add(("Cache-Control", "public, max-age=60, stale-while-revalidate=300")),
            )
            .app_data(arena_repo.clone())
            .app_data(battle_repo.clone())
            .app_data(card_repo.clone())
            .app_data(clan_repo.clone())
            .app_data(deck_repo.clone())
            .app_data(deck_matchups_repo.clone())
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
