# CloudWatch Log Groups

resource "aws_cloudwatch_log_group" "health_lambda" {
  name              = "/aws/lambda/petops-ai-health"
  retention_in_days = 14
  tags              = { Name = "petops-ai-health-logs" }
}

resource "aws_cloudwatch_log_group" "extract_intake_lambda" {
  name              = "/aws/lambda/petops-ai-extract-intake"
  retention_in_days = 14
  tags              = { Name = "petops-ai-extract-intake-logs" }
}

resource "aws_cloudwatch_log_group" "validate_and_flag_lambda" {
  name              = "/aws/lambda/petops-ai-validate-and-flag"
  retention_in_days = 14
  tags              = { Name = "petops-ai-validate-and-flag-logs" }
}

resource "aws_cloudwatch_log_group" "care_plan_crud_lambda" {
  name              = "/aws/lambda/petops-ai-care-plan-crud"
  retention_in_days = 14
  tags              = { Name = "petops-ai-care-plan-crud-logs" }
}
