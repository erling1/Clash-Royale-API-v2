#!/usr/bin/env bash
# Daily pipeline, split into stages so the orchestrator can keep the API up
# during extract (which only writes to S3) and stop it only for the dbt build
# (embedded DuckDB is single-writer, so the API must release the file).
#
#   run_pipeline.sh extract   # CR API -> parquet in S3        (API may stay up)
#   run_pipeline.sh dbt       # build mydb.duckdb from S3      (API must be down)
#   run_pipeline.sh all       # extract then dbt, in order     (default; local dev)
#
# Safe for cron: locates project root from this script's path, doesn't assume CWD.

set -euo pipefail

STAGE="${1:-all}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOCK_FILE="/tmp/clashroyale-pipeline.lock"

cd "$PROJECT_ROOT"

# load env (CR_API_TOKEN, QUACK_TOKEN, ...) when run outside direnv (e.g. cron)
if [ -f ".envrc" ]; then
    set -a
    # shellcheck disable=SC1091
    source .envrc
    set +a
fi

# prevent overlapping runs if a job runs long
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
    echo "[$(date -u +%FT%TZ)] another pipeline run is in progress, aborting" >&2
    exit 1
fi

ts() { date -u +%FT%TZ; }

run_extract() {
    echo "[$(ts)] extract begin"
    uv run python extract/extract.py
    echo "[$(ts)] extract done"
}

run_dbt() {
    echo "[$(ts)] dbt run begin"
    ( cd dbt && uv run dbt run )
    echo "[$(ts)] dbt run done"
}

echo "[$(ts)] pipeline start (stage=$STAGE)"

case "$STAGE" in
    extract) run_extract ;;
    dbt)     run_dbt ;;
    all)     run_extract; run_dbt ;;
    *)
        echo "[$(ts)] unknown stage '$STAGE' (use: extract | dbt | all)" >&2
        exit 2
        ;;
esac

echo "[$(ts)] pipeline complete (stage=$STAGE)"
