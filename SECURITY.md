# Security

## Trust Boundaries

PetOps AI enforces a strict trust boundary between untrusted inputs and operational processing:

```
UNTRUSTED                    TRUST BOUNDARY                    TRUSTED
─────────────────────────────────────────────────────────────────────
Customer text         →      API Gateway (throttle, size)  →   Validated Request
                             Zod schema validation
                                    ↓
AI Model Output       →      Bedrock Structured Outputs    →   Schema-constrained JSON
                             Local Zod validation (defense in depth)
                                    ↓
                             Deterministic business rules   →   Validated Extraction
                             Operational attention detection →   Flagged Result
                                    ↓
                             Human Review (approve/reject)  →   Operational Record
```

### AI Output is Untrusted

Even with Bedrock Structured Outputs constraining the model's JSON schema, all AI-generated content is:
- Validated locally with Zod before any downstream processing
- Never executed as code
- Never used for medical/veterinary determinations
- Always subject to human review before becoming operational

## Product/Safety Boundary

PetOps AI is an **operations assistant**, NOT a veterinary or medical system.

The system does NOT:
- Assess medication interactions or compatibility
- Determine veterinary eligibility for services
- Provide medical safety determinations
- Infer jurisdiction-specific vaccination requirements
- Make clinical claims of any kind

The system DOES:
- Identify information gaps in owner-provided instructions
- Flag conflicting or ambiguous instructions
- Compare explicitly stated dates (e.g., vaccination expiration vs. service period)
- Organize owner-provided information for staff operational use

## Security Controls

### Infrastructure
- **Private S3 bucket**: Block Public Access enabled, OAC-only access
- **HTTPS only**: CloudFront enforces redirect-to-HTTPS
- **IAM least privilege**: Each Lambda has a dedicated role scoped to specific resources
- **Account safeguard**: Terraform rejects deployment to wrong AWS account

### API Protection
- **CORS**: Restricted to `https://petops-ai.usmissionhero.com`
- **Throttling**: API Gateway burst=10, sustained rate=5 requests/sec
- **Request size**: 10KB maximum body (enforced in Lambda)
- **Input validation**: All request bodies validated with Zod schemas before processing

### AI/Bedrock
- **Server-side only**: Bedrock invocations happen exclusively in Lambda, never from browser
- **No credentials in frontend**: AWS SDK not bundled in browser code
- **Output token limit**: max_tokens=2048 bounds generation cost
- **Single retry**: At most one automatic retry for transient errors

### Data
- **Fictional only**: All demo data is synthetic — no real customers or pets
- **No PII**: No real personal information is stored
- **DynamoDB access**: Scoped to specific table and GSI operations

### Logging
- **14-day retention**: CloudWatch logs auto-expire
- **Correlation IDs**: Structured JSON logging for traceability
- **No sensitive data**: Logs do not contain credentials or secrets

### Credentials/Secrets
- **No secrets in source**: Repository contains no credentials, keys, or tokens
- **Terraform state**: Remote S3 with encryption, not committed to git
- **.gitignore**: Blocks .env, *.tfstate, .terraform/, *.tfvars

## IAM Scope

| Lambda | Permissions |
|--------|------------|
| petops-ai-health | CloudWatch logs only |
| petops-ai-extract-intake | Bedrock InvokeModel (Claude Haiku 4.5 inference profile + foundation model ARNs for cross-region routing), CloudWatch logs |
| petops-ai-validate-and-flag | CloudWatch logs only |
| petops-ai-care-plan-crud | DynamoDB GetItem/PutItem/Query/UpdateItem on care-plans table + GSI, CloudWatch logs |

**Note**: The extract-intake Lambda requires `bedrock:InvokeModel` on `arn:aws:bedrock:*::foundation-model/anthropic.claude-haiku-4-5-20251001-v1:0` because the US cross-region inference profile routes to multiple AWS regions. This is the minimum permission scope required for cross-region inference to function.

## Known Demo Limitations

- No authentication (intentional for hackathon judge access)
- API throttling is not a guaranteed hard cost ceiling (budget alerts provide the actual boundary)
- No rate limiting per-user (no user concept exists)
- DynamoDB data is not encrypted with a customer-managed key (uses AWS-managed encryption)
- No WAF rules (acceptable for hackathon demo load)

## Dependency Management

- AWS SDK v3.1106.0 bundled with Lambda (not relying on potentially outdated Lambda runtime SDK)
- All dependencies installed from npm with lockfile committed
- No known critical vulnerabilities at time of deployment

## Responsible Disclosure

For security concerns related to this hackathon project, contact the repository owner through GitHub.
