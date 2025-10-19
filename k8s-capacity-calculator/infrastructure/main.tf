# -----------------------------------------------------------------------------
# FRONTEND - S3 Static Website Hosting
# -----------------------------------------------------------------------------
module "frontend_site" {
  source         = "./modules/s3_static_site"
  bucket_name    = var.frontend_bucket_name
  source_dir     = "${path.root}/../frontend"
  index_document = "index.html"
  error_document = "index.html"
  public_read    = true
  force_destroy  = true
  tags           = var.tags
}

# -----------------------------------------------------------------------------
# BACKEND - Lambda Function
# -----------------------------------------------------------------------------
module "backend_lambda" {
  source                = "./modules/lambda_function"
  lambda_name           = var.lambda_name
  source_dir            = "${path.root}/../backend"
  handler               = var.lambda_handler
  runtime               = var.lambda_runtime
  environment_variables = var.lambda_env
  tags                  = var.tags
}

# -----------------------------------------------------------------------------
# API GATEWAY - Connects to Lambda
# -----------------------------------------------------------------------------
module "api" {
  source      = "./modules/api_gateway"
  api_name    = var.api_name
  lambda_arn  = module.backend_lambda.lambda_function_arn
  lambda_name = module.backend_lambda.lambda_function_name
  route_key   = var.api_route_key
  stage_name  = var.api_stage_name
}
