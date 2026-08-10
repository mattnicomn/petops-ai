# PetOps AI — Demo Video Script

**Target duration**: 2:45–2:50 (under 3:00 with buffer)

---

## 0:00–0:15 — Problem (15s)

**Screen**: Landing page at https://petops-ai.usmissionhero.com/

**Narration**:
"Pet-care businesses receive critical customer instructions in unstructured forms — phone calls, texts, emails. Important details like medications, behavioral concerns, and vaccination timing get buried in free-form language. Staff must manually interpret every request, and important information gets missed."

---

## 0:15–0:40 — AI Quick Intake: Bentley (25s)

**Screen**: Click "Try the Demo" → select Bentley scenario → show text populating → click "Analyze Request"

**Narration**:
"PetOps AI solves this with AI-powered extraction. Here's a real customer request for Bentley — boarding with medication and behavioral concerns. One click, and Amazon Bedrock's Claude Haiku extracts structured information in seconds."

**Show**: Loading state → extraction result appears → attention flags visible (medication gap, behavioral concern) → proposed care plan with sections

---

## 0:40–1:05 — Guided Intake: Cooper + Live Care Plan (25s)

**Screen**: Navigate to Demo → click "Start Guided Intake" → select Cooper → Full Groom → answer nail-trim question (very anxious) → select chicken allergy → show Live Care Plan updating in real time

**Narration**:
"For front-desk staff who prefer structure over typing, Guided Intake builds the care plan as they answer questions. Watch the Live Care Plan update instantly — no AI call needed. Same operational result, different input method."

**Show**: Live Care Plan panel updating with each selection → behavioral flag appears → allergy appears → Continue to Review

---

## 1:05–1:25 — Shared Trust Pipeline / Human Review (20s)

**Screen**: Review panel showing side-by-side comparison, attention flags, approve button

**Narration**:
"Both paths converge into one trusted pipeline: deterministic validation, operational attention flags, and human-in-the-loop review. AI output is never trusted blindly — it's validated with Zod schemas and business rules before a human approves the care plan."

**Show**: Click approve → confirmation → navigate to history showing stored plan

---

## 1:25–2:20 — Kiro Lifecycle + Engineering Stories (55s)

**Screen**: GitHub repo → .kiro directory → specs → steering → requirements → design → tasks

**Narration**:
"PetOps AI was built entirely with Kiro as the development environment — from specification through deployment."

"Kiro created the initial planning baseline: steering, 19 formal requirements, technical design, and implementation tasks. An independent architecture review then challenged our medication-interaction requirement as too clinical. Kiro incorporated that feedback across every artifact before coding began."

**Show**: requirements.md → safety boundary text → ADR-007

"During implementation, Kiro debugged a real Structured Outputs issue — the Lambda runtime's built-in AWS SDK silently dropped the outputConfig parameter. Kiro instrumented the deployed Lambda, proved the schema wasn't reaching Bedrock, and fixed it by bundling the correct SDK version."

**Show**: extract-intake.ts → Structured Outputs config

"When stakeholder feedback suggested a guided intake mode, Kiro updated the specification, added Requirement 19, and implemented it — reusing the same trust pipeline without creating a second backend."

---

## 2:20–2:45 — Architecture, Quality, Safety (25s)

**Screen**: Architecture diagram (in-app or README)

**Narration**:
"The architecture is fully serverless on AWS — Lambda, API Gateway, DynamoDB, Bedrock, CloudFront — all managed by Terraform with a $10 monthly budget. 62 automated tests verify business rules, attention detection, and care-plan assembly. No clinical claims, no fabricated confidence scores, fictional demo data only."

**Show**: Test results → SECURITY.md → budget → Terraform files

---

## 2:45–2:50 — Close (5s)

**Screen**: Landing page

**Narration**:
"PetOps AI. Natural language or guided questions — one trusted operational pipeline. Built with Kiro from spec to ship."

---

## Recording Notes

- Resolution: 1920×1080 or 1280×720
- Browser zoom: 100% (or 90% for more content)
- Clean browser: no bookmarks bar, no personal tabs
- Pre-test both Bentley AI flow and Cooper Guided flow before recording
- Disable notifications
- Fictional data only visible
- No AWS credentials or account IDs on screen
- Pre-open: landing page, GitHub repo, .kiro directory
