output "frontend_bucket" {
  value = module.frontend_site.bucket_name
}

output "frontend_url" {
  value = module.frontend_site.website_endpoint
}

output "lambda_function_arn" {
  value = module.backend_lambda.lambda_function_arn
}

output "api_endpoint" {
  value = module.api.api_endpoint
}
