# IAM roles for Lambda functions — least privilege

locals {
  lambda_assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Health Lambda role (logs only)
resource "aws_iam_role" "health_lambda" {
  name               = "petops-ai-health-lambda"
  assume_role_policy = local.lambda_assume_role_policy
  tags               = { Name = "petops-ai-health-lambda-role" }
}

resource "aws_iam_role_policy" "health_lambda_logs" {
  name = "cloudwatch-logs"
  role = aws_iam_role.health_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogStream", "logs:PutLogEvents"]
      Resource = "${aws_cloudwatch_log_group.health_lambda.arn}:*"
    }]
  })
}

# Extract Intake Lambda role (Bedrock + logs)
resource "aws_iam_role" "extract_intake_lambda" {
  name               = "petops-ai-extract-intake-lambda"
  assume_role_policy = local.lambda_assume_role_policy
  tags               = { Name = "petops-ai-extract-intake-lambda-role" }
}

resource "aws_iam_role_policy" "extract_intake_lambda_policy" {
  name = "bedrock-and-logs"
  role = aws_iam_role.extract_intake_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:us-east-1:253881689673:log-group:/aws/lambda/petops-ai-extract-intake:*"
      },
      {
        Effect = "Allow"
        Action = ["bedrock:InvokeModel"]
        Resource = [
          "arn:aws:bedrock:us-east-1:253881689673:inference-profile/us.anthropic.claude-haiku-4-5-20251001-v1:0",
          "arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0"
        ]
      }
    ]
  })
}

# Validate and Flag Lambda role (logs only)
resource "aws_iam_role" "validate_and_flag_lambda" {
  name               = "petops-ai-validate-and-flag-lambda"
  assume_role_policy = local.lambda_assume_role_policy
  tags               = { Name = "petops-ai-validate-and-flag-lambda-role" }
}

resource "aws_iam_role_policy" "validate_and_flag_lambda_policy" {
  name = "cloudwatch-logs"
  role = aws_iam_role.validate_and_flag_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
      Resource = "arn:aws:logs:us-east-1:253881689673:log-group:/aws/lambda/petops-ai-validate-and-flag:*"
    }]
  })
}

# Care Plan CRUD Lambda role (DynamoDB + logs)
resource "aws_iam_role" "care_plan_crud_lambda" {
  name               = "petops-ai-care-plan-crud-lambda"
  assume_role_policy = local.lambda_assume_role_policy
  tags               = { Name = "petops-ai-care-plan-crud-lambda-role" }
}

resource "aws_iam_role_policy" "care_plan_crud_lambda_policy" {
  name = "dynamodb-and-logs"
  role = aws_iam_role.care_plan_crud_lambda.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:us-east-1:253881689673:log-group:/aws/lambda/petops-ai-care-plan-crud:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.care_plans.arn,
          "${aws_dynamodb_table.care_plans.arn}/index/*"
        ]
      }
    ]
  })
}
