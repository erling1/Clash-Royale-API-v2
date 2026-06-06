use actix_web::{get, web, HttpResponse};
use serde::Deserialize;
use crate::repos::DeckRepo;
use crate::error::AppError;
use crate::routes::common::{clamp_limit, clamp_offset, CountResponse};

#[derive(Debug, Deserialize)]
pub struct DeckListQuery {
    pub limit: Option<u32>,
    pub offset: Option<u32>,
    /// When set, return only decks containing this card (powers the card-detail
    /// page without shipping the full deck list to the client).
    pub card_id: Option<i64>,
    /// Sort column + direction for server-side paging. Both are whitelisted; any
    /// unknown value falls back to popularity_rank ascending.
    pub sort: Option<String>,
    pub dir: Option<String>,
}

/// Map a client `sort`/`dir` to a safe ORDER BY clause. Only the columns the
/// decks table actually sorts on are accepted; everything else degrades to the
/// popularity default. A popularity_rank tiebreaker keeps paging deterministic.
fn deck_order_by(sort: Option<&str>, dir: Option<&str>) -> String {
    let column = match sort {
        Some("win_rate") => "win_rate",
        Some("avg_elixir_cost") => "avg_elixir_cost",
        Some("appearance_count") => "appearance_count",
        Some("avg_crowns") => "avg_crowns",
        Some("avg_trophy_change") => "avg_trophy_change",
        _ => "popularity_rank",
    };
    let direction = if matches!(dir, Some("desc")) { "DESC" } else { "ASC" };
    if column == "popularity_rank" {
        format!("popularity_rank {direction}")
    } else {
        // NULLS LAST is DuckDB's default; the rank tiebreaker stabilizes ties.
        format!("{column} {direction}, popularity_rank ASC")
    }
}

#[get("/decks")]
pub async fn list_decks(
    repo: web::Data<DeckRepo>,
    query: web::Query<DeckListQuery>,
) -> Result<HttpResponse, AppError> {
    let q = query.into_inner();
    let limit = clamp_limit(q.limit);
    let offset = clamp_offset(q.offset);
    let order_by = deck_order_by(q.sort.as_deref(), q.dir.as_deref());
    let decks = repo.list(limit, offset, q.card_id, &order_by).await?;
    Ok(HttpResponse::Ok().json(decks))
}

#[get("/decks/count")]
pub async fn count_decks(
    repo: web::Data<DeckRepo>,
) -> Result<HttpResponse, AppError> {
    let count = repo.count().await?;
    Ok(HttpResponse::Ok().json(CountResponse { count }))
}

#[get("/decks/{deck_hash}")]
pub async fn get_deck(
    repo: web::Data<DeckRepo>,
    path: web::Path<String>,
) -> Result<HttpResponse, AppError> {
    let hash = path.into_inner();
    let deck = repo.get(hash).await?;
    Ok(HttpResponse::Ok().json(deck))
}
