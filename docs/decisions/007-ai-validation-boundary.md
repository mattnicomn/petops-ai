# ADR-007: AI Validation Boundary — AI Output as Untrusted Input

## Status
Accepted

## Date
2026-08-09 (revised after planning review)

## Context
The system uses AI (Bedrock) to extract structured data from unstructured text. AI models can produce malformed output, hallucinate fields, or return unexpected structures. Even with Bedrock Structured Outputs enforcing JSON schema compliance at the model level, the system must be resilient to any AI output anomaly.

## Decision
Establish a strict validation boundary between AI extraction and all downstream processing. AI output is treated as untrusted external input regardless of whether Bedrock Structured Outputs are enabled:

1. **Bedrock Structured Outputs** (first layer): JSON schema constraint at model level — reduces but does not eliminate malformed output risk
2. **Zod schema validation** (second layer): Local runtime validation ensuring structure, types, required fields
3. **Business rule validation**: Deterministic checks (date logic, required fields per service type)
4. **Operational attention detection**: Deterministic rules identifying information gaps/conflicts in owner-provided instructions
5. **Care plan generation**: Operates only on validated, schema-conforming data

If AI output fails local schema validation, it is rejected entirely and the user is offered retry.

## Product/Safety Boundary

PetOps AI is an operations/intake assistant, not a veterinary diagnostic or medication-safety system.

The system does NOT:
- Assess medication interactions or compatibility
- Determine veterinary eligibility for services
- Provide medical safety determinations
- Infer jurisdiction-specific vaccination requirements

The system DOES:
- Identify information gaps in owner-provided care instructions
- Flag conflicting or ambiguous instructions
- Compare explicitly stated dates (e.g., vaccination expiration vs. service period)
- Organize owner-provided information for staff operational use

## Trust Pipeline

```
UNTRUSTED                    TRUST BOUNDARY                    TRUSTED
─────────────────────────────────────────────────────────────────────
Customer Input (text)  →     API Schema Validation (Zod) →    Validated Request
                                    ↓
                             Bedrock Structured Output    →    Schema-constrained JSON
                             (model-level enforcement)
                                    ↓
AI Output (JSON)       →     Local Zod Validation         →    Validated Extraction
                                    ↓
                             Business Rule Validation     →    Rule-checked Extraction
                             (deterministic)
                                    ↓
                             Operational Attention        →    Flagged Extraction
                             Detection (deterministic)
                                    ↓
                             Care Plan Assembly           →    Proposed Plan
                             (deterministic)
                                    ↓
                             Human Review                 →    Approved/Rejected
                                    ↓
                             Record Storage               →    Operational Record
```

## Consequences
- Defense in depth: structured outputs + local validation + business rules
- System never processes malformed AI output
- Validation logic is deterministic and testable (unit tests with fixed inputs)
- AI failures are surfaced to users gracefully
- No cascading errors from unexpected AI behavior
- Clear separation: AI does extraction, code does validation and flagging
- Enables testing without needing AI in the loop (mock extraction results)

## Traceability
- Supports: Requirement 3 (Validation), Requirement 4 (Attention Detection), Requirement 13 (Security), Requirement 14 (Failure Handling)
