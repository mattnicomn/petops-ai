# ADR-006: No Authentication for Hackathon Demo

## Status
Accepted

## Date
2026-08-09

## Context
Hackathon judges need to evaluate the application quickly without friction. Account creation or login would add barrier and reduce judging time spent on actual functionality.

## Decision
No authentication for the hackathon demonstration. The application is open-access. All data is fictional. Rate limiting via API Gateway throttling provides basic abuse protection.

## Alternatives Considered

### Amazon Cognito (optional auth)
- Pros: Could demonstrate security capability
- Cons: Adds friction for judges, more infrastructure, complexity for demo-only app

### Simple shared password
- Pros: Minimal protection
- Cons: Still friction, password distribution problem

## Consequences
- Zero friction for judges (Requirement 12)
- No user-specific data isolation (acceptable for fictional demo data)
- API Gateway throttling prevents abuse (e.g., 10 req/sec burst)
- Future: authentication can be added post-hackathon if needed
- Risk: public API could be called by anyone — acceptable since data is fictional and costs are bounded

## Traceability
- Supports: Requirement 12 (Demo-Ready Judge Experience)
