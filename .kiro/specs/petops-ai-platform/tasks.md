# Implementation Plan: PetOps AI Platform

## Overview

This plan implements the PetOps AI platform as an early deployed vertical slice, prioritizing live infrastructure before feature completeness. The strategy deploys Terraform infrastructure (S3, CloudFront, API Gateway, Lambda stubs) first so we have a live URL at `petops-ai.usmissionhero.com` early, then layers on shared schemas, deterministic backend logic, AI integration, and frontend features in parallel tracks.

**Language**: TypeScript (frontend and backend)
**Deadline**: August 21, 2026 (feature freeze)
**AWS Account**: 253881689673 (us-east-1)

## Tasks

- [x] 1. Project Setup and Monorepo Structure
  - [x] 1.1 Initialize monorepo with package.json, TypeScript config, and tooling
    - Create root `package.json` with npm workspaces: `packages/shared`, `packages/backend`, `packages/frontend`, `infrastructure/terraform`
    - Create root `tsconfig.base.json` with strict mode, ES2022 target, composite project references
    - Create workspace-level `tsconfig.json` files extending base
    - Install shared dev dependencies: `typescript`, `vitest`, `fast-check`, `zod`, `eslint`, `prettier`
    - Create `.gitignore` (node_modules, dist, .terraform, *.tfstate*, .env)
    - Create `.nvmrc` with Node 20 LTS
    - _Requirements: 11.1, 11.3_
    - **Validation**: `npm install && npx tsc --noEmit`

  - [x] 1.2 Configure Vitest and fast-check testing infrastructure
    - Create `vitest.config.ts` at root with workspace configuration
    - Create `packages/shared/vitest.config.ts`, `packages/backend/vitest.config.ts`, `packages/frontend/vitest.config.ts`
    - Install `@vitest/coverage-v8` for coverage reporting
    - Create `packages/shared/src/index.ts` entry point (empty placeholder)
    - Verify test runner works with a trivial passing test in `packages/shared`
    - _Requirements: 3.4, 3.5_
    - **Validation**: `npm run test -- --run`

