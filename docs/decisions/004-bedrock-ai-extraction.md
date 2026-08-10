# ADR-004: Amazon Bedrock Model Selection for AI Extraction

## Status
Accepted

## Date
2026-08-09 (revised after planning review)

## Context
The system needs to extract structured data from unstructured customer requests. This requires natural language understanding capable of identifying entities (pet names, medications, dates, services) and their relationships from free-form text.

## Decision
Use Amazon Bedrock with **Claude Haiku 4.5** via the US inference profile for structured extraction.

### Selected Model
- **Model ID**: `anthropic.claude-haiku-4-5-20251001-v1:0`
- **Inference Profile**: `us.anthropic.claude-haiku-4-5-20251001-v1:0`
- **Lifecycle Status**: ACTIVE
- **Region**: us-east-1 (via US cross-region inference profile)

### Model Selection Analysis

| Model | Status | Cost (input/output per 1K tokens) | Latency | Extraction Quality | Decision |
|-------|--------|-----------------------------------|---------|-------------------|----------|
| Claude Haiku 4.5 | ACTIVE | Lowest tier | Fast | Sufficient for structured extraction | **Selected** |
| Claude Sonnet 4.5/4.6/5 | ACTIVE | ~5-10x Haiku | Moderate | Higher quality but overkill | Fallback if quality insufficient |
| Claude Opus 4.5+ | ACTIVE | ~30-50x Haiku | Slow | Highest quality | Not justified for cost/latency |
| Claude 3 Haiku | LEGACY | Lowest | Fast | Lower quality | Avoid legacy models |

### Rationale
- Haiku 4.5 is the most cost-effective ACTIVE model suitable for structured extraction
- Structured Outputs support ensures schema compliance at the model level
- US inference profile provides regional routing without requiring specific region access
- Extraction task is well-defined (JSON schema output) — does not require reasoning-heavy models
- If extraction quality proves insufficient during implementation, upgrade path is clear (Sonnet 4.5)

### Structured Outputs Strategy
Amazon Bedrock Structured Outputs (GA) constrains model responses to a JSON Schema:
- Use `Converse` API with `outputConfig.textFormat` parameter specifying the Extraction_Result JSON schema
- Schema compiled by Bedrock (first-time compilation may take minutes; cached for 24 hours)
- Supports JSON Schema Draft 2020-12 subset (all basic types, enum, anyOf, allOf, $ref)
- **Limitations**: No recursive schemas, no numerical constraints (min/max), no string length constraints
- Even with structured outputs, local Zod validation remains mandatory (defense in depth)

### Fallback Behavior
If Bedrock Structured Outputs produce a schema compilation error:
1. Log the error with correlation ID
2. Fall back to prompt-based JSON extraction (system prompt with schema instructions)
3. Apply full Zod validation to the unstructured response
4. Reject if validation fails; surface error to user with retry option

## Alternatives Considered

### Self-hosted model (Hugging Face on Lambda)
- Insufficient quality for complex entity extraction; large deployment size; cold start issues

### OpenAI API
- External dependency; data leaves AWS; additional credential management

### AWS Comprehend
- Generic NER insufficient for domain-specific extraction (medications, services, behavioral concerns)

## Consequences
- Pay per token (Haiku 4.5 is the lowest-cost active Anthropic model on Bedrock)
- At ~50 requests/month with structured outputs: estimated <$1/month
- All AI output validated locally against Zod schema regardless of structured output enforcement
- Single AWS account, no external API dependencies
- Model can be upgraded without changing application logic (change inference profile reference)
- First-time schema compilation latency must be handled gracefully (loading indicator)

## Pre-Implementation Requirements
- Verify model access is enabled for `anthropic.claude-haiku-4-5-20251001-v1:0` in the account
- If first-time Anthropic model access requires acceptance of terms, complete that step before first invocation

## Traceability
- Supports: Requirement 2 (Extraction), Requirement 14 (Failure Handling), Requirement 15 (Uncertainty)
