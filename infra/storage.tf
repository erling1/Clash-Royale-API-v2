resource "aws_s3_bucket" "data" {
  bucket = "clashroyale-data-erling" # must be globally unique; tweak if taken

  tags = { Name = "clashroyale-data" }
}

# Sensible defaults — block all public access unless you specifically need it.
resource "aws_s3_bucket_public_access_block" "data" {
  bucket                  = aws_s3_bucket.data.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