- [x] 2. Terraform Core Infrastructure — Vertical Slice A (Infrastructure Proof)
  - [x] 2.1 Configure Terraform backend and provider with account safeguard
    - Create `infrastructure/terraform/main.tf` with AWS provider (us-east-1, default_tags, allowed_account_ids=["253881689673"])
    - Create `infrastructure/terraform/backend.tf` with S3 state backend (key: `petops-ai/terraform.tfstate`)
    - Add `aws_caller_identity` data source and `null_resource` precondition for account 253881689673 (defense in depth with allowed_account_ids)
    - Create `infrastructure/terraform/variables.tf` with `budget_alert_email` variable
    - Create `infrastructure/terraform/outputs.tf` (placeholder)
    - Create `infrastructure/terraform/versions.tf` with required providers (aws ~> 5.0, null ~> 3.0)
    - _Requirements: 11.1, 11.5_
    - **Validation**: `terraform init && terraform validate`

  - [x] 2.2 Create S3 bucket and CloudFront distribution for SPA hosting
    - Create `infrastructure/terraform/s3.tf`: bucket `petops-ai-frontend-253881689673` with website config disabled (OAC access)
    - Create `infrastructure/terraform/cloudfront.tf`: distribution with OAC, SPA error pages (403/404 → /index.html), HTTPS only
    - Configure CloudFront origin for S3 bucket with OAC
    - Add S3 bucket policy allowing CloudFront OAC read access
    - Use CloudFront's default *.cloudfront.net hostname initially (no custom domain yet)
    - Output CloudFront distribution domain and ID
    - _Requirements: 10.5, 9.1_
    - **Validation**: `terraform validate && terraform plan`

  - [x] 2.3 Create API Gateway HTTP API with CORS and throttling
    - Create `infrastructure/terraform/api-gateway.tf`: HTTP API `petops-ai-api` with `$default` stage
    - Configure CORS: allow origin for CloudFront default domain initially (updated in Slice B)
    - Configure default route throttling: burst=10, rate=5
    - Add CloudFront origin for API Gateway (path pattern `/api/*`)
    - Output API Gateway invoke URL
    - _Requirements: 10.2, 13.5, 13.7_
    - **Validation**: `terraform validate && terraform plan`

  - [ ] 2.4 Create DynamoDB table with GSI
    - Create `infrastructure/terraform/dynamodb.tf`: table `petops-ai-care-plans`
    - Partition key: `id` (String), billing mode: PAY_PER_REQUEST (on-demand)
    - GSI `createdAt-index`: partition key `status` (String), sort key `createdAt` (String)
    - GSI projection: `id`, `petName`, `serviceType`, `status`, `createdAt`
    - _Requirements: 10.3, 8.2, 8.3_
    - **Validation**: `terraform validate && terraform plan`

  - [x] 2.5 Create Lambda functions with IAM roles (stub handlers)
    - Create `infrastructure/terraform/lambda.tf`: three Lambda functions + one health check
      - `petops-ai-health` (5s timeout, 128MB, Node.js 20) — GET /api/health ✓
      - `petops-ai-extract-intake` (30s timeout, 256MB, Node.js 20) — deferred to later slice
      - `petops-ai-validate-and-flag` (10s timeout, 256MB, Node.js 20) — deferred to later slice
      - `petops-ai-care-plan-crud` (10s timeout, 256MB, Node.js 20) — deferred to later slice
    - Create `infrastructure/terraform/iam.tf`: IAM roles with least-privilege
      - health: logs only
      - extract-intake: bedrock:InvokeModel, logs:CreateLogGroup/Stream/PutLogEvents
      - validate-and-flag: logs only
      - care-plan-crud: dynamodb:GetItem/PutItem/Query/UpdateItem on table + GSI, logs
    - Wire Lambda functions to API Gateway routes (GET /api/health, POST /api/extract, POST /api/validate-and-flag, POST/GET /api/care-plans, GET /api/care-plans/{id})
    - Create placeholder Lambda deployment packages (zip with minimal handler returning mock JSON)
    - _Requirements: 10.1, 13.2, 13.9_
    - **Validation**: `terraform validate && terraform plan`

  - [x] 2.6 Create CloudWatch log groups and AWS Budget
    - Create `infrastructure/terraform/cloudwatch.tf`: log groups for each Lambda with 14-day retention
    - Create `infrastructure/terraform/budget.tf`: AWS Budget `petops-ai-monthly`, $10 limit, MONTHLY
      - Cost filter by tag `Project=PetOpsAI`
      - Notifications at 50%, 80%, 100% thresholds to `var.budget_alert_email`
    - _Requirements: 10.6, 17.1_
    - **Validation**: `terraform validate && terraform plan`

  - [x] 2.7 Deploy Vertical Slice A and verify via CloudFront default hostname
    - Run `terraform apply` to deploy all Slice A infrastructure
    - Upload a minimal `index.html` ("PetOps AI - Coming Soon") to S3
    - Verify CloudFront default hostname (*.cloudfront.net) serves the HTML page
    - Verify `/api/health` returns 200 with JSON health check response from Lambda stub
    - Invalidate CloudFront cache if needed
    - _Requirements: 11.2_
    - **Validation**: `curl -s https://<cloudfront-domain>/ | grep "PetOps"` and `curl -s https://<cloudfront-domain>/api/health`

- [x] 3. Terraform — Vertical Slice B (Branded Demo Foundation)
  - [x] 3.1 Configure ACM certificate and Route 53 DNS for custom domain
    - Create `infrastructure/terraform/acm.tf`: ACM certificate for `petops-ai.usmissionhero.com` with DNS validation
    - Create `infrastructure/terraform/dns.tf`: Route 53 validation records for ACM + A record (alias) for `petops-ai.usmissionhero.com` → CloudFront
    - Wire ACM certificate ARN into CloudFront viewer certificate config (alternate domain name)
    - Update CORS origin to `https://petops-ai.usmissionhero.com`
    - _Requirements: 10.5, 12.1_
    - **Validation**: `terraform validate && terraform plan`

  - [x] 3.2 Deploy Vertical Slice B and verify branded URL
    - Run `terraform apply` to deploy DNS/ACM additions
    - Wait for ACM certificate validation (may take minutes)
    - Verify `https://petops-ai.usmissionhero.com/` serves the HTML page
    - Verify `https://petops-ai.usmissionhero.com/api/health` returns health check
    - Verify SPA fallback: `https://petops-ai.usmissionhero.com/app` serves index.html
    - Verify `/api/*` routing to API Gateway works
    - _Requirements: 12.1, 12.2, 12.3_
    - **Validation**: `curl -s https://petops-ai.usmissionhero.com/ | grep "PetOps"` and `curl -s https://petops-ai.usmissionhero.com/api/health`

