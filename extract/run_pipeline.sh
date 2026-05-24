#!/usr/bin/env bash
# Daily pipeline: extract parquets from Clash Royale API, then refresh dbt models.
# Safe for cron: locates project root from this script's path, doesn't assume CWD.

set -euo pipefail

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

echo "[$(ts)] pipeline start"

echo "[$(ts)] extract begin"
uv run python extract/extract.py
echo "[$(ts)] extract done"

echo "[$(ts)] dbt run begin"
cd dbt
uv run dbt run
echo "[$(ts)] dbt run done"

echo "[$(ts)] pipeline complete"
