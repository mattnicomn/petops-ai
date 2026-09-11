# PetOps AI — Project Status

## Current Phase
**ARCHIVED** — The hackathon is complete and the submission is closed. The AWS demo environment was retired on 2026-09-11 to stop recurring cost. The repository (source, specs, architecture, tests, Terraform source) and the YouTube demo videos remain available for reference. The sections below are retained as a historical record of the project at submission time.

_Previously: FEATURE COMPLETE / FEATURE FROZEN — all product capabilities implemented, tested, deployed, and validated._

## Completed
- [x] Planning baseline (requirements, design, tasks, ADRs, steering)
- [x] Monorepo structure (npm workspaces, TypeScript strict)
- [x] Terraform infrastructure (22 resources deployed)
- [x] AWS account safeguard (allowed_account_ids + precondition)
- [x] Private S3 + CloudFront OAC + custom domain
- [x] ACM certificate + Route 53 DNS
- [x] API Gateway with CORS + throttling
- [x] Bedrock AI extraction (Claude Haiku 4.5 with Structured Outputs)
- [x] Deterministic validation (business rules, required fields, date logic)
- [x] Operational attention flags (medication gaps, vaccination timing, behavioral, allergy)
- [x] Evidence-based explainability
- [x] Care plan assembly
- [x] DynamoDB persistence (CRUD)
- [x] React frontend (landing, demo scenarios, intake, review, history, detail)
- [x] End-to-end judge workflow validated (all 3 scenarios)
- [x] CloudFront CORS/caching hardened
- [x] SPA routing + API 404 pass-through fixed

## Live Application (retired)
_The AWS environment was retired after the competition. These URLs are no longer hosted and are kept as a historical record._
- **URL**: https://petops-ai.usmissionhero.com/ _(retired — no longer hosted)_
- **Demo**: https://petops-ai.usmissionhero.com/demo _(retired — no longer hosted)_
- **App**: https://petops-ai.usmissionhero.com/app _(retired — no longer hosted)_
- **API Health**: https://petops-ai.usmissionhero.com/api/health _(retired — no longer hosted)_

## Judge Workflow (tested end-to-end)
1. Landing page → "Try the Demo" (2 clicks to start)
2. Select scenario (Bentley/Luna/Cooper) or enter custom text
3. "Analyze Request" → AI extraction (~2-4s)
4. Review panel: original text, proposed care plan, attention flags, uncertainty indicators
5. Approve → saved to DynamoDB → confirmation
6. History → view stored care plans

## Infrastructure (decommissioned 2026-09-11)
_All AWS resources below were destroyed via `terraform destroy` after the competition (46 Terraform-managed resources removed) and no longer exist. The shared `usmissionhero.com` Route 53 hosted zone was left untouched._
- CloudFront: E368MC43CWVODO (petops-ai.usmissionhero.com) — destroyed
- API Gateway: sfvvqu6nkg (throttled: burst=10, rate=5) — destroyed
- Lambdas: health, extract-intake, validate-and-flag, care-plan-crud — destroyed
- DynamoDB: petops-ai-care-plans (on-demand) — destroyed
- Budget: $10/month with 50%/80%/100% alerts — destroyed
- Bedrock: Claude Haiku 4.5 via US inference profile with Structured Outputs — access removed (no dedicated resource)

- [x] Guided Intake mode with Live Care Plan (product feedback enhancement)
- [x] Two intake modes sharing same trust pipeline
- [x] Feature freeze achieved

## Remaining Work
- [ ] Demo video
- [ ] Final submission checklist

## Key Dates
| Date | Milestone |
|------|-----------|
| **Aug 9-10** | **Foundation + Infrastructure + Backend + Frontend** ✓ |
| Aug 11-13 | Testing, polish, documentation |
| **Aug 21** | **FEATURE FREEZE** |
| Aug 22 | Submission assets |
| **Aug 23** | **FINAL SUBMISSION** |
