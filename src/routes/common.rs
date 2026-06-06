use serde::{Deserialize, Serialize};

pub const DEFAULT_LIMIT: u32 = 100;
pub const MAX_LIMIT: u32 = 1000;

/// Clamp a caller-supplied `limit` to `[_, MAX_LIMIT]`, defaulting to
/// `DEFAULT_LIMIT` when absent. Shared by every list endpoint.
pub fn clamp_limit(raw: Option<u32>) -> i64 {
    raw.unwrap_or(DEFAULT_LIMIT).min(MAX_LIMIT) as i64
}

/// Clamp a caller-supplied `offset`, defaulting to 0 when absent.
pub fn clamp_offset(raw: Option<u32>) -> i64 {
    raw.unwrap_or(0) as i64
}

/// Query struct for endpoints that only accept a `limit`.
#[derive(Debug, Deserialize)]
pub struct LimitQuery {
    pub limit: Option<u32>,
}

/// Uniform `{ "count": n }` response body for count endpoints.
#[derive(Debug, Serialize)]
pub struct CountResponse {
    pub count: i64,
}
