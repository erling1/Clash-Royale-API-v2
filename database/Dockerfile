FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl unzip ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# Grab the DuckDB CLI matching the build platform (amd64 or arm64).
RUN ARCH=$(dpkg --print-architecture) && \
    case "$ARCH" in \
      amd64) DUCK_ARCH=amd64 ;; \
      arm64) DUCK_ARCH=arm64 ;; \
      *) echo "Unsupported arch: $ARCH" >&2; exit 1 ;; \
    esac && \
    curl -fL -o /tmp/duckdb.zip \
      "https://github.com/duckdb/duckdb/releases/download/v1.5.2/duckdb_cli-linux-${DUCK_ARCH}.zip" && \
    unzip /tmp/duckdb.zip -d /usr/local/bin/ && \
    rm /tmp/duckdb.zip && chmod +x /usr/local/bin/duckdb

# Pre-install the extension so we don't hit the network at boot.
RUN duckdb -unsigned -c "FORCE INSTALL quack FROM core_nightly;"

COPY start.sql /start.sql
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p /data

VOLUME ["/data"]
EXPOSE 4213
ENTRYPOINT ["/entrypoint.sh"]
