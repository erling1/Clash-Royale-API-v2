# ClashRoyale infra (OpenTofu)

One cheap, fixed-cost EC2 box runs the whole app as Docker images. No
autoscaling, no load balancer, no serverless — a traffic spike overwhelms the
single box (it falls over) instead of silently scaling your bill.

```
Cloudflare (free TLS + cache) -> Elastic IP -> t3.micro (Docker only)
                                               ├─ caddy    :80/:443  (TLS, reverse proxy)
                                               ├─ frontend :3001     (public via caddy)
                                               └─ api      :3000     (internal only)
                                               bind-mount: /opt/clashroyale/data
                                                           = mydb.duckdb on disk
Daily cron (systemd timer):
   docker compose stop api
   docker run --rm  pipeline-image   (extract.py + dbt run -> writes mydb.duckdb)
   docker compose start api
```

Three images, all from GHCR, built by `.github/workflows/build-and-push.yml`:
`api`, `frontend`, `pipeline`. The VM only runs `docker` — no git/uv/python on it.
Secrets live in **SSM Parameter Store** (free); tofu state lives in **S3**.

**Cost:** ~$0 for your first 12 months (t3.micro free tier), then ~$6–8/mo
instance + ~$2/mo disk. Egress free to 100 GB/mo.

## One-time setup

### 1. State bucket (local-state bootstrap)
```bash
cd infra/bootstrap
tofu init
tofu apply -var 'state_bucket_name=clashroyale-tfstate-erling1'
```
Put that bucket name + region into `infra/versions.tf` (the `backend "s3"` block).

### 2. Store secrets in SSM (so they never enter tofu state or git)
```bash
aws ssm put-parameter --region eu-north-1 --type SecureString \
  --name /clashroyale/cr_api_token --value 'eyJ...your CR token...'
aws ssm put-parameter --region eu-north-1 --type SecureString \
  --name /clashroyale/quack_token  --value 'eyJ...your QUACK token...'
# Only if your GHCR packages are private:
# aws ssm put-parameter --region eu-north-1 --type SecureString \
#   --name /clashroyale/ghcr_pat --value 'github_pat_...'
```

### 3. Build & push the images
Push to `main` (or run the **build-and-push** workflow). Make the three GHCR
packages **public** (package settings on GitHub) so the VM can pull without a PAT.

### 4. Apply
```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # edit
tofu init
tofu apply
```

### 5. Whitelist the Elastic IP for your Clash Royale token  ⚠️ REQUIRED
The CR API token is locked to whatever IP it was minted for. The pipeline now
calls Supercell from the VM's Elastic IP, so:
```bash
tofu output -raw public_ip      # the IP to whitelist
```
Go to https://developer.clashroyale.com → your key → add that IP (or make a new
key for it) and update `/clashroyale/cr_api_token` in SSM if the token changed.
Then re-run the pipeline once:
```bash
aws ssm start-session --target $(tofu output -raw instance_id)
sudo /usr/local/bin/cr-pipeline.sh
```

## Cloudflare
Set `domain`, `cloudflare_zone_id`, `cloudflare_api_token` in tfvars and apply —
tofu creates a proxied A record to the Elastic IP. Set the zone's SSL mode to
**Full**. Without these vars the app is reachable at `http://<public_ip>`.

## Operating it
```bash
aws ssm start-session --target $(tofu output -raw instance_id)   # shell, no SSH
cd /opt/clashroyale && sudo docker compose ps            # service status
sudo /usr/local/bin/cr-pipeline.sh                       # refresh data now
systemctl list-timers cr-pipeline.timer                  # next scheduled run
```

## Tear down
```bash
cd infra && tofu destroy
cd bootstrap && tofu destroy   # state bucket is separate
```