- [x] 4. Checkpoint - Vertical slices deployed
  - Terraform applies cleanly, live URL responds at both CloudFront default and custom domain, API returns health data. ✓

- [x] 5. Shared Zod Schemas
  - [x] 5.1 Implement core data model schemas (ExtractionResult, PetInfo, ServiceRequest)
    - Create `packages/shared/src/schemas/extraction.ts`
    - Define Zod schemas: `PetInfoSchema`, `ServiceRequestSchema`, `MedicationEntrySchema`, `VaccinationEntrySchema`, `ExtractionResultSchema`
    - Export TypeScript types inferred from Zod schemas (`z.infer<typeof ...>`)
    - Include enum definitions: species types, service types, completeness levels
    - _Requirements: 2.6, 3.1, 3.6_
    - **Validation**: `npm run test -- --run packages/shared`

  - [x] 4.2 Implement validation and attention flag schemas
    - Create `packages/shared/src/schemas/validation.ts`
    - Define: `ValidationErrorSchema`, `ValidationResultSchema`
    - Create `packages/shared/src/schemas/attention-flag.ts`
    - Define: `AttentionFlagSchema` with severity enum and category enum
    - _Requirements: 3.5, 4.5_
    - **Validation**: `npm run test -- --run packages/shared`

  - [x] 4.3 Implement care plan and API request/response schemas
    - Create `packages/shared/src/schemas/care-plan.ts`
    - Define: `ProposedCarePlanSchema`, `StoredCarePlanSchema`, `CarePlanSummarySchema`, `ApprovedCarePlanSchema`
    - Include `DailyScheduleSchema`, `ScheduleEntrySchema`, `MedicationScheduleEntrySchema`, `MissingFieldPlaceholderSchema`
    - Create `packages/shared/src/schemas/api.ts`
    - Define: `ExtractRequestSchema`, `ValidateAndFlagRequestSchema`, `CreateCarePlanRequestSchema`
    - Define response schemas for each endpoint
    - Export barrel file `packages/shared/src/index.ts` re-exporting all schemas and types
    - _Requirements: 6.1, 6.5, 8.1, 13.1_
    - **Validation**: `npm run test -- --run packages/shared`

  - [ ]* 4.4 Write property tests for schema validation (Property 2: Round-trip)
    - **Property 2: ExtractionResult Schema Validation Round-Trip**
    - **Validates: Requirements 2.6, 3.1, 3.6, 13.3**
    - Create `packages/shared/src/__tests__/extraction-schema.property.test.ts`
    - Use fast-check to generate arbitrary valid ExtractionResult objects → assert Zod parse succeeds and output equals input
    - Generate arbitrary invalid objects → assert Zod parse fails with structured errors
    - Create custom `arbitraryExtractionResult()` generator

- [x] 5. Backend — Deterministic Validation Layer
  - [x] 5.1 Implement input validation (request body, text length, whitespace)
    - Create `packages/backend/src/validation/input-validator.ts`
    - Validate text: 1-5000 chars, non-empty, non-whitespace-only
    - Validate request body size: reject > 10KB
    - Return structured validation errors with field paths
    - _Requirements: 1.1, 1.2, 1.6, 13.1, 13.6_
    - **Validation**: `npm run test -- --run packages/backend`

  - [ ]* 5.2 Write property tests for input validation (Property 1: Customer Request Input)
    - **Property 1: Customer Request Input Validation**
    - **Validates: Requirements 1.1, 1.2, 1.6**
    - Create `packages/backend/src/__tests__/input-validator.property.test.ts`
    - Use fast-check `arbitraryCustomerRequestText()` generator
    - Assert: accepts iff 1-5000 chars with ≥1 non-whitespace character

  - [x] 5.3 Implement business rule validation (date ranges, required fields per service type)
    - Create `packages/backend/src/validation/business-rules.ts`
    - Date range rule: endDate must not be before startDate
    - Required fields per service type: boarding={petName, startDate, endDate}, grooming={petName, startDate}, daycare={petName, startDate}, sitting={petName, startDate, endDate}
    - Exhaustive error collection (never stop at first error)
    - Deterministic: same input → same output guaranteed
    - Return `ValidationResult` with all `ValidationError` items
    - _Requirements: 3.2, 3.3, 3.4, 3.5_
    - **Validation**: `npm run test -- --run packages/backend`

  - [ ]* 5.4 Write property tests for business rule validation (Properties 3, 4, 5, 6)
    - **Property 3: Date Range Business Rule**
    - **Property 4: Required Fields Per Service Type**
    - **Property 5: Validation Determinism**
    - **Property 6: Exhaustive Error Reporting**
    - **Validates: Requirements 3.2, 3.3, 3.4, 3.5**
    - Create `packages/backend/src/__tests__/business-rules.property.test.ts`
    - Generate arbitrary date pairs, arbitrary service requests with random field presence
    - Assert: date error iff endDate < startDate; missing fields exactly match expected set; determinism via double-execution; N violations → N reported errors

