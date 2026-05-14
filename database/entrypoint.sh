#!/bin/sh
set -eu

if [ -z "${QUACK_TOKEN:-}" ]; then
    echo "FATAL: QUACK_TOKEN environment variable is required" >&2
    exit 1
fi

# DuckDB's REPL exits on stdin EOF, which would kill the quack_serve
# background thread. Use a FIFO with a held-open writer (fd 3) so reads
# from stdin never see EOF — the server stays up regardless of TTY flags.
FIFO=/tmp/duckdb_stdin
[ -p "$FIFO" ] || mkfifo "$FIFO"
exec 3<>"$FIFO"

exec duckdb -unsigned /data/mydb.duckdb -init /start.sql <"$FIFO"
