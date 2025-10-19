########################################
# S3 Static Website Configuration
########################################

# Create S3 Bucket
resource "aws_s3_bucket" "this" {
  bucket        = var.bucket_name
  force_destroy = var.force_destroy
  tags          = var.tags
}

########################################
# Ownership & Public Access Configuration
########################################

# Enforce bucket owner ownership (disables ACLs)
resource "aws_s3_bucket_ownership_controls" "this" {
  bucket = aws_s3_bucket.this.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

# Block or allow public access
resource "aws_s3_bucket_public_access_block" "this" {
  bucket = aws_s3_bucket.this.id

  block_public_acls       = true
  ignore_public_acls      = true
  block_public_policy     = var.public_read ? false : true
  restrict_public_buckets = var.public_read ? false : true
}

########################################
# Enable Static Website Hosting
########################################

resource "aws_s3_bucket_website_configuration" "this" {
  bucket = aws_s3_bucket.this.bucket

  index_document {
    suffix = var.index_document
  }

  error_document {
    key = var.error_document
  }

  depends_on = [
    aws_s3_bucket_ownership_controls.this,
    aws_s3_bucket_public_access_block.this
  ]
}

########################################
# Upload Static Assets
########################################

locals {
  src_dir = var.source_dir
  files   = fileset(local.src_dir, "**")
}

resource "aws_s3_object" "assets" {
  for_each = { for f in local.files : f => f }

  bucket       = aws_s3_bucket.this.bucket
  key          = each.key
  source       = "${local.src_dir}/${each.value}"
  etag         = filemd5("${local.src_dir}/${each.value}")
content_type = lookup(
  var.content_types,
  split(".", each.value)[length(split(".", each.value)) - 1],
  "application/octet-stream"
)


  # ✅ Remove ACLs entirely — use ownership controls instead
  # acl = var.object_acl

  depends_on = [
    aws_s3_bucket_ownership_controls.this
  ]
}

########################################
# Optional Public Read Policy
########################################

resource "aws_s3_bucket_policy" "public_read" {
  count  = var.public_read ? 1 : 0
  bucket = aws_s3_bucket.this.bucket

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.this.arn}/*"
      }
    ]
  })

  depends_on = [
    aws_s3_bucket_public_access_block.this
  ]
}
