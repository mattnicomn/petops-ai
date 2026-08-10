# Lambda functions

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