- [x] 6. Backend — Attention Detection and Explainability
  - [x] 6.1 Implement attention flag detection (medication gaps, vaccination timing, behavioral, allergy)
    - Create `packages/backend/src/detection/attention-detector.ts`
    - Medication gap detection: missing schedule, ambiguous frequency, incomplete dosage, ambiguous route, contradictory instructions, duplicates → HIGH severity
    - Vaccination timing: expiration date ≤ service end date → MEDIUM severity
    - Behavioral concerns: each entry → MEDIUM severity
    - Allergy entries: each → LOW severity
    - Return empty array when no conditions met
    - Assign UUIDv4 to each flag
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
    - **Validation**: `npm run test -- --run packages/backend`

  - [x] 6.2 Implement explainability module (evidence-based explanations, source text references)
    - Create `packages/backend/src/detection/explainability.ts`
    - Generate 1-3 sentence explanations per flag identifying triggering data and operational concern
    - Include `sourceText` from original customer request that triggered the flag
    - Ensure explanations are traceable, explicit about uncertainty, free from unsupported claims
    - No clinical claims about medication interactions or veterinary eligibility
    - _Requirements: 5.1, 5.2, 5.4_
    - **Validation**: `npm run test -- --run packages/backend`

  - [ ]* 6.3 Write property tests for attention detection (Properties 7, 8)
    - **Property 7: Attention Flag Detection Completeness and Severity**
    - **Property 8: Explanation Format and Source Reference**
    - **Validates: Requirements 4.1-4.7, 5.1, 5.2**
    - Create `packages/backend/src/__tests__/attention-detector.property.test.ts`
    - Generate arbitrary ExtractionResult with random medication/vaccination/behavioral/allergy entries
    - Assert: correct severity assignment, empty when no conditions, explanation 1-3 sentences, non-empty sourceText

- [x] 7. Backend — Care Plan Assembly
  - [x] 7.1 Implement care plan assembly (sections, medication timeline, missing field placeholders)
    - Create `packages/backend/src/assembly/care-plan-assembler.ts`
    - Assemble ProposedCarePlan with all 6 sections: petInformation, services, schedules, medications, attentionFlags, specialInstructions
    - Medication schedule: chronological ordering by administration time within each day
    - Missing field placeholders: one per missing required field with fieldPath, label, requiredFor
    - Calculate `uncertainFieldCount` from all uncertainFields arrays
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_
    - **Validation**: `npm run test -- --run packages/backend`

  - [ ]* 7.2 Write property tests for care plan assembly (Properties 9, 10, 11, 17)
    - **Property 9: Care Plan Assembly Completeness**
    - **Property 10: Medication Timeline Chronological Ordering**
    - **Property 11: Missing Field Placeholders**
    - **Property 17: Uncertainty Classification and Count**
    - **Validates: Requirements 6.1-6.5, 15.1, 15.4**
    - Create `packages/backend/src/__tests__/care-plan-assembler.property.test.ts`
    - Generate arbitrary valid ExtractionResults + AttentionFlags
    - Assert: all 6 sections present, medications ordered chronologically, placeholder count matches missing fields, uncertainFieldCount equals sum of uncertainFields arrays

- [ ] 8. Checkpoint - Deterministic logic complete
  - Ensure all property tests and unit tests pass for validation, attention detection, and care plan assembly. Ask the user if questions arise.

