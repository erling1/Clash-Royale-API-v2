use actix_web::web;

pub mod arenas;
pub mod battles;
pub mod cards;
pub mod clans;
pub mod common;
pub mod decks;
pub mod game_modes;
pub mod matchups;
pub mod players;
pub mod rankings;
pub mod support_cards;

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api/v1")
            .service(arenas::list_arenas)
            .service(arenas::get_arena)
            .service(cards::list_cards)
            .service(cards::get_card)
            .service(cards::list_card_meta)
            .service(cards::get_card_meta)
            .service(cards::list_card_pairs)
            .service(clans::list_clans)
            .service(clans::get_clan)
            .service(decks::list_decks)
            .service(decks::count_decks)
            .service(decks::get_deck)
            .service(matchups::list_matchups)
            .service(matchups::get_deck_matchups)
            .service(game_modes::list_game_modes)
            .service(game_modes::get_game_mode)
            .service(support_cards::list_support_cards)
            .service(support_cards::get_support_card)
            .service(players::list_players)
            .service(players::count_players)
            .service(players::list_player_battle_deck_cards)
            .service(players::get_player)
            .service(battles::list_battles)
            .service(battles::get_battle)
            .service(battles::list_battle_participants)
            .service(battles::list_battle_deck_cards)
            .service(battles::list_battle_support_cards)
            .service(rankings::list_rankings),
    );
}
