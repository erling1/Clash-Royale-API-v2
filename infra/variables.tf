# ---------------------------------------------------------------------------
# All knobs. Real values go in terraform.tfvars (gitignored).
# Secrets (CR_API_TOKEN, QUACK_TOKEN) are NOT here — you create those in SSM
# Parameter Store by hand so they never land in tofu state. See README.
# ---------------------------------------------------------------------------

variable "aws_region" {
  type    = string
  default = "eu-north-1"
}

variable "aws_profile" {
  type        = string
  default     = "erling"
  description = "Local AWS CLI profile tofu authenticates with. Set to \"\" to use the default credential chain."
}

variable "instance_type" {
  type        = string
  default     = "t3.micro" # free tier (750h/mo) for your first 12 months
  description = "Keep this small — there is intentionally no autoscaling."
}

variable "root_volume_gb" {
  type        = number
  default     = 20 # gp3; room for docker images + the duckdb file
  description = "Root EBS volume size in GiB."
}

# --- SSH / admin access -----------------------------------------------------
# You can ALSO get a shell with zero open ports via SSM Session Manager
# (`aws ssm start-session --target <id>`), which the instance role enables.

variable "ssh_cidr" {
  type        = string
  default     = "" # e.g. "203.0.113.4/32". "" = SSH closed.
  description = "CIDR allowed to reach port 22. Leave empty to disable SSH entirely."
}

variable "ssh_public_key" {
  type        = string
  default     = ""
  description = "Public key to install for SSH. Empty = no key pair."
}

# --- Images (GitHub Container Registry) -------------------------------------

variable "ghcr_owner" {
  type    = string
  default = "erling1"
}

variable "api_image" {
  type    = string
  default = "ghcr.io/erling1/clash-royale-api-v2/api:latest"
}

variable "frontend_image" {
  type    = string
  default = "ghcr.io/erling1/clash-royale-api-v2/frontend:latest"
}

variable "pipeline_image" {
  type    = string
  default = "ghcr.io/erling1/clash-royale-api-v2/pipeline:latest"
}

# Name of an SSM SecureString holding a GHCR read:packages PAT.
# Leave "" if your GHCR packages are PUBLIC (no docker login needed).
variable "ghcr_pat_param" {
  type    = string
  default = ""
}

# --- Secret parameter names (you create the values via `aws ssm put-parameter`) ---

variable "cr_token_param" {
  type    = string
  default = "/clashroyale/cr_api_token"
}

variable "quack_token_param" {
  type    = string
  default = "/clashroyale/quack_token"
}

# --- DNS / Cloudflare (optional — leave zone_id empty to skip) ---------------

variable "domain" {
  type    = string
  default = ""
}

variable "cloudflare_zone_id" {
  type    = string
  default = ""
}

variable "cloudflare_api_token" {
  type      = string
  sensitive = true
  default   = ""
}
