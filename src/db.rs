use async_duckdb::{Pool, PoolBuilder};

pub async fn build_pool(path: &str) -> Result<Pool, async_duckdb::Error> {
    PoolBuilder::new()
        .path(path)
        .num_conns(8)
        .open()
        .await
}
