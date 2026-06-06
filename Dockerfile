# ---- Builder ----
# edition 2024 needs a recent Rust; bookworm matches the runtime's glibc.
FROM rust:1-bookworm AS builder

# The `bundled` duckdb feature compiles DuckDB's C++ amalgamation from source,
# so the builder needs a C++ toolchain.
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Cache the (slow) dependency build — including DuckDB — by compiling a stub
# main first. This layer is reused until Cargo.toml / Cargo.lock change.
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo 'fn main() {}' > src/main.rs \
    && cargo build --release --locked \
    && rm -rf src target/release/ClashRoyale target/release/deps/ClashRoyale*

# Real sources, then the actual build.
COPY src ./src
RUN cargo build --release --locked

# ---- Runtime ----
FROM debian:bookworm-slim AS runtime

# DuckDB dynamically links libstdc++ at runtime; certs for outbound TLS.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libstdc++6 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/target/release/ClashRoyale /usr/local/bin/clashroyale-api

# main.rs opens ./database/data/mydb.duckdb relative to WORKDIR (/app), so the
# host data dir is bind-mounted here at runtime (see `make run`).
RUN mkdir -p /app/database/data

EXPOSE 3000
CMD ["clashroyale-api"]