- [ ] 9. Backend — Bedrock AI Extraction Integration
  - [ ] 9.1 Implement extract-intake Lambda handler with Bedrock Converse API
    - Create `packages/backend/src/handlers/extract-intake.ts`
    - Validate request with `ExtractRequestSchema` (Zod)
    - Generate correlationId if not provided (UUIDv4)
    - Invoke Bedrock Converse API with Structured Outputs (model: `us.anthropic.claude-haiku-4-5-20251001-v1:0`)
    - Configure: temperature=0.0, maxTokens=2048, JSON schema constraint
    - Validate AI response with local Zod `ExtractionResultSchema` (defense in depth)
    - Implement retry: 1 automatic retry with 1s backoff on transient errors
    - Return `ExtractResponse` with correlationId, extractionResult, processingTimeMs
    - Error handling: 400 (invalid input), 422 (AI output fails validation), 503 (Bedrock unavailable), 504 (timeout)
    - _Requirements: 2.1-2.8, 13.3, 13.8, 14.1, 14.2, 14.6_
    - **Validation**: `npm run test -- --run packages/backend`

  - [ ]* 9.2 Write unit tests for extract-intake handler (mocked Bedrock)
    - Create `packages/backend/src/__tests__/extract-intake.unit.test.ts`
    - Mock Bedrock Converse API responses (success, transient error, timeout, invalid schema)
    - Test: successful extraction, retry on transient error, timeout handling, invalid AI output rejection
    - Test: correlationId generation, request validation, 10KB body rejection
    - _Requirements: 2.6, 14.1, 14.2, 14.6_

- [ ] 10. Backend — Validate-and-Flag Lambda Handler
  - [ ] 10.1 Implement validate-and-flag Lambda handler (orchestrating validation + detection + assembly)
    - Create `packages/backend/src/handlers/validate-and-flag.ts`
    - Validate request with `ValidateAndFlagRequestSchema`
    - Call business rule validation → attention detection → explainability → care plan assembly
    - Return `ValidateAndFlagResponse` with correlationId, validationResult, attentionFlags, proposedCarePlan
    - Error handling: 400 (invalid schema), 422 (structural issues)
    - Include correlationId in all responses
    - _Requirements: 3.1-3.6, 4.1-4.7, 5.1-5.4, 6.1-6.5, 14.6_
    - **Validation**: `npm run test -- --run packages/backend`

  - [ ]* 10.2 Write property tests for API input gate and correlation ID (Properties 14, 16)
    - **Property 14: API Input Validation Gate**
    - **Property 16: Correlation ID Presence**
    - **Validates: Requirements 13.1, 13.6, 14.6**
    - Create `packages/backend/src/__tests__/api-handlers.property.test.ts`
    - Assert: invalid schema or >10KB → rejection without downstream processing; every response has non-empty correlationId

- [ ] 11. Backend — CRUD Lambda (DynamoDB Operations)
  - [ ] 11.1 Implement care-plan-crud Lambda handler (create, get by ID, list recent)
    - Create `packages/backend/src/handlers/care-plan-crud.ts`
    - POST /api/care-plans: validate with `CreateCarePlanRequestSchema`, generate UUIDv4 ID, add createdAt/updatedAt timestamps, PutItem to DynamoDB
    - GET /api/care-plans: Query GSI `createdAt-index` with PK="approved", ScanIndexForward=false, Limit=20
    - GET /api/care-plans/{id}: GetItem by partition key, return 404 if not found
    - Include correlationId in all responses
    - Error handling: 400, 404, 503
    - _Requirements: 8.1-8.5, 14.6, 16.1, 16.3_
    - **Validation**: `npm run test -- --run packages/backend`

  - [ ]* 11.2 Write property tests for storage round-trip and record format (Properties 12, 13)
    - **Property 12: Care Plan Storage Round-Trip**
    - **Property 13: Stored Record Format Invariants**
    - **Validates: Requirements 8.1-8.4**
    - Create `packages/backend/src/__tests__/care-plan-crud.property.test.ts`
    - Mock DynamoDB client; generate arbitrary valid StoredCarePlan objects
    - Assert: store then retrieve returns equivalent data; ID matches UUIDv4 regex; timestamps are valid ISO 8601

- [ ] 12. Backend — Deploy Real Lambda Code
  - [ ] 12.1 Create Lambda build pipeline and deploy handlers to AWS
    - Create `packages/backend/esbuild.config.ts` (or equivalent bundler config) to bundle each handler as standalone zip
    - Bundle with tree-shaking, external aws-sdk (Lambda runtime provides it)
    - Create npm script `build:lambda` that produces `dist/extract-intake.zip`, `dist/validate-and-flag.zip`, `dist/care-plan-crud.zip`
    - Update Terraform Lambda resource to reference built zip artifacts (local file or S3 upload)
    - Run `terraform apply` to deploy real handler code
    - _Requirements: 10.1, 11.2_
    - **Validation**: `npm run build:lambda && terraform apply -auto-approve` (in infrastructure/terraform)

