variable "region" {
  type        = string
  description = "AWS region to deploy resources"
  default     = "ap-southeast-1"
}

variable "frontend_bucket_name" {
  type        = string
  description = "Name of the S3 bucket for hosting frontend"
  default = ""
}

variable "lambda_name" {
  type        = string
  description = "Name of the backend Lambda function"
}

variable "lambda_handler" {
  type    = string
  default = "app.lambda_handler"
}

variable "lambda_runtime" {
  type    = string
  default = "python3.12"
}

variable "lambda_env" {
  type        = map(string)
  default     = {}
  description = "Lambda environment variables"
}

variable "api_name" {
  type        = string
  description = "Name of the API Gateway"
}

variable "api_route_key" {
  type    = string
  default = "$default"
}

variable "api_stage_name" {
  type    = string
  default = "prod"
}

variable "tags" {
  type = map(string)
  default = {
    Project = "K8sCapacityCalculator"
    Owner   = "Jereil"
  }
}
