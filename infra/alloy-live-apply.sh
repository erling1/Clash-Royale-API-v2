#!/usr/bin/env bash
# Non-destructive live rollout of the alloy observability agent + caddy access
# logging onto the running box. Mirrors what cloud-init/templates bakes for
# future rebuilds, but applied without -replace (preserves the DuckDB).
#   - base docker-compose.yml is NOT modified (keeps resolved image tags);
#     additions go in docker-compose.override.yml which compose auto-merges.
#   - Caddyfile is validated in a throwaway container BEFORE being swapped in.
set -euo pipefail
REGION=eu-north-1
cd /opt/clashroyale
ts=$(date +%Y%m%d-%H%M%S)

echo ">>> backup"
cp -a Caddyfile "Caddyfile.bak.$ts"
[ -f docker-compose.override.yml ] && cp -a docker-compose.override.yml "docker-compose.override.yml.bak.$ts" || true

echo ">>> write alloy config"
mkdir -p alloy
cat > alloy/config.alloy <<'ALLOY'
// Credentials from /opt/clashroyale/alloy.env (written below from SSM).
prometheus.remote_write "grafanacloud" {
  endpoint {
    url = sys.env("GRAFANA_PROM_URL")
    basic_auth {
      username = sys.env("GRAFANA_PROM_USER")
      password = sys.env("GRAFANA_TOKEN")
    }
  }
}

loki.write "grafanacloud" {
  endpoint {
    url = sys.env("GRAFANA_LOKI_URL")
    basic_auth {
      username = sys.env("GRAFANA_LOKI_USER")
      password = sys.env("GRAFANA_TOKEN")
    }
  }
}

prometheus.exporter.unix "host" {
  rootfs_path = "/rootfs"
  procfs_path = "/host/proc"
  sysfs_path  = "/host/sys"
}

prometheus.scrape "host" {
  targets         = prometheus.exporter.unix.host.targets
  job_name        = "node"
  forward_to      = [prometheus.remote_write.grafanacloud.receiver]
  scrape_interval = "60s"
}

prometheus.scrape "api" {
  targets         = [{ "__address__" = "api:3000" }]
  job_name        = "clashroyale-api"
  metrics_path    = "/metrics"
  forward_to      = [prometheus.remote_write.grafanacloud.receiver]
  scrape_interval = "30s"
}

local.file_match "caddy" {
  path_targets = [{ "__path__" = "/var/log/caddy/access.log" }]
}

loki.source.file "caddy" {
  targets    = local.file_match.caddy.targets
  forward_to = [loki.process.caddy.receiver]
}

loki.process "caddy" {
  forward_to = [loki.write.grafanacloud.receiver]
  stage.static_labels {
    values = { job = "caddy", host = "clashroyale" }
  }
}
ALLOY

echo ">>> write alloy.env from SSM"
get() { aws ssm get-parameter --region "$REGION" --name "$1" --with-decryption --query Parameter.Value --output text; }
umask 077
cat > alloy.env <<EOF
GRAFANA_PROM_URL=$(get /clashroyale/grafana_prom_url)
GRAFANA_PROM_USER=$(get /clashroyale/grafana_prom_user)
GRAFANA_LOKI_URL=$(get /clashroyale/grafana_loki_url)
GRAFANA_LOKI_USER=$(get /clashroyale/grafana_loki_user)
GRAFANA_TOKEN=$(get /clashroyale/grafana_token)
EOF
umask 022

echo ">>> write compose override"
cat > docker-compose.override.yml <<'OVR'
services:
  caddy:
    volumes:
      - caddy_logs:/var/log/caddy
  alloy:
    image: grafana/alloy:latest
    restart: unless-stopped
    command:
      - run
      - /etc/alloy/config.alloy
      - --storage.path=/var/lib/alloy/data
    env_file:
      - /opt/clashroyale/alloy.env
    pid: host
    mem_limit: 256m
    volumes:
      - /opt/clashroyale/alloy/config.alloy:/etc/alloy/config.alloy:ro
      - alloy_data:/var/lib/alloy/data
      - caddy_logs:/var/log/caddy:ro
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
volumes:
  caddy_logs:
  alloy_data:
OVR

echo ">>> build + validate candidate Caddyfile"
if grep -q '/var/log/caddy/access.log' Caddyfile; then
  echo "    Caddyfile already has log block; leaving as-is"
else
  cat > Caddyfile.new <<'CADDY'
clashroyaleanalytics.com {
    tls internal
    log {
        output file /var/log/caddy/access.log {
            roll_size 10MiB
            roll_keep 3
        }
        format json
    }
    reverse_proxy frontend:3001
}
CADDY
  docker run --rm -v /opt/clashroyale/Caddyfile.new:/etc/caddy/Caddyfile:ro caddy:2-alpine \
    caddy validate --adapter caddyfile --config /etc/caddy/Caddyfile
  mv Caddyfile.new Caddyfile
  echo "    Caddyfile validated + swapped in"
fi

echo ">>> validate merged compose"
docker compose config >/dev/null

echo ">>> pull alloy image"
docker pull grafana/alloy:latest

echo ">>> apply (recreates caddy + creates alloy; frontend/api untouched)"
docker compose up -d

echo ">>> status"
sleep 6
docker compose ps
echo "--- alloy logs (tail) ---"
docker compose logs --tail 30 alloy 2>&1 || true
