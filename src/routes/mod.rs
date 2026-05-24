use actix_web::web;

pub mod cards;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .service(cards::list_cards)
            .service(cards::get_card)
    );
}
