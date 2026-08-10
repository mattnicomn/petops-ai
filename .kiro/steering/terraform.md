---
inclusion: fileMatch
fileMatchPattern: "**/*.tf"
---

# Terraform Standards

## Deployment Account Safeguard

Every Terraform configuration MUST include defense-in-depth account protection:

**Layer 1: Provider-level restriction**
```hcl
provider "aws" {
  region              = "us-east-1"
  allowed_account_ids = ["253881689673"]

  default_tags {
    tags = { ... }
  }
}
```

**Layer 2: Explicit caller-identity precondition**
```hcl
data "aws_caller_identity" "current" {}

resource "null_resource" "account_check" {
  lifecycle {
    precondition {
      condition     = data.aws_caller_identity.current.account_id == "253881689673"
      error_message = "Deployment target must be AWS account 253881689673. Current: ${data.aws_caller_identity.current.account_id}"
    }
  }
}
```

Both layers ensure deployment fails immediately if the wrong AWS profile/account is active, regardless of how Terraform is invoked.

## Region

Primary region: `us-east-1`
- Bedrock model availability confirmed (Claude Haiku 4.5, inference profiles)
- Route 53 hosted zone for usmissionhero.com exists in this account
- ACM certificates for CloudFront must be in us-east-1
- Keeps all resources in one region for simplicity

## State Isolation

PetOps AI Terraform state MUST be completely isolated from other projects:
- State backend: S3 bucket with a unique key specifically for PetOps AI
- State key: `petops-ai/terraform.tfstate`
- Lock table: Shared DynamoDB lock table is acceptable IF using a unique state key
- Do NOT reuse Togs & Dogs state bucket without unique key isolation
- Do NOT import or reference resources from other project state files
- Recommended: dedicated state bucket `petops-ai-terraform-state-253881689673` if creating new

## Tagging Standard

All taggable resources MUST receive the following baseline tags via AWS provider `default_tags`:

```hcl
provider "aws" {
  region = "us-east-1"

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
```

These tags align with already-activated cost allocation tags in the billing account:
- `Project` — Active (UserDefined)
- `Application` — Active (UserDefined)
- `Environment` — Active (UserDefined)
- `ManagedBy` — Active (UserDefined)

Additional tags NOT included (evaluated and excluded for simplicity):
- `Company` — already activated but redundant with Owner
- `CostCenter` — already activated; add only if needed for billing separation
- `Hackathon` — not activated; would not provide Cost Explorer value without activation

## AWS Budget

Include an AWS Budget resource in Terraform:

```hcl
resource "aws_budgets_budget" "petops_ai" {
  name         = "petops-ai-monthly"
  budget_type  = "COST"
  limit_amount = "10"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  cost_filter {
    name   = "TagKeyValue"
    values = ["user:Project$PetOpsAI"]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 50
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 80
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
  }

  notification {
    comparison_operator       = "GREATER_THAN"
    threshold                 = 100
    threshold_type            = "PERCENTAGE"
    notification_type         = "ACTUAL"
    subscriber_email_addresses = [var.budget_alert_email]
  }
}
```

Note: Budget alert email must be provided via variable, not hardcoded.

## Cost Allocation Tags — Manual Prerequisite

Resource tagging (applied by Terraform) and cost-allocation-tag activation (billing/payer account setting) are separate concerns:
- `Project`, `Application`, `Environment`, `ManagedBy` are already activated as UserDefined cost allocation tags
- Terraform resource tags alone do NOT guarantee Cost Explorer allocation visibility
- If a new tag (e.g., `Hackathon`) is needed in Cost Explorer, it must be activated at the payer/billing level — this is outside Terraform's boundary

## Structure

- Single environment (hackathon) — no complex workspace strategy.
- Directory: `infrastructure/terraform/`
- Organize by concern: `main.tf`, `variables.tf`, `outputs.tf`, plus resource-specific files.

## Naming

- Resource names: `petops-ai-{resource-purpose}` (e.g., `petops-ai-care-plans-table`)
- Variable names: snake_case
- Output names: snake_case

## Security

- No hardcoded credentials in .tf files.
- Use variables or SSM parameters for sensitive values.
- Lambda roles scoped to minimum required permissions per function.
- API Gateway CORS restricted to CloudFront domain.
- API Gateway throttling configured for cost protection.

## Cost Awareness

- DynamoDB: on-demand capacity mode only.
- Lambda: 256MB memory, 30s timeout for extraction, 10s for other functions.
- CloudWatch: 14-day log retention.
- No NAT Gateway, ECS, EKS, EC2, or RDS.
- Bedrock: bounded max_tokens in inference requests.
