# Lambda functions

# Health
data "archive_file" "health_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../packages/backend/dist/health"
  output_path = "${path.module}/dist/health.zip"
}

resource "aws_lambda_function" "health" {
  function_name    = "petops-ai-health"
  role             = aws_iam_role.health_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 5
  memory_size      = 128
  filename         = data.archive_file.health_lambda.output_path
  source_code_hash = data.archive_file.health_lambda.output_base64sha256

  environment {
    variables = {
      NODE_OPTIONS = "--enable-source-maps"
    }
  }

  tags = {
    Name = "petops-ai-health"
  }
}

# Extract Intake
data "archive_file" "extract_intake_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../packages/backend/dist/extract-intake"
  output_path = "${path.module}/dist/extract-intake.zip"
}

resource "aws_lambda_function" "extract_intake" {
  function_name    = "petops-ai-extract-intake"
  role             = aws_iam_role.extract_intake_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 30
  memory_size      = 256
  filename         = data.archive_file.extract_intake_lambda.output_path
  source_code_hash = data.archive_file.extract_intake_lambda.output_base64sha256

  environment {
    variables = {
      NODE_OPTIONS = "--enable-source-maps"
    }
  }

  tags = {
    Name = "petops-ai-extract-intake"
  }
}

# Validate and Flag
data "archive_file" "validate_and_flag_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../packages/backend/dist/validate-and-flag"
  output_path = "${path.module}/dist/validate-and-flag.zip"
}

resource "aws_lambda_function" "validate_and_flag" {
  function_name    = "petops-ai-validate-and-flag"
  role             = aws_iam_role.validate_and_flag_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256
  filename         = data.archive_file.validate_and_flag_lambda.output_path
  source_code_hash = data.archive_file.validate_and_flag_lambda.output_base64sha256

  environment {
    variables = {
      NODE_OPTIONS = "--enable-source-maps"
    }
  }

  tags = {
    Name = "petops-ai-validate-and-flag"
  }
}

# Care Plan CRUD
data "archive_file" "care_plan_crud_lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../packages/backend/dist/care-plan-crud"
  output_path = "${path.module}/dist/care-plan-crud.zip"
}

resource "aws_lambda_function" "care_plan_crud" {
  function_name    = "petops-ai-care-plan-crud"
  role             = aws_iam_role.care_plan_crud_lambda.arn
  handler          = "index.handler"
  runtime          = "nodejs20.x"
  timeout          = 10
  memory_size      = 256
  filename         = data.archive_file.care_plan_crud_lambda.output_path
  source_code_hash = data.archive_file.care_plan_crud_lambda.output_base64sha256

  environment {
    variables = {
      NODE_OPTIONS = "--enable-source-maps"
      TABLE_NAME   = aws_dynamodb_table.care_plans.name
    }
  }

  tags = {
    Name = "petops-ai-care-plan-crud"
  }
}
