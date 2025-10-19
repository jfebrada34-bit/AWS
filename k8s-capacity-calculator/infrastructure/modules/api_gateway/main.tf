// Module: api_gateway (HTTP API v2)
resource "aws_apigatewayv2_api" "http_api" {
name = var.api_name
protocol_type = "HTTP"
}


resource "aws_apigatewayv2_integration" "lambda_integration" {
api_id = aws_apigatewayv2_api.http_api.id
integration_type = "AWS_PROXY"
integration_uri = var.lambda_arn
integration_method = "POST"
payload_format_version = "2.0"
}


resource "aws_apigatewayv2_route" "all" {
api_id = aws_apigatewayv2_api.http_api.id
route_key = var.route_key
target = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}


resource "aws_apigatewayv2_stage" "default" {
api_id = aws_apigatewayv2_api.http_api.id
name = var.stage_name
auto_deploy = true
}


// Create permission for apigateway to invoke lambda (if not created in lambda module)
resource "aws_lambda_permission" "allow_apigw" {
statement_id = "AllowExecutionFromAPIGateway-${var.api_name}"
action = "lambda:InvokeFunction"
function_name = var.lambda_name
principal = "apigateway.amazonaws.com"
depends_on = [aws_apigatewayv2_integration.lambda_integration]
}


output "api_endpoint" {
value = aws_apigatewayv2_api.http_api.api_endpoint
}