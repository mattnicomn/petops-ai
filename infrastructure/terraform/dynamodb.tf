# DynamoDB table for care plan storage

resource "aws_dynamodb_table" "care_plans" {
  name         = "petops-ai-care-plans"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "createdAt"
    type = "S"
  }

  global_secondary_index {
    name            = "createdAt-index"
    hash_key        = "status"
    range_key       = "createdAt"
    projection_type = "INCLUDE"
    non_key_attributes = ["petName", "serviceType"]
  }

  tags = {
    Name = "petops-ai-care-plans"
  }
}
