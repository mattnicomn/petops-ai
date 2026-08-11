# Implementation Plan: PetOps AI Platform

## Overview

This plan implements the PetOps AI platform as an early deployed vertical slice, prioritizing live infrastructure before feature completeness.

**Language**: TypeScript (frontend and backend)
**Deadline**: August 21, 2026 (feature freeze)
**AWS Account**: 253881689673 (us-east-1)
**Status**: SUBMITTED — Hackathon entry complete. Tag: `hackathon-submission-2026-08-10`

## Tasks

- [x] 1. Project Setup and Monorepo Structure
  - [x] 1.1 Initialize monorepo with package.json, TypeScript config, and tooling
  - [x] 1.2 Configure Vitest and fast-check testing infrastructure

- [x] 2. Terraform Core Infrastructure — Vertical Slice A
  - [x] 2.1 Configure Terraform backend and provider with account safeguard
  - [x] 2.2 Create S3 bucket and CloudFront distribution for SPA hosting
  - [x] 2.3 Create API Gateway HTTP API with CORS and throttling
  - [x] 2.4 Create DynamoDB table with GSI
  - [x] 2.5 Create Lambda functions with IAM roles
  - [x] 2.6 Create CloudWatch log groups and AWS Budget
  - [x] 2.7 Deploy Vertical Slice A and verify via CloudFront default hostname

- [x] 3. Terraform — Vertical Slice B (Branded Demo Foundation)
  - [x] 3.1 Configure ACM certificate and Route 53 DNS for custom domain
  - [x] 3.2 Deploy Vertical Slice B and verify branded URL

- [x] 4. Checkpoint — Vertical slices deployed ✓

- [x] 5. Shared Zod Schemas
  - [x] 5.1 Implement core data model schemas (ExtractionResult, PetInfo, ServiceRequest)
  - [x] 5.2 Implement validation and attention flag schemas
  - [x] 5.3 Implement care plan and API request/response schemas

- [x] 6. Backend — Deterministic Validation Layer
  - [x] 6.1 Implement input validation (request body, text length, whitespace)
  - [x] 6.2 Implement business rule validation (date ranges, required fields per service type)
  - [x] 6.3 Write property tests for input validation ✓
  - [x] 6.4 Write property tests for business rule validation (determinism, date ranges) ✓

- [x] 7. Backend — Attention Detection and Explainability
  - [x] 7.1 Implement attention flag detection (medication gaps, vaccination timing, behavioral, allergy)
  - [x] 7.2 Implement explainability module (evidence-based explanations, source text references)
  - [x] 7.3 Write unit tests for attention detection (15 tests) ✓

- [x] 8. Backend — Care Plan Assembly
  - [x] 8.1 Implement care plan assembly (sections, medication timeline, missing field placeholders)
  - [x] 8.2 Write unit tests for care plan assembly (10 tests) ✓
  - [x] 8.3 Write property tests for assembly invariants (structure, uncertainty count) ✓

- [x] 9. Checkpoint — Deterministic logic complete ✓

- [x] 10. Backend — Bedrock AI Extraction Integration
  - [x] 10.1 Implement extract-intake Lambda with Bedrock Converse API + Structured Outputs
  - [x] 10.2 Resolve Structured Outputs / Lambda SDK serialization issue (bundle SDK v3.1106.0)
  - [x] 10.3 Verify Structured Outputs works with cross-region inference profile

- [x] 11. Backend — Validate-and-Flag Lambda Handler
  - [x] 11.1 Implement validate-and-flag Lambda (orchestrating validation + detection + assembly)

- [x] 12. Backend — CRUD Lambda (DynamoDB Operations)
  - [x] 12.1 Implement care-plan-crud Lambda (create, get by ID, list recent)

- [x] 13. Backend — Deploy All Lambda Code
  - [x] 13.1 Build pipeline (esbuild → 4 Lambda bundles)
  - [x] 13.2 Deploy all handlers via Terraform
  - [x] 13.3 Verify end-to-end: extract → validate → persist → retrieve

