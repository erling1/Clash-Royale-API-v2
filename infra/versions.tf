terraform {
  required_version = ">= 1.10.0"

  # Remote state in S3 with NATIVE locking (OpenTofu >= 1.10 / Terraform >= 1.10).
  # `use_lockfile = true` replaces the old DynamoDB lock table — nothing extra to run.
  #
  # NOTE: backend blocks can't use variables. Edit `bucket` + `region` to match
  # what infra/bootstrap created, then `tofu init`.
  backend "s3" {
    bucket       = "clashroyale-tfstate-erling1"
    key          = "infra/terraform.tfstate"
    region       = "eu-north-1"
    encrypt      = true
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}
