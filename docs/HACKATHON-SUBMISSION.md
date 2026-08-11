# PetOps AI — Hackathon Submission

## Event
2026 Ready, Spec, Ship Hackathon (sponsored by Kiro)

## Project
**PetOps AI** — AI-powered operations assistant for pet-care businesses

## Links
- **Live Application**: https://petops-ai.usmissionhero.com/
- **Demo Page**: https://petops-ai.usmissionhero.com/demo
- **GitHub Repository**: https://github.com/mattnicomn/petops-ai
- **Demo Video**: https://www.youtube.com/watch?v=C4zRCx_ZyMw
- **Extended Technical Walkthrough**: https://www.youtube.com/watch?v=rcYxXv5sq98

## Quick Judge Walkthrough
1. Visit https://petops-ai.usmissionhero.com/
2. Click "Try the Demo"
3. **AI Quick Intake**: Select Bentley → "Analyze Request" → review attention flags → approve
4. **Guided Intake**: Click "Start Guided Intake" → select Cooper → Full Groom → answer questions → watch Live Care Plan → approve

**No account creation, setup, or credentials required.**

## What It Does
Transforms unstructured customer requests into structured, validated care plans through responsible AI with human-in-the-loop review.

Two intake modes — one trusted operational pipeline:
- **AI Quick Intake**: Natural language → Bedrock Structured Outputs → extraction
- **Guided Intake**: Contextual questions → deterministic mapper → same contract

Both → Zod validation → business rules → attention flags → care plan assembly → human review → DynamoDB

## Kiro Usage
The `.kiro/` directory contains authentic development artifacts:
- **Steering**: Product vision, coding standards, Terraform conventions
- **Specifications**: 19 requirements (EARS format), technical design, implementation tasks
- **Architecture Decisions**: 7 ADRs in `docs/decisions/`

Kiro was used for the complete lifecycle: steering → requirements → design → tasks → implementation → debugging → testing → deployment → feature enhancement.

## Key Technical Highlights
- 62 automated tests (unit + property-based)
- 17/19 requirements formally Verified
- Bedrock Structured Outputs (Claude Haiku 4.5)
- Defense-in-depth AI validation (Structured Outputs + Zod + business rules)
- Terraform-managed AWS infrastructure (account safeguard)
- $10/month AWS Budget with alerts
- GitHub Actions CI
- No authentication required for demo
- All demo data is fictional

## Architecture
- Frontend: React 19 + Vite + TypeScript
- API: Amazon API Gateway HTTP API (throttled, CORS)
- Compute: AWS Lambda (Node.js 20)
- AI: Amazon Bedrock (Claude Haiku 4.5, Structured Outputs)
- Data: Amazon DynamoDB (on-demand)
- Hosting: S3 + CloudFront (private bucket, OAC)
- IaC: Terraform
- CI: GitHub Actions

## Safety/Security
- AI output treated as untrusted (Structured Outputs + Zod validation)
- No veterinary/clinical claims
- Human approval before persistence
- IAM least-privilege
- Private S3 with OAC
- SECURITY.md documents full threat model

## Feature Freeze
Commit: `c4b6167` — all product capabilities frozen. Only presentation polish after this point.

## Submission Status
- **Status**: SUBMITTED
- **Submission date**: 2026-08-10
- **Participant**: Matthew Nico — Solo entrant
- **Organization**: USMissionHero
- **Final submitted commit**: `3aeeb74`
- **Feature freeze remains in effect** — no subsequent changes without explicit reopening/approval

## Team
Matthew Nico — Solo entrant
Organization: USMissionHero
