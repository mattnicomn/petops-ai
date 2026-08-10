# ADR-003: DynamoDB for Data Storage

## Status
Accepted

## Date
2026-08-09

## Context
The application stores approved care plans with associated metadata (original request, extraction result, flags, approved content). Access patterns are simple: store by ID, retrieve by ID, list recent items sorted by date.

## Decision
Use Amazon DynamoDB with on-demand capacity mode. Single table design with partition key (care plan ID) and a GSI for listing by approval date.

## Alternatives Considered

### Amazon RDS (PostgreSQL)
- Pros: Rich queries, familiar SQL, JSONB for flexible schemas
- Cons: Always-on cost ($15-50+/month minimum), requires VPC/NAT for Lambda access, overkill for simple access patterns

### S3 + metadata
- Pros: Cheap storage, unlimited size
- Cons: No querying capability, eventual consistency issues, no atomic writes

## Consequences
- Zero cost when idle, pay per request at demo load (~$0.01/month)
- Simple key-value access patterns fit DynamoDB perfectly
- On-demand mode means no capacity planning
- 400KB item size limit is sufficient for care plan documents
- GSI enables list-by-date without scan operations
- No VPC or NAT Gateway required

## Table Design
- Table: `petops-ai-care-plans`
- PK: `id` (UUIDv4)
- GSI: `status-approvedAt-index` (PK: status, SK: approvedAt)
- Attributes: id, status, approvedAt, petName, serviceType, serviceStartDate, originalRequest, extractionResult, attentionFlags, carePlan

## Traceability
- Supports: Requirement 8 (Record Storage), Requirement 16 (History/List View)