- [ ] 13. Checkpoint - Backend complete and deployed
  - Ensure all backend tests pass, Lambda functions deployed, API responds correctly via live URL. Ask the user if questions arise.

- [ ] 14. Frontend — React Scaffold and Core UI
  - [ ] 14.1 Initialize React + Vite + TypeScript project with routing
    - Create `packages/frontend/` using Vite React-TS template
    - Install: `react-router-dom`, `@tanstack/react-query` (for API calls)
    - Configure Vite proxy for local dev (`/api` → localhost Lambda or mock server)
    - Set up `src/main.tsx` with BrowserRouter, route definitions for /, /demo, /app, /app/plans, /app/plans/:id
    - Create minimal layout component with navigation
    - _Requirements: 9.1, 12.1_
    - **Validation**: `npm run dev` (manual verify) or `npm run build` in packages/frontend

  - [ ] 14.2 Implement LandingPage and DemoShowcase components
    - Create `packages/frontend/src/pages/LandingPage.tsx`: product name "PetOps AI", value proposition (1 sentence), CTA button linking to /demo
    - Create `packages/frontend/src/pages/DemoShowcase.tsx`: scenario selection with cards for Bentley, Luna, Cooper, and blank intake
    - Include fictional demo scenario text content (embedded constants)
    - Ensure accessible labels, keyboard navigation, 4.5:1 contrast ratio
    - _Requirements: 12.1-12.8, 9.6_
    - **Validation**: `npm run build` in packages/frontend

  - [ ] 14.3 Implement IntakeForm component with character counter and demo scenario buttons
    - Create `packages/frontend/src/pages/IntakeForm.tsx`
    - Textarea with character counter (current/5000), prevent input beyond 5000 chars
    - Client-side validation: empty/whitespace-only → error message, prevent submission
    - Demo scenario quick-load buttons (Bentley, Luna, Cooper)
    - Submit button calling POST /api/extract
    - Preserve text in component state through error flows
    - _Requirements: 1.1-1.6, 12.4-12.7_
    - **Validation**: `npm run test -- --run packages/frontend`

  - [ ] 14.4 Implement ProcessingView (loading state during extraction)
    - Create `packages/frontend/src/components/ProcessingView.tsx`
    - Display loading indicator within 200ms of submission
    - Show spinner/animation with accessible "Processing..." label
    - Maintain indicator until API response (success or error)
    - _Requirements: 9.3_
    - **Validation**: `npm run test -- --run packages/frontend`

  - [ ] 14.5 Implement XSS encoding utility for user-provided text rendering
    - Create `packages/frontend/src/utils/sanitize.ts`
    - Entity-escape HTML special characters: `<`, `>`, `"`, `'`, `&`
    - Apply encoding to all user-provided text before DOM rendering
    - _Requirements: 13.4_
    - **Validation**: `npm run test -- --run packages/frontend`

  - [ ]* 14.6 Write property test for XSS encoding (Property 15)
    - **Property 15: XSS Encoding Safety**
    - **Validates: Requirements 13.4**
    - Create `packages/frontend/src/__tests__/sanitize.property.test.ts`
    - Generate arbitrary strings with HTML/XSS payloads via fast-check
    - Assert: output never contains unescaped `<script>`, `<img`, `onerror`, etc.

- [ ] 15. Frontend — Review Interface
  - [ ] 15.1 Implement ReviewPanel with side-by-side comparison (original text + proposed care plan)
    - Create `packages/frontend/src/pages/ReviewPanel.tsx`
    - Left panel: original customer request text
    - Right panel: proposed care plan organized by section (pet info, services, schedules, medications, flags, special instructions)
    - Display extraction result showing what AI extracted
    - Display uncertain fields with visual indicator + text label (not color alone)
    - Show summary count of uncertain fields at top
    - _Requirements: 7.1, 7.2, 15.1-15.4_
    - **Validation**: `npm run test -- --run packages/frontend`

  - [ ] 15.2 Implement attention flag display with severity indicators and explainability
    - Add attention flag section to ReviewPanel
    - Visual severity indicators: HIGH (red icon + text), MEDIUM (orange icon + text), LOW (blue icon + text) — distinguishable without color alone (use icons + labels)
    - Each flag shows: title, severity badge, explanation (1-3 sentences), source text quote
    - Click/expand to show explanation and source text together
    - _Requirements: 5.3, 7.7_
    - **Validation**: `npm run test -- --run packages/frontend`

  - [ ] 15.3 Implement care plan editing and approve/reject actions
    - Add inline editing for text, numeric, and date fields in proposed care plan
    - Apply same validation rules to edited values (client-side Zod validation)
    - Show inline validation error on invalid edits, prevent approval until resolved
    - Approve button: POST /api/care-plans with status "approved", show confirmation
    - Reject button: discard plan, navigate back to IntakeForm with original text pre-populated
    - _Requirements: 7.3, 7.4, 7.5, 7.6, 7.8_
    - **Validation**: `npm run test -- --run packages/frontend`

