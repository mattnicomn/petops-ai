# CloudWatch Log Groups

resource "aws_cloudwatch_log_group" "health_lambda" {
  name              = "/aws/lambda/petops-ai-health"
  retention_in_days = 14

  tags = {
    Name = "petops-ai-health-logs"
  }
}
