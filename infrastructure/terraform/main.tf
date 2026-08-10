provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = ["253881689673"]

  default_tags {
    tags = {
      Project     = "PetOpsAI"
      Application = "PetOpsAI"
      Environment = "hackathon"
      ManagedBy   = "Terraform"
      Repository  = "petops-ai"
      Owner       = "usmissionhero"
    }
  }
}

# Defense-in-depth: explicit account verification
data "aws_caller_identity" "current" {}

resource "null_resource" "account_safeguard" {
  lifecycle {
    precondition {
      condition     = data.aws_caller_identity.current.account_id == "253881689673"
      error_message = "DEPLOYMENT BLOCKED: Active AWS identity is account ${data.aws_caller_identity.current.account_id}, expected 253881689673."
    }
  }
}
