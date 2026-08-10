# IAM roles for Lambda functions — least privilege

# Health Lambda role (logs only)
resource "aws_iam_role" "health_lambda" {
  name = "petops-ai-health-lambda"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name = "petops-ai-health-lambda-role"
  }
}

resource "aws_iam_role_policy" "health_lambda_logs" {
  name = "cloudwatch-logs"
  role = aws_iam_role.health_lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "${aws_cloudwatch_log_group.health_lambda.arn}:*"
      }
    ]
  })
}
