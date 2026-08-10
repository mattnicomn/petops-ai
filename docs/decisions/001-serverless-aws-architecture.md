# ADR-001: Serverless AWS Architecture

## Status
Accepted

## Date
2026-08-09

## Context
PetOps AI needs a hosting platform for a hackathon demo application. The system processes unstructured text through AI extraction, validation, and care plan generation. Traffic will be minimal (demonstration load only — ~50 workflows/month). Budget target is under $15/month.

## Decision
Use a fully serverless AWS architecture:
- AWS Lambda for compute
- Amazon API Gateway HTTP API for routing
- Amazon DynamoDB (on-demand) for persistence
- Amazon Bedrock for AI inference
- Amazon S3 + CloudFront for frontend hosting

## Alternatives Considered

### Container-based (ECS/Fargate)
- Pros: Familiar deployment model, consistent runtime
- Cons: Minimum cost ~$10-30/month even idle, unnecessary for demo load, slower cold starts for our use case

### Traditional server (EC2)
- Pros: Full control, predictable behavior
- Cons: Always-on cost ($5-50+/month), requires patching, overkill for hackathon demo

## Consequences
- Zero cost when idle (pay only per invocation)
- Cold start latency on first request (~1-3s for Node.js Lambda)
- 30-second max timeout for Bedrock calls is sufficient
- No server management overhead
- Natural fit for event-driven extraction pipeline
- Well within $15/month budget at demo load

## Traceability
- Supports: Requirement 10 (Serverless Architecture), Requirement 11 (IaC)