- [ ] 16. Frontend — History and Error Handling
  - [ ] 16.1 Implement HistoryList and CarePlanDetail views
    - Create `packages/frontend/src/pages/HistoryList.tsx`
    - Fetch GET /api/care-plans, display list with pet name, service type, status, date
    - Sort by most recent first
    - Empty state: message + CTA to intake when no care plans exist
    - Create `packages/frontend/src/pages/CarePlanDetail.tsx`
    - Fetch GET /api/care-plans/{id}, display full stored care plan
    - Handle 404: display "Care plan not found" message
    - _Requirements: 16.1-16.4, 9.5_
    - **Validation**: `npm run test -- --run packages/frontend`

  - [ ] 16.2 Implement ErrorBoundary and error state handling
    - Create `packages/frontend/src/components/ErrorBoundary.tsx`
    - Catch rendering errors, display user-friendly message with correlation ID
    - API error handling: display error message + actionable next step (retry or return to intake)
    - Timeout (504): "Processing took too long. Please try again." + Retry button, preserve text
    - Bedrock unavailable (503): "Service temporarily unavailable" + Retry button
    - DynamoDB unreachable: "Unable to save right now" + preserve care plan in session storage
    - Throttled (429): "Too many requests. Please wait a moment."
    - _Requirements: 9.4, 14.1-14.6_
    - **Validation**: `npm run test -- --run packages/frontend`

  - [ ] 16.3 Implement responsive layout and accessibility polish
    - Ensure all views render usably on 768px-1920px widths without horizontal scroll
    - Add ARIA labels to all interactive elements
    - Keyboard navigation for all buttons, links, form controls
    - Verify 4.5:1 contrast ratio for normal text
    - Add skip-to-content link
    - Test with axe-core (install `@axe-core/react` for development)
    - _Requirements: 9.2, 9.6_
    - **Validation**: `npm run test -- --run packages/frontend` (axe-core assertions in component tests)

- [ ] 17. Frontend — Build and Deploy to S3/CloudFront
  - [ ] 17.1 Build frontend and deploy to S3, invalidate CloudFront
    - Run `npm run build` in packages/frontend
    - Sync `dist/` to S3 bucket via AWS CLI: `aws s3 sync dist/ s3://petops-ai-frontend-253881689673/ --delete`
    - Create CloudFront invalidation: `aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"`
    - Verify full app loads at `https://petops-ai.usmissionhero.com/`
    - Verify client-side routing works (direct URL to /demo, /app)
    - _Requirements: 10.5, 12.1, 12.2_
    - **Validation**: `curl -s https://petops-ai.usmissionhero.com/ | grep "PetOps AI"` and manual browser check

- [ ] 18. Checkpoint - Full application deployed end-to-end
  - Ensure frontend deployed, all routes work, API integration functional, demo scenarios produce care plans. Ask the user if questions arise.

- [ ] 19. Integration Testing
  - [ ]* 19.1 Write integration tests for live Bedrock extraction (curated scenarios)
    - Create `packages/backend/src/__tests__/integration/bedrock-extraction.integration.test.ts`
    - Test Bentley scenario (boarding + medication + behavioral) → verify schema conformance
    - Test Luna scenario (grooming + allergy) → verify schema conformance
    - Test Cooper scenario (boarding + vaccination timing) → verify schema conformance
    - Mark as integration tests (separate Vitest config, not run on every commit)
    - _Requirements: 2.1-2.8, 12.4-12.6_

  - [ ]* 19.2 Write integration tests for DynamoDB CRUD operations
    - Create `packages/backend/src/__tests__/integration/dynamodb-crud.integration.test.ts`
    - Test: create care plan → retrieve by ID → verify round-trip
    - Test: create multiple → list recent → verify ordering
    - Test: get non-existent ID → 404
    - Use real DynamoDB table (or DynamoDB Local for CI)
    - _Requirements: 8.1-8.5, 16.1-16.3_

  - [ ]* 19.3 Write end-to-end API flow tests
    - Create `packages/backend/src/__tests__/integration/e2e-flow.integration.test.ts`
    - Test full pipeline: submit text → extract → validate-and-flag → approve → retrieve
    - Verify correlation ID propagates through all stages
    - Verify error responses include correlation ID
    - _Requirements: 14.6, 17.4_

