# Traceability Matrix

## Verification Status Legend
- **Verified**: Automated test evidence AND/OR live deployment validation exists
- **Implemented**: Code exists, no formal automated test coverage yet
- **Deferred**: Explicitly post-MVP

## Requirements → Implementation → Tests → Status

| Req | Title | Priority | Implementation | Test Evidence | Status |
|-----|-------|----------|----------------|---------------|--------|
| R1 | Customer Request Intake | MUST | `packages/frontend/src/pages/IntakeForm.tsx`, `packages/backend/src/validation/input-validator.ts` | `input-validator.test.ts` (9 tests) + live judge flow | **Verified** |
| R2 | AI-Powered Extraction | MUST | `packages/backend/src/handlers/extract-intake.ts` | Bentley/Luna/Cooper live regression (3 scenarios), Zod validation | **Verified** |
| R3 | Deterministic Validation | MUST | `packages/backend/src/validation/business-rules.ts` | `business-rules.test.ts` (8 tests: date ranges, required fields, exhaustive collection) | **Verified** |
| R4 | Attention Flag Detection | MUST | `packages/backend/src/detection/attention-detector.ts` | `attention-detector.test.ts` (15 tests: medication gaps, vaccination timing, behavioral, allergy, safety boundary) | **Verified** |
| R5 | Explainability | MUST | `packages/backend/src/detection/attention-detector.ts` (inline), `ReviewPanel.tsx` | `attention-detector.test.ts` (explanation tests) + live review panel | **Verified** |
| R6 | Care Plan Generation | MUST | `packages/backend/src/assembly/care-plan-assembler.ts` | `care-plan-assembler.test.ts` (10 tests: sections, medications, placeholders, uncertainty, no fabrication) | **Verified** |
| R7 | Human-in-the-Loop Review | MUST | `packages/frontend/src/pages/ReviewPanel.tsx` | Live judge workflow (approve/reject tested) | **Verified** |
| R8 | Operational Record Storage | MUST | `packages/backend/src/handlers/care-plan-crud.ts`, DynamoDB | Live API validation (create, get, list, 404) | **Verified** |
| R9 | Responsive Web UI | MUST | React SPA, `styles.css` | Live deployment (768-1920px), SPA routing verified | **Verified** |
| R10 | Serverless AWS Architecture | MUST | `infrastructure/terraform/*.tf` | `terraform validate` + `terraform plan` (no drift) + live deployment | **Verified** |
| R11 | Infrastructure as Code | MUST | `infrastructure/terraform/` (12 .tf files) | `terraform validate/plan/apply`, account safeguard tested | **Verified** |
| R12 | Demo-Ready Judge Experience | MUST | Landing, Demo, IntakeForm, 3 scenarios | Live end-to-end walkthrough (< 3 clicks, no auth) | **Verified** |
| R13 | Security & Cost Protection | MUST | CORS, throttling, OAC, IAM roles, Zod validation | CORS preflight tested, 404 pass-through verified, SECURITY.md documented | **Verified** |
| R14 | Graceful Failure Handling | MUST | Error states in React, retry in Lambda | Input validator tests + live error behavior (empty text, API errors) | **Verified** |
| R15 | AI Uncertainty Indicators | SHOULD | `uncertainFields` in extraction, banner in ReviewPanel | `care-plan-assembler.test.ts` (uncertainty count test) + live review | **Verified** |
| R16 | Care Plan History | SHOULD | `HistoryList.tsx`, `CarePlanDetail.tsx` | Live API `/api/care-plans` returns data, detail page tested | **Verified** |
| R17 | Observability | SHOULD | CloudWatch 14-day retention, correlation IDs | Deployed log groups confirmed, correlation IDs in all responses | **Implemented** |
| R18 | Multi-Pet Extraction | COULD | — | — | **Deferred** |

## Summary
- **Verified**: 16 requirements
- **Implemented**: 1 requirement (R17 — observability deployed but no automated log-content tests)
- **Deferred**: 1 requirement (R18 — multi-pet)
