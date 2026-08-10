# PetOps AI

AI-powered operations assistant for pet-care businesses.

**Live Demo**: https://petops-ai.usmissionhero.com/

**🎬 Hackathon Demo Video**: [Watch the judging demo](https://www.youtube.com/watch?v=C4zRCx_ZyMw)
**📹 Extended Technical Walkthrough**: [Watch the extended demo](https://www.youtube.com/watch?v=rcYxXv5sq98)

## What It Does

PetOps AI transforms unstructured customer requests (phone calls, texts, emails, free-form notes) into structured, validated care plans through responsible AI with human-in-the-loop review.

**The problem**: Pet-care staff receive critical instructions in unstructured forms. Important details — medications, behavioral concerns, vaccination timing — get overlooked or misinterpreted.

**The solution**: AI extracts structured information, deterministic rules validate and flag operational concerns, and staff review/approve before anything becomes operational.

## Quick Judge Walkthrough

1. Visit https://petops-ai.usmissionhero.com/
2. Click **"Try the Demo"**
3. **AI Quick Intake**: Select the **Bentley** scenario → "Analyze Request" → review AI extraction
4. **Guided Intake**: Click "Start Guided Intake" → pick Cooper → Full Groom → answer questions → watch the Live Care Plan build
5. Both paths → Review panel with attention flags → **Approve** → saved to history

No account creation, setup, or credentials required.

## Two Intake Modes, One Trust Pipeline

| Mode | Input Method | AI Involvement | Pipeline |
|------|-------------|----------------|----------|
| AI Quick Intake | Natural language text | Bedrock Structured Outputs | extract → validate → flags → plan → review |
| Guided Intake | Contextual questions + selections | None (deterministic mapper) | map → validate → flags → plan → review |

Both converge into the same deterministic validation → attention detection → care plan assembly → human review → DynamoDB persistence. The competitive story: *"Natural language or guided questions — one trusted operational pipeline."*

## Architecture

```
Customer Text → API Gateway (throttled, CORS)
    → Lambda (extract-intake)
        → Bedrock Claude Haiku 4.5 (Structured Outputs)
        → Local Zod Validation (defense in depth)
    → Lambda (validate-and-flag)
        → Deterministic Business Rules
        → Operational Attention Detection
        → Care Plan Assembly
    → React Review Interface
        → Human Approve/Reject
    → Lambda (care-plan-crud)
        → DynamoDB Persistence
```

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript |
| API | Amazon API Gateway HTTP API |
| Compute | AWS Lambda (Node.js 20) |
| AI | Amazon Bedrock (Claude Haiku 4.5, Structured Outputs) |
| Data | Amazon DynamoDB (on-demand) |
| Hosting | Amazon S3 + CloudFront (private bucket, OAC) |
| DNS/TLS | Route 53 + ACM |
| IaC | Terraform |
| Budget | $10/month with alerts |

### AI Trust Pipeline

AI output is treated as **untrusted external input** even with Bedrock Structured Outputs enabled:

1. **Bedrock Structured Outputs** — constrains model to JSON schema at generation time
2. **Local Zod validation** — defense in depth, rejects malformed output
3. **Deterministic business rules** — date logic, required fields per service type
4. **Operational attention detection** — medication gaps, vaccination timing, behavioral concerns
5. **Human review** — staff always approve/reject before care plan becomes operational

### Product Safety Boundary

PetOps AI organizes and flags owner-provided care instructions. It does **NOT** provide veterinary diagnosis, medication-compatibility advice, or medical safety assessments. All attention flags identify operational information gaps or conflicts — never clinical determinations.

## How Kiro Was Used

This project demonstrates authentic specification-driven development using [Kiro](https://kiro.dev) as the primary AI engineering environment.

### Specification-First Development
- **Project steering** ([`.kiro/steering/`](.kiro/steering/)): Product vision, coding standards, Terraform conventions, AI safety principles established before any implementation
- **Formal requirements** ([`.kiro/specs/petops-ai-platform/requirements.md`](.kiro/specs/petops-ai-platform/requirements.md)): 18 requirements with EARS-format acceptance criteria, reviewed and corrected through iterative planning
- **Technical design** ([`.kiro/specs/petops-ai-platform/design.md`](.kiro/specs/petops-ai-platform/design.md)): Full architecture, API contracts, data models, correctness properties
- **Implementation tasks** ([`.kiro/specs/petops-ai-platform/tasks.md`](.kiro/specs/petops-ai-platform/tasks.md)): Dependency-ordered task plan with validation commands

### Meaningful Kiro Contributions

**Safety boundary correction**: During an independent architecture review, the proposed "medication interaction detection" requirement was challenged as a clinical claim beyond the product's operational scope. Kiro then incorporated that feedback systematically — updating requirements, safety boundaries, ADRs, steering, and the implementation plan before coding began. This demonstrates Kiro supporting iterative, review-driven specification refinement.

**Bedrock Structured Outputs debugging**: Kiro diagnosed that the Lambda runtime's built-in AWS SDK lacked `outputConfig.textFormat` serialization support. The fix — bundling SDK v3.1106.0 in the deployment package — resolved the issue and proved Structured Outputs work correctly with cross-region inference profiles.

**CloudFront API 404 fix**: Kiro identified that CloudFront's global custom error response (404 → index.html) was intercepting API 404 responses intended for the frontend. The fix — removing the 404 rewrite and relying on 403-only for S3/OAC SPA routing — resolved the behavioral conflict.

**Architecture decisions** ([`docs/decisions/`](docs/decisions/)): 7 ADRs documenting serverless choice, DynamoDB, Bedrock model selection, Terraform, authentication-free demo, and AI validation boundary.

## Local Development

### Prerequisites
- Node.js 20+
- AWS CLI configured (profile with Bedrock + DynamoDB access)
- Terraform 1.10+

### Install
```bash
git clone https://github.com/mattnicomn/petops-ai.git
cd petops-ai
npm install
```

### Build
```bash
# Backend Lambda handlers
cd packages/backend && node build.mjs

# Frontend
cd packages/frontend && npx vite build
```

### Test
```bash
# All automated tests (62 deterministic + property + mapper tests)
npx vitest --run

# TypeScript check
cd packages/backend && npx tsc --noEmit
cd packages/frontend && npx tsc --noEmit
```

### Local Frontend Dev
```bash
cd packages/frontend
npx vite  # serves on localhost:5173 with /api proxy
```

## AWS Deployment

### Account Guard
Terraform is configured with `allowed_account_ids = ["253881689673"]` and an explicit caller-identity precondition. Deployment fails if the active AWS identity does not belong to the approved account.

### Terraform
```bash
cd infrastructure/terraform
terraform init
terraform validate
terraform plan -var="budget_alert_email=your@email.com"
terraform apply -var="budget_alert_email=your@email.com"
```

### Frontend Deploy
```bash
cd packages/frontend && npx vite build
aws s3 sync dist/ s3://petops-ai-frontend-253881689673/ --delete
aws cloudfront create-invalidation --distribution-id E368MC43CWVODO --paths "/*"
```

## Testing

- **62 automated tests** covering business rules, input validation, attention detection, care plan assembly, property invariants, and guided intake mapping
- Tests verify the operational safety boundary (no clinical claims, no medication interactions)
- Property-based tests (fast-check) verify broad invariants: determinism, no-throw guarantees, length bounds
- Guided mapper tests verify correct conversion from structured questions to extraction contract
- Live Bedrock tests are separated and not required for normal development

## Cost

- Serverless architecture: zero cost when idle
- $10/month AWS Budget with alerts at 50%, 80%, 100%
- Claude Haiku 4.5: ~$0.50/month at demo load (~50 extractions)
- DynamoDB on-demand: ~$0.01/month
- Total estimated: ~$1-2/month under demonstration load

## Security

See [SECURITY.md](SECURITY.md) for the full security model including trust boundaries, IAM scope, and known limitations.

## Known Limitations

- No authentication (hackathon demo — fictional data only)
- Single-pet extraction per request (multi-pet is post-MVP)
- Dates extracted as relative ("Friday through Monday") may need year context
- No skip-to-content accessibility link
- No dark mode
- No PDF/print export
- No offline capability

## License

MIT

---

Built for the **2026 Ready, Spec, Ship Hackathon** sponsored by Kiro.
