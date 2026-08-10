# ADR-002: React + Vite Frontend

## Status
Accepted

## Date
2026-08-09

## Context
The application needs a responsive web interface supporting desktop and tablet viewports (768px–1920px). It must handle async operations (AI extraction, validation), display complex review interfaces, and provide accessible interactive elements.

## Decision
Use React 18+ with Vite as the build tool. TypeScript for type safety. Single-page application architecture with client-side routing.

## Alternatives Considered

### Next.js
- Pros: SSR, file-based routing, built-in API routes
- Cons: Overkill for SPA with separate API, adds complexity, SSR unnecessary for this app

### Svelte/SvelteKit
- Pros: Smaller bundle, less boilerplate
- Cons: Smaller ecosystem, less library support for complex forms/accessibility

### Vanilla JS / HTMX
- Pros: No build step, simple
- Cons: Complex review interface would be painful without component model

## Consequences
- Fast development with established React patterns
- Rich ecosystem for accessibility, forms, state management
- Vite provides fast HMR during development
- Static build output deploys directly to S3/CloudFront
- TypeScript ensures type safety between frontend and shared schemas

## Traceability
- Supports: Requirement 9 (Responsive UI), Requirement 7 (Review Interface)