- [ ] 20. Documentation and Security
  - [ ] 20.1 Create SECURITY.md and update README
    - Create `SECURITY.md`: threat model summary, security controls implemented, out-of-scope items, responsible disclosure
    - Update `README.md`: setup instructions, architecture overview, testing commands, deployment steps, demo URL
    - Include fresh-clone instructions: `git clone → npm install → configure AWS → terraform apply → npm run build → deploy`
    - _Requirements: 11.3, 13.1-13.10_
    - **Validation**: Follow fresh-clone steps on clean environment

  - [ ] 20.2 Final deployment verification and cleanup
    - Run full test suite: `npm run test -- --run`
    - Run `terraform plan` to verify no drift
    - Verify demo URL works end-to-end with all three scenarios
    - Verify landing page → demo → intake → extract → review → approve → history flow
    - Check CloudWatch logs show correlation IDs
    - Remove any temporary/debug code
    - _Requirements: 12.1-12.8, 17.1-17.4_
    - **Validation**: Full manual walkthrough of demo flow at live URL

- [ ] 21. Final Checkpoint - Feature freeze ready
  - All tests pass, documentation complete, live demo functional, security review done. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at natural breakpoints
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests (Phase 19) are separated from deterministic tests and run against live AWS services
- Vertical Slice A (Tasks 2.1-2.7) deploys infrastructure WITHOUT custom domain — proves Terraform workflow works
- Vertical Slice B (Tasks 3.1-3.2) adds custom domain — does NOT block feature development
- Frontend work (Phases 14-17) can begin in parallel with backend work (Phases 5-12) after shared schemas (Phase 4/5) are complete
- Phases 5-7 (deterministic logic) do NOT require Bedrock and can proceed independently of Phase 9
- Bedrock invocation permissions will be verified with a minimal smoke test during Phase 9
- All code uses TypeScript with shared Zod schemas between frontend and backend
- AWS account safeguard: both `allowed_account_ids` and caller-identity precondition (defense in depth)


## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2", "2.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.5", "2.6"] },
    { "id": 3, "tasks": ["2.7"] },
    { "id": 4, "tasks": ["3.1", "5.1"] },
    { "id": 5, "tasks": ["3.2", "5.2", "5.3"] },
    { "id": 6, "tasks": ["5.4", "6.1", "14.1"] },
    { "id": 7, "tasks": ["6.2", "6.3", "14.2"] },
    { "id": 8, "tasks": ["7.1", "14.3", "14.4", "14.5"] },
    { "id": 9, "tasks": ["7.2", "9.1", "10.1", "14.6"] },
    { "id": 10, "tasks": ["9.2", "10.2", "11.1", "15.1"] },
    { "id": 11, "tasks": ["11.2", "12.1", "15.2", "15.3"] },
    { "id": 12, "tasks": ["16.1", "16.2", "16.3"] },
    { "id": 13, "tasks": ["17.1"] },
    { "id": 14, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 15, "tasks": ["20.1", "20.2"] }
  ]
}
```

### Vertical Slice Milestones

**Vertical Slice A (Infrastructure Proof)** — Tasks 2.1-2.7:
- Terraform baseline, S3, CloudFront (default hostname), API Gateway, Lambda stubs, DynamoDB, Budget, CloudWatch
- Validates: terraform workflow works, AWS account safeguard effective, basic infrastructure operational
- URL: CloudFront default *.cloudfront.net hostname

**Vertical Slice B (Branded Demo Foundation)** — Tasks 3.1-3.2:
- ACM certificate, Route 53 DNS, custom domain wired to CloudFront
- Validates: petops-ai.usmissionhero.com resolves, SPA routing works, /api/* proxies to API Gateway
- URL: https://petops-ai.usmissionhero.com/

DNS/ACM timing does NOT block Vertical Slice A or any subsequent feature work.
