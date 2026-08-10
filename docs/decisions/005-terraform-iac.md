# ADR-005: Terraform for Infrastructure as Code

## Status
Accepted

## Date
2026-08-09

## Context
All AWS infrastructure must be reproducible and version-controlled. The hackathon requires clean setup/teardown capability.

## Decision
Use Terraform with remote state (S3 + DynamoDB locking). Single environment, no workspaces. State backend provisioned manually once.

## Alternatives Considered

### AWS CDK
- Pros: TypeScript (same language as app), higher-level constructs
- Cons: Synthesizes to CloudFormation (slower deploys), heavier dependency, less transparent

### AWS SAM
- Pros: Lambda-focused, simpler for serverless
- Cons: Limited to CloudFormation subset, less control over non-Lambda resources

### CloudFormation
- Pros: Native AWS, no additional tools
- Cons: Verbose YAML/JSON, slower iteration, less ecosystem

## Consequences
- Declarative infrastructure with clear state management
- `terraform apply` deploys everything; `terraform destroy` tears down cleanly
- Remote state prevents accidental local divergence
- Well-documented ecosystem for all AWS services
- One-time manual prerequisite: create state bucket and lock table

## Traceability
- Supports: Requirement 11 (Infrastructure as Code)
