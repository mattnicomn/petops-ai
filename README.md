# PetOps AI

AI-powered operations assistant for pet-care businesses.

## What It Does

PetOps AI transforms unstructured customer requests (phone calls, texts, emails, free-form notes) into structured, validated care plans through responsible AI with human-in-the-loop review.

**Flagship workflow:**
Customer request → AI extraction → deterministic validation → risk detection → explainable findings → proposed care plan → human review → operational record

## Problem

Pet-care businesses receive critical customer instructions in unstructured forms. Employees must manually interpret this information — pet names, boarding dates, medications, behavioral concerns, allergies — and convert it into operational plans. Important details get overlooked, interpreted inconsistently, or buried in free-form language.

## Who It Serves

- Pet boarding facilities
- Dog daycare businesses
- Groomers and kennels
- Pet sitters
- Veterinary boarding operations

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite (TypeScript) |
| API | Amazon API Gateway HTTP API |
| Compute | AWS Lambda (Node.js) |
| Data | Amazon DynamoDB (on-demand) |
| AI | Amazon Bedrock |
| Hosting | Amazon S3 + CloudFront |
| IaC | Terraform |

## Architecture

> Architecture diagram and detailed data flow will be added after technical design is complete.

### Key Design Decisions

- [ADR-001: Serverless AWS Architecture](docs/decisions/001-serverless-aws-architecture.md)
- [ADR-002: React + Vite Frontend](docs/decisions/002-react-vite-frontend.md)
- [ADR-003: DynamoDB Data Store](docs/decisions/003-dynamodb-data-store.md)
- [ADR-004: Bedrock AI Extraction](docs/decisions/004-bedrock-ai-extraction.md)
- [ADR-005: Terraform IaC](docs/decisions/005-terraform-iac.md)
- [ADR-006: No Auth for Demo](docs/decisions/006-no-auth-demo.md)
- [ADR-007: AI Validation Boundary](docs/decisions/007-ai-validation-boundary.md)

## AI Safety & Human-in-the-Loop

PetOps AI demonstrates responsible AI principles:

- AI output treated as **untrusted input** until validated deterministically
- **Deterministic validation** layer between AI extraction and care plan generation
- **Explainability**: clear reasoning for every flagged item
- **Human review**: staff always approve/reject before care plan becomes operational
- **No fabricated confidence**: uncertainty is binary (confident/uncertain) based on model behavior
- System does NOT provide veterinary diagnosis or medical advice

## Demo Experience

> *Planned: Demo URL at https://petops-ai.usmissionhero.com/*

Pre-built scenarios (fictional data only):
- **Bentley** — Boarding + Medication (Apoquel) + Behavioral concern (anxiety around large dogs)
- **Luna** — Grooming + Allergy sensitivity
- **Cooper** — Boarding + Vaccination timing concern
- **Blank Intake** — Free-form text entry

No account creation required for the demo.

## Local Development

> *Setup instructions will be added when implementation begins.*

### Prerequisites (planned)
- Node.js 20+
- AWS CLI configured
- Terraform 1.5+

## Testing

> *Test commands will be added when test infrastructure is established.*

### Strategy
- Property-based testing for validation logic
- Unit tests for schema conformance
- Integration tests for API endpoints
- Failure-path tests (missing data, invalid AI output, service failures)
- Accessibility testing (WCAG 2.1 AA)

## Deployment

> *Deployment instructions will be added when Terraform configuration is complete.*

## How Kiro Is Being Used

This project uses [Kiro](https://kiro.dev) as the primary AI software engineering environment. Kiro is being used authentically throughout the development lifecycle:

### Completed (Phase: Foundation)
- **Project Steering**: Established development principles, technical direction, security guardrails, and cost constraints (`.kiro/steering/`)
- **Formal Specification**: Created detailed requirements using Kiro's spec workflow — 17 requirements with EARS-format acceptance criteria (`.kiro/specs/petops-ai-platform/requirements.md`)
- **Requirements Detailing**: Automated refinement of each requirement for testability and precision

### Planned
- Technical design document via Kiro spec workflow
- Implementation task decomposition
- Agentic development for feature implementation
- Testing workflow assistance
- Hooks for automated validation
- Documentation generation

## Known Limitations

> *Will be documented as implementation progresses.*

## Cost Considerations

- Target: <$15/month AWS spend under demonstration load
- All serverless (zero cost when idle)
- Efficient Bedrock model selection (Haiku for cost-effective extraction)
- On-demand DynamoDB (no provisioned capacity)

## License

MIT

## Hackathon

Built for the 2026 Ready, Spec, Ship Hackathon sponsored by Kiro.