- [x] 14. Checkpoint — Backend complete and deployed ✓

- [x] 15. Frontend — React Scaffold and Core UI
  - [x] 15.1 Initialize React + Vite + TypeScript with routing
  - [x] 15.2 Implement LandingPage and DemoShowcase
  - [x] 15.3 Implement IntakeForm with character counter and demo scenario buttons
  - [x] 15.4 Implement loading states during extraction

- [x] 16. Frontend — Review Interface
  - [x] 16.1 Implement ReviewPanel (side-by-side comparison, edit, approve/reject)
  - [x] 16.2 Implement attention flag display with severity indicators
  - [x] 16.3 Implement approve/reject actions with DynamoDB persistence

- [x] 17. Frontend — History and Error Handling
  - [x] 17.1 Implement HistoryList and CarePlanDetail views
  - [x] 17.2 Implement error states and retry behavior
  - [x] 17.3 Responsive layout and accessibility (ARIA labels, keyboard nav, contrast)

- [x] 18. Frontend — Build and Deploy
  - [x] 18.1 Build frontend and deploy to S3
  - [x] 18.2 CloudFront invalidation
  - [x] 18.3 Verify SPA routing, API integration, all demo scenarios

- [x] 19. Checkpoint — Full application deployed end-to-end ✓

- [x] 20. Guided Intake Enhancement (product feedback)
  - [x] 20.1 Add Requirement 19 to spec (Guided Intake Mode)
  - [x] 20.2 Implement guided-intake data/configuration
  - [x] 20.3 Implement GuidedIntake page with Live Care Plan
  - [x] 20.4 Implement guided-mapper (state → ExtractionResult contract)
  - [x] 20.5 Add "Other" option with bounded text input
  - [x] 20.6 Write mapper tests (11 tests) ✓
  - [x] 20.7 Deploy and validate Cooper guided workflow end-to-end

- [x] 21. Engineering Hardening
  - [x] 21.1 Unit tests for business rules (8 tests)
  - [x] 21.2 Unit tests for input validation (9 tests)
  - [x] 21.3 Unit tests for attention detection (15 tests)
  - [x] 21.4 Unit tests for care plan assembly (10 tests)
  - [x] 21.5 Property-based tests (input validation, business rules, assembly invariants — 9 tests)
  - [x] 21.6 Guided mapper tests (11 tests)
  - [x] 21.7 SECURITY.md
  - [x] 21.8 GitHub Actions CI workflow
  - [x] 21.9 Terraform fmt/validate compliance
  - [x] 21.10 npm audit (0 vulnerabilities)

- [x] 22. CloudFront/CORS Hardening
  - [x] 22.1 AllViewerExceptHostHeader origin request policy for /api/*
  - [x] 22.2 CachingDisabled cache policy for API behavior
  - [x] 22.3 Remove global 404 custom error response (retain 403 for SPA)
  - [x] 22.4 Verify CORS preflight through custom domain

- [x] 23. Documentation and Judge Presentation
  - [x] 23.1 README maturation (architecture, Kiro usage, setup, testing, cost)
  - [x] 23.2 Demo video script (docs/demo-video-script.md)
  - [x] 23.3 Hackathon submission index (docs/HACKATHON-SUBMISSION.md)
  - [x] 23.4 PROJECT-STATUS and TRACEABILITY updates
  - [x] 23.5 Landing page and demo page judge-facing polish

- [x] 24. Final Submission
  - [x] 24.1 Record demo video ✓
  - [x] 24.2 Upload video to YouTube ✓
  - [x] 24.3 Complete hackathon submission form ✓
  - [x] 24.4 Submission closeout documentation ✓
  - [x] 24.5 Final deployment health check ✓
  - [x] 24.6 Create annotated Git tag: hackathon-submission-2026-08-10 ✓

## Summary

**Total tests**: 62 (42 unit + 9 property + 11 mapper)
**Requirements**: 17 Verified / 1 Implemented / 1 Deferred
**Infrastructure**: 22+ AWS resources via Terraform
**Feature freeze**: Commit c4b6167
