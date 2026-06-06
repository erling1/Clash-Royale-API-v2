provider "aws" {
  region = var.aws_region

  # Authenticate as the `erling` IAM admin, not root. Set var.aws_profile = ""
  # to fall back to the default credential chain (env vars / instance role / CI).
  profile = var.aws_profile != "" ? var.aws_profile : null

  # Applied to every taggable resource — makes the bill easy to read.
  default_tags {
    tags = {
      Project   = "ClashRoyale"
      ManagedBy = "OpenTofu"
    }
  }
}

# The token is only actually used if you create the DNS record (see dns.tf).
# Leaving var.cloudflare_api_token empty is fine until then.
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}
