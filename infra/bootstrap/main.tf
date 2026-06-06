# ---------------------------------------------------------------------------
# Bootstrap: creates the S3 bucket that holds the *main* config's remote state.
#
# Chicken-and-egg: the main config's `backend "s3"` needs this bucket to exist
# before `tofu init`. So this tiny config runs ONCE with LOCAL state.
#
#   cd infra/bootstrap
#   tofu init
#   tofu apply
#
# Then copy the bucket name into infra/versions.tf's backend block.
# You normally never touch this folder again.
# ---------------------------------------------------------------------------

terraform {
  required_version = ">= 1.10.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "aws_region" {
  type    = string
  default = "eu-north-1" # Stockholm — one of the cheapest EU regions
}

variable "state_bucket_name" {
  type        = string
  description = "Globally-unique name for the OpenTofu state bucket."
  # e.g. "clashroyale-tfstate-erling1"
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project   = "ClashRoyale"
      ManagedBy = "OpenTofu"
      Purpose   = "tf-state"
    }
  }
}

resource "aws_s3_bucket" "state" {
  bucket = var.state_bucket_name
}

# Versioning lets you recover a clobbered state file.
resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# State must never be public.
resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "state_bucket" {
  value = aws_s3_bucket.state.id
}
