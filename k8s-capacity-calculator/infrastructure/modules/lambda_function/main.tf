// Module: lambda_function
// Package local folder into a zip
data "archive_file" "lambda_zip" {
type = "zip"
output_path = "${path.module}/lambda_package/${var.lambda_name}.zip"
source_dir = var.source_dir
}


resource "aws_iam_role" "lambda_exec" {
name = "${var.lambda_name}-exec-${var.environment}"
assume_role_policy = jsonencode({
Version = "2012-10-17",
Statement = [{
Action = "sts:AssumeRole",
Effect = "Allow",
Principal = { Service = "lambda.amazonaws.com" }
}]
})
}


resource "aws_iam_role_policy_attachment" "basic" {
role = aws_iam_role.lambda_exec.name
policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}


resource "aws_lambda_function" "this" {
function_name = var.lambda_name
filename = data.archive_file.lambda_zip.output_path
source_code_hash = data.archive_file.lambda_zip.output_base64sha256


handler = var.handler
runtime = var.runtime
role = aws_iam_role.lambda_exec.arn


memory_size = var.memory_size
timeout = var.timeout


environment {
variables = var.environment_variables
}


tags = var.tags
}


resource "aws_lambda_permission" "apigw_invoke" {
count = var.allow_api_gateway ? 1 : 0
statement_id = "AllowAPIGatewayInvoke-${var.lambda_name}"
action = "lambda:InvokeFunction"
function_name = aws_lambda_function.this.function_name
principal = "apigateway.amazonaws.com"
}