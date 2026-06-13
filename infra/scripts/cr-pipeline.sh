#!/usr/bin/env bash
# Host pipeline orchestrator. THIS FILE IS THE SOURCE OF TRUTH.
#   - Seeded onto the box on first boot by cloud-init (file() embed).
#   - Refreshed on every deploy by .github/workflows/build-and-push.yml (SSM).
# It is deployed verbatim (not rendered by Tofu), so config below is hardcoded
# rather than templated. These are stable, non-secret values; the actual
# secrets stay in SSM and are fetched at runtime.
#
# NOTE: deliberately NOT `set -e` — we must capture the pipeline's exit code,
# write metrics, and restart the API even when the run fails.
set -uo pipefail

REGION="eu-north-1"
PIPELINE_IMAGE="ghcr.io/erling1/clash-royale-api-v2/pipeline:latest"
CR_TOKEN_PARAM="/clashroyale/cr_api_token"
QUACK_TOKEN_PARAM="/clashroyale/quack_token"

DATA_DIR=/opt/clashroyale/data
DBT_TARGET=/opt/clashroyale/dbt-target
METRICS_DIR=/opt/clashroyale/metrics
LOG_DIR=/opt/clashroyale/pipeline-logs
LOG_FILE="$LOG_DIR/pipeline.log"
mkdir -p "$DATA_DIR" "$DBT_TARGET" "$METRICS_DIR" "$LOG_DIR"

CR_API_TOKEN="$(aws ssm get-parameter --region "$REGION" --name "$CR_TOKEN_PARAM" --with-decryption --query Parameter.Value --output text)"
QUACK_TOKEN="$(aws ssm get-parameter --region "$REGION" --name "$QUACK_TOKEN_PARAM" --with-decryption --query Parameter.Value --output text)"
export CR_API_TOKEN QUACK_TOKEN

cd /opt/clashroyale
# Always bring the API back up on exit, even if the run dies partway.
trap 'docker compose start api >/dev/null 2>&1 || true' EXIT

START=$(date +%s)
echo "===== cr-pipeline start $(date -u +%FT%TZ) =====" >> "$LOG_FILE"

docker pull "$PIPELINE_IMAGE" >> "$LOG_FILE" 2>&1

# Stage 1: extract -> S3. API stays up (extract no longer touches the DB).
# AWS creds come from the instance role via IMDS; no volume mounts needed.
docker run --rm \
  -e CR_API_TOKEN -e QUACK_TOKEN \
  "$PIPELINE_IMAGE" extract >> "$LOG_FILE" 2>&1
EXTRACT_EXIT=$?

# Stage 2: rebuild mydb.duckdb from S3 — only if extract succeeded, so a failed
# extract never takes the API down or rebuilds the serving DB for nothing. API
# must be down for this stage (embedded DuckDB = single writer). dbt/target is
# mounted out so we can read run_results.json.
DBT_EXIT=0
if [ "$EXTRACT_EXIT" -eq 0 ]; then
  docker compose stop api >> "$LOG_FILE" 2>&1
  docker run --rm \
    -v "$DATA_DIR":/app/database/data \
    -v "$DBT_TARGET":/app/dbt/target \
    -e CR_API_TOKEN -e QUACK_TOKEN \
    "$PIPELINE_IMAGE" dbt >> "$LOG_FILE" 2>&1
  DBT_EXIT=$?
  docker compose start api >> "$LOG_FILE" 2>&1 || true
else
  echo "[cr-pipeline] extract failed (exit $EXTRACT_EXIT) — skipping dbt, API left up" >> "$LOG_FILE"
fi

# Overall exit: non-zero if either stage failed.
EXIT=0
[ "$EXTRACT_EXIT" -ne 0 ] && EXIT=$EXTRACT_EXIT
[ "$DBT_EXIT" -ne 0 ] && EXIT=$DBT_EXIT

END=$(date +%s)
DURATION=$(( END - START ))

SUCCESS=0; [ "$EXIT" -eq 0 ] && SUCCESS=1
DUCKDB_BYTES=0; [ -f "$DATA_DIR/mydb.duckdb" ] && DUCKDB_BYTES=$(stat -c %s "$DATA_DIR/mydb.duckdb")

# --- run-level metrics (atomic write so the textfile collector never reads a partial file) ---
TMP="$METRICS_DIR/cr_pipeline_run.prom.tmp"
{
  echo "# HELP cr_pipeline_success Last pipeline run succeeded (1) or failed (0)."
  echo "# TYPE cr_pipeline_success gauge"
  echo "cr_pipeline_success $SUCCESS"
  echo "# HELP cr_pipeline_exit_code Exit code of the last pipeline container."
  echo "# TYPE cr_pipeline_exit_code gauge"
  echo "cr_pipeline_exit_code $EXIT"
  echo "# HELP cr_pipeline_duration_seconds Wall-clock duration of the last run."
  echo "# TYPE cr_pipeline_duration_seconds gauge"
  echo "cr_pipeline_duration_seconds $DURATION"
  echo "# HELP cr_pipeline_start_timestamp_seconds Start time of the last run."
  echo "# TYPE cr_pipeline_start_timestamp_seconds gauge"
  echo "cr_pipeline_start_timestamp_seconds $START"
  echo "# HELP cr_pipeline_end_timestamp_seconds End time of the last run."
  echo "# TYPE cr_pipeline_end_timestamp_seconds gauge"
  echo "cr_pipeline_end_timestamp_seconds $END"
  echo "# HELP cr_pipeline_duckdb_bytes Size of mydb.duckdb after the run."
  echo "# TYPE cr_pipeline_duckdb_bytes gauge"
  echo "cr_pipeline_duckdb_bytes $DUCKDB_BYTES"
} > "$TMP"
mv "$TMP" "$METRICS_DIR/cr_pipeline_run.prom"

# --- last-success marker: only rewritten on success, so it retains the
#     last good timestamp after a failure (enables staleness alerts) ---
if [ "$SUCCESS" -eq 1 ]; then
  TMP2="$METRICS_DIR/cr_pipeline_success.prom.tmp"
  {
    echo "# HELP cr_pipeline_last_success_timestamp_seconds End time of the last SUCCESSFUL run."
    echo "# TYPE cr_pipeline_last_success_timestamp_seconds gauge"
    echo "cr_pipeline_last_success_timestamp_seconds $END"
  } > "$TMP2"
  mv "$TMP2" "$METRICS_DIR/cr_pipeline_success.prom"
fi

# --- dbt model metrics from run_results.json (best-effort) ---
if [ -f "$DBT_TARGET/run_results.json" ]; then
  python3 /usr/local/bin/cr-dbt-metrics.py \
    "$DBT_TARGET/run_results.json" "$METRICS_DIR/cr_pipeline_dbt.prom" || true
fi

echo "[$(date -u +%FT%TZ)] cr-pipeline finished exit=$EXIT duration=${DURATION}s success=$SUCCESS db_bytes=$DUCKDB_BYTES" >> "$LOG_FILE"
exit "$EXIT"
