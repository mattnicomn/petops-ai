---
inclusion: fileMatch
fileMatchPattern: "**/*.{ts,tsx,js,jsx}"
---

# Coding Standards

## Language & Runtime

- TypeScript for all application code (frontend and backend).
- Strict TypeScript configuration (strict: true, no implicit any).
- Target ES2020+ for Lambda (Node.js 20.x runtime).
- React 18+ with functional components and hooks.

## Code Organization

- `web/` — React frontend (Vite)
- `backend/` — Lambda handlers and business logic
- `shared/` — Shared types, schemas, and interfaces
- `infrastructure/` — Terraform configurations

## Conventions

- Use named exports over default exports.
- Prefer `interface` over `type` for object shapes.
- Use Zod for runtime schema validation (shared between frontend/backend).
- Colocate tests with source files (`*.test.ts` alongside `*.ts`).
- Use descriptive variable names; avoid abbreviations.
- Handle errors explicitly — no silent catches.
- Log with structured JSON (correlation ID, operation, result).

## React Patterns

- Functional components only (no class components).
- Custom hooks for shared logic.
- Props interfaces defined adjacent to component.
- Accessible markup: semantic HTML, ARIA attributes where needed, keyboard navigation.
- Loading/error/empty states for all async operations.

## API Design

- RESTful HTTP endpoints via API Gateway.
- Request/response schemas defined in shared/ using Zod.
- All inputs validated before processing.
- Structured error responses: `{ error: string, details?: object }`.
- Correlation ID header propagated through all requests.

## Git Practices

- Commits should be atomic and descriptive.
- Branch naming: `feature/`, `fix/`, `docs/`, `infra/`.
- Never commit .env, .tfstate, credentials, or node_modules.
