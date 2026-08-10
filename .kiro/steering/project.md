# PetOps AI — Project Steering

## Product Vision

PetOps AI is an AI-powered operations assistant for pet-care businesses. It transforms unstructured customer requests into structured, validated care plans through responsible AI with human-in-the-loop review.

## Hackathon Context

- **Event**: 2026 Ready, Spec, Ship Hackathon (sponsored by Kiro)
- **Feature Freeze**: August 21, 2026
- **Submission**: August 23, 2026
- **Demo URL**: https://petops-ai.usmissionhero.com/

## Technical Direction

- Frontend: React + Vite (SPA)
- API: Amazon API Gateway HTTP API
- Compute: AWS Lambda (Node.js/TypeScript)
- Data: Amazon DynamoDB (on-demand)
- AI: Amazon Bedrock
- IaC: Terraform
- Hosting: S3 + CloudFront

## Development Principles

1. Plan before implementing. Prefer vertical slices over disconnected components.
2. Keep the main branch healthy. Test meaningful behavior.
3. Document significant decisions when they happen.
4. Optimize for a polished complete submission rather than feature count.
5. Never reuse pre-existing code from other projects (especially Togs & Dogs).
6. All demo data must be fictional.

## AI Safety Principles

- AI output is untrusted external input until validated deterministically — even with Bedrock Structured Outputs enabled.
- Separate AI extraction from business rule application.
- Never fabricate confidence values or numeric percentages.
- Explainability must be concise, evidence-based, traceable to input or deterministic rule, explicit about uncertainty, and free from unsupported claims.
- System does NOT provide veterinary diagnosis, treatment recommendations, medication-compatibility advice, or medical safety assessments.
- All flagging is operational (information gaps, conflicts, date observations) — never clinical.
- Human always has final approve/reject authority over care plans.

## Product/Safety Boundary

PetOps AI organizes and flags owner-provided care instructions for operational staff use. It does NOT provide veterinary diagnosis, treatment recommendations, medication-compatibility advice, or medical safety assessments. Attention flags identify operationally observable information gaps or conflicts — not clinical determinations.

## Security Guardrails

- Never commit credentials, AWS keys, or API secrets.
- IAM least privilege on all Lambda roles.
- Validate all API input against schemas.
- Validate all AI output against schemas before use.
- Sanitize user input before rendering (prevent XSS).
- CORS restricted to CloudFront distribution domain only.
- Treat Terraform state as sensitive — never commit to repo.

## Cost Guardrails

- Monthly AWS Budget target: $10 with alerts at 50%, 80%, 100%.
- Use on-demand DynamoDB (no provisioned capacity).
- Use efficient Bedrock model: Claude Haiku 4.5 (`us.anthropic.claude-haiku-4-5-20251001-v1:0`).
- Bound Bedrock inference output tokens to prevent unbounded generation cost.
- No ECS, EKS, EC2, RDS, NAT Gateway, or always-on infrastructure.
- API Gateway throttling to limit burst/sustained request rates.
- Maximum request body size: 10KB.
- Server-side Bedrock invocation only (never from browser).
- Tag all resources: Project=PetOpsAI, Application=PetOpsAI, Environment=hackathon, ManagedBy=Terraform, Repository=petops-ai, Owner=usmissionhero.
- CloudWatch log retention: 14 days.
- Note: API throttling is not a guaranteed hard cost ceiling — budget alerts provide the actual cost boundary.

## Testing Strategy

- Deterministic unit tests for validation logic and business rules (fixed inputs → expected outputs).
- Curated scenario/contract tests for AI extraction boundaries (known inputs → schema-conforming outputs).
- Live-model integration tests clearly separated from deterministic test suite (not run on every CI pass).
- Failure-path tests (missing data, invalid AI output, service failures, timeout).
- Accessibility testing for WCAG 2.1 AA compliance.
- Property-based testing where it adds value (e.g., schema validation invariants) — not described as "exhaustive."

## Documentation Requirements

- README with setup, architecture, testing, deployment instructions.
- SECURITY.md before final submission.
- ADRs for significant architecture decisions.
- Development process evidence in .kiro directory.
- Traceability: requirement → design → task → implementation → test.
