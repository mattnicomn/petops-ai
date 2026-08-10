# API Gateway HTTP API

resource "aws_apigatewayv2_api" "main" {
  name          = "petops-ai-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["https://petops-ai.usmissionhero.com"]
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["Content-Type", "X-Correlation-Id"]
    max_age       = 3600
  }

  tags = {
    Name = "petops-ai-api"
  }
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.main.id
  name        = "$default"
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = 10
    throttling_rate_limit  = 5
  }

  tags = {
    Name = "petops-ai-api-default-stage"
  }
}

# Health route
resource "aws_apigatewayv2_integration" "health" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.health.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "health" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/health"
  target    = "integrations/${aws_apigatewayv2_integration.health.id}"
}

resource "aws_lambda_permission" "health_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.health.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Extract Intake route
resource "aws_apigatewayv2_integration" "extract_intake" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.extract_intake.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "extract_intake" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/extract"
  target    = "integrations/${aws_apigatewayv2_integration.extract_intake.id}"
}

resource "aws_lambda_permission" "extract_intake_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.extract_intake.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Validate and Flag route
resource "aws_apigatewayv2_integration" "validate_and_flag" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.validate_and_flag.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "validate_and_flag" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/validate-and-flag"
  target    = "integrations/${aws_apigatewayv2_integration.validate_and_flag.id}"
}

resource "aws_lambda_permission" "validate_and_flag_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.validate_and_flag.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}

# Care Plan CRUD routes
resource "aws_apigatewayv2_integration" "care_plan_crud" {
  api_id                 = aws_apigatewayv2_api.main.id
  integration_type       = "AWS_PROXY"
  integration_uri        = aws_lambda_function.care_plan_crud.invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "care_plan_create" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "POST /api/care-plans"
  target    = "integrations/${aws_apigatewayv2_integration.care_plan_crud.id}"
}

resource "aws_apigatewayv2_route" "care_plan_list" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/care-plans"
  target    = "integrations/${aws_apigatewayv2_integration.care_plan_crud.id}"
}

resource "aws_apigatewayv2_route" "care_plan_get" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "GET /api/care-plans/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.care_plan_crud.id}"
}

resource "aws_lambda_permission" "care_plan_crud_apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.care_plan_crud.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
