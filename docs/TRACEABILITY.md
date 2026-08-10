# Traceability Matrix

## Matrix

| Req | Title | Priority | Status | Implementation |
|-----|-------|----------|--------|----------------|
| R1 | Customer Request Intake | MUST | ✅ Done | IntakeForm.tsx, input-validator.ts |
| R2 | AI-Powered Extraction | MUST | ✅ Done | extract-intake.ts (Bedrock Structured Outputs) |
| R3 | Deterministic Validation | MUST | ✅ Done | business-rules.ts |
| R4 | Attention Flag Detection | MUST | ✅ Done | attention-detector.ts |
| R5 | Explainability | MUST | ✅ Done | attention-detector.ts (inline), ReviewPanel.tsx |
| R6 | Care Plan Generation | MUST | ✅ Done | care-plan-assembler.ts |
| R7 | Human-in-the-Loop Review | MUST | ✅ Done | ReviewPanel.tsx |
| R8 | Operational Record Storage | MUST | ✅ Done | care-plan-crud.ts, DynamoDB |
| R9 | Responsive Web UI | MUST | ✅ Done | React SPA (768-1920px) |
| R10 | Serverless AWS Architecture | MUST | ✅ Done | Lambda, API GW, DynamoDB, S3, CloudFront |
| R11 | Infrastructure as Code | MUST | ✅ Done | Terraform (22 resources) |
| R12 | Demo-Ready Judge Experience | MUST | ✅ Done | 3 scenarios, no auth, <3 clicks |
| R13 | Security & Cost Protection | MUST | ✅ Done | CORS, throttling, OAC, least-privilege IAM |
| R14 | Graceful Failure Handling | MUST | ✅ Done | Error states, retry, preserved intake |
| R15 | AI Uncertainty Indicators | SHOULD | ✅ Done | uncertainFields, banner in review |
| R16 | Care Plan History | SHOULD | ✅ Done | HistoryList.tsx, CarePlanDetail.tsx |
| R17 | Observability | SHOULD | ✅ Done | CloudWatch 14-day, correlation IDs |
| R18 | Multi-Pet Extraction | COULD | Deferred | Post-MVP |
