########################################
# S3 Static Site Variables
########################################

variable "bucket_name" {
  type        = string
  description = "Name of the S3 bucket for the static site"
}

variable "source_dir" {
  type        = string
  description = "Local source directory containing website files"
}

variable "index_document" {
  type        = string
  description = "Index document for the S3 website"
  default     = "index.html"
}

variable "error_document" {
  type        = string
  description = "Error document for the S3 website"
  default     = "index.html"
}

variable "force_destroy" {
  type        = bool
  description = "Whether to force destroy the bucket even if not empty"
  default     = false
}

variable "public_read" {
  type        = bool
  description = "Enable or disable public read access for website objects"
  default     = true
}

variable "tags" {
  type        = map(string)
  description = "Common tags applied to all resources"
  default     = {}
}

variable "content_types" {
  type        = map(string)
  description = "Mapping of file extensions to MIME content types"
  default = {
    html = "text/html"
    css  = "text/css"
    js   = "application/javascript"
    json = "application/json"
    png  = "image/png"
    jpg  = "image/jpeg"
    jpeg = "image/jpeg"
    svg  = "image/svg+xml"
  }
}

# (Optional legacy vars — safe to remove later)
variable "acl" {
  type        = string
  description = "Deprecated: bucket ACL (ignored if ownership controls enabled)"
  default     = "private"
}

variable "object_acl" {
  type        = string
  description = "Deprecated: object ACL (ignored if ownership controls enabled)"
  default     = "public-read"
}
