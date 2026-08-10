# Requirements Document

## Introduction

PetOps AI is an AI-powered operations assistant for pet-care businesses. It transforms unstructured customer requests (phone calls, texts, emails, free-form web submissions) into structured, validated care plans through a flagship workflow: intake → AI extraction → deterministic validation → operational attention detection → explainable findings → proposed care plan → human review → operational record.

The system demonstrates responsible AI principles including human-in-the-loop review, explainability, and treating AI output as untrusted input requiring validation. Built as a serverless AWS application for a hackathon demonstration, it requires no account creation and delivers immediate value through pre-built demo scenarios with fictional data.

**Product/Safety Boundary**: PetOps AI organizes and flags owner-provided care instructions for operational staff use. It does NOT provide veterinary diagnosis, treatment recommendations, medication-compatibility advice, or medical safety assessments. All flagging is based on operationally observable information gaps or conflicts in owner-provided instructions.

## Glossary

- **PetOps_System**: The complete PetOps AI platform encompassing frontend, API, compute, data, and AI layers
- **Intake_Module**: The component responsible for receiving unstructured customer requests as text input or pre-built demo scenarios
- **Extraction_Engine**: The AI-powered component using Amazon Bedrock to parse unstructured text into structured data objects
- **Validation_Layer**: The deterministic component that applies schema validation and business rules to extracted data
- **Attention_Detector**: The deterministic component that identifies operational attention flags from validated extraction data — limited to information gaps, conflicts, and date-based observations in owner-provided instructions
- **Explainability_Module**: The component that generates evidence-based reasoning for flagged items
- **Care_Plan_Generator**: The component that produces staff-facing operational care plans from validated and flagged extraction data
- **Review_Interface**: The UI component enabling human operators to view, edit, approve, or reject proposed care plans
- **Record_Store**: The DynamoDB-backed persistence layer for care plan records
- **Demo_Scenario**: A pre-built fictional customer request used to demonstrate system capabilities without real data
- **Care_Plan**: A structured operational document containing pet information, service details, schedules, medications, flags, and staff instructions
- **Extraction_Result**: The structured data object produced by the Extraction_Engine from unstructured input
- **Attention_Flag**: An operational concern identified by the Attention_Detector requiring staff awareness — NOT a clinical or diagnostic finding
- **Customer_Request**: The original unstructured text submitted for processing
- **Uncertainty**: A field classification indicating the extracted value may be incomplete, ambiguous, or require staff verification — defined by explicit conditions

## Requirements

### Requirement 1: Unstructured Customer Request Intake

**User Story:** As a front-desk staff member, I want to submit unstructured customer requests into the system, so that I can begin the structured care plan creation process.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. THE Intake_Module SHALL accept free-form text input of customer requests between 1 and 5000 characters in length and SHALL display a visible character counter showing the current count relative to the 5000-character maximum
2. IF a Customer_Request exceeds 5000 characters, THEN THE Intake_Module SHALL prevent further character entry and SHALL display a validation message indicating the maximum length has been reached
3. THE Intake_Module SHALL provide at least three pre-built Demo_Scenarios covering distinct pet-care situations
4. WHEN a Demo_Scenario is selected, THE Intake_Module SHALL replace any existing content in the text input with the selected scenario content
5. WHEN a Customer_Request is submitted, THE Intake_Module SHALL pass the text to the Extraction_Engine for processing
6. IF a Customer_Request is empty or contains only whitespace, THEN THE Intake_Module SHALL display a validation error and prevent submission

### Requirement 2: AI-Powered Structured Extraction

**User Story:** As a front-desk staff member, I want the system to automatically extract structured information from customer requests, so that I do not have to manually parse unstructured text.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. WHEN a Customer_Request is received, THE Extraction_Engine SHALL extract pet names, species, breeds, ages, and weights when present in the text
2. WHEN a Customer_Request is received, THE Extraction_Engine SHALL extract requested services including boarding, grooming, daycare, and sitting
3. WHEN a Customer_Request is received, THE Extraction_Engine SHALL extract date ranges, check-in times, and check-out times when present in the text
4. WHEN a Customer_Request is received, THE Extraction_Engine SHALL extract medication names, dosages, frequencies, and administration instructions when present in the text
5. WHEN a Customer_Request is received, THE Extraction_Engine SHALL extract allergies, behavioral concerns, feeding instructions, and vaccination information when present in the text
6. WHEN a Customer_Request is received, THE Extraction_Engine SHALL produce an Extraction_Result conforming to a defined JSON schema, constrained via Bedrock Structured Outputs where supported
7. IF the Extraction_Engine cannot determine a value, THEN THE Extraction_Engine SHALL mark the field as uncertain and include it in the Extraction_Result without fabricating a value
8. IF a Customer_Request contains no extractable pet or service information, THEN THE Extraction_Engine SHALL return an Extraction_Result with all fields empty or absent and mark the overall result as incomplete

#### Uncertainty Definition

A field is classified as uncertain when any of these conditions apply:
- The AI model explicitly returns the field as unknown, ambiguous, or absent
- A required field cannot be extracted from the source text
- Conflicting information exists in the source text for the same field
- Local validation cannot resolve the field value
- Date interpretation requires assumptions about relative references (e.g., "next Friday")

### Requirement 3: Deterministic Validation of Extracted Data

**User Story:** As a business owner, I want extracted data to be validated against business rules, so that invalid or inconsistent information is caught before care plan creation.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. WHEN an Extraction_Result is produced, THE Validation_Layer SHALL validate the result against the defined JSON schema using Zod
2. WHEN an Extraction_Result contains a check-out date earlier than the check-in date, THE Validation_Layer SHALL flag the date range as invalid
3. WHEN an Extraction_Result is missing required fields for the requested service type, THE Validation_Layer SHALL identify the missing fields — required fields per service type: boarding requires pet name, check-in date, and check-out date; grooming requires pet name and service date; daycare requires pet name and date; sitting requires pet name and date range
4. THE Validation_Layer SHALL operate deterministically, producing identical output for identical input without dependency on AI inference
5. WHEN validation errors are detected, THE Validation_Layer SHALL produce a structured list of all violations with field paths and human-readable descriptions, reporting all errors exhaustively rather than stopping at the first violation
6. WHEN an Extraction_Result passes all validation checks, THE Validation_Layer SHALL return the Extraction_Result unchanged with a validation status of passed

### Requirement 4: Operational Attention Flag Detection

**User Story:** As a pet-care employee, I want the system to flag operational concerns in owner-provided instructions, so that I can give special attention to items requiring clarification or care.

**Priority:** MUST HAVE

**Safety Boundary:** Attention flags identify operational information gaps and conflicts only. They do NOT represent clinical assessments, veterinary recommendations, or medication-safety determinations.

#### Acceptance Criteria

1. WHEN an Extraction_Result contains medication information with missing schedule, ambiguous frequency, incomplete dosage text, ambiguous route/instructions, contradictory instructions, or duplicate/conflicting entries, THE Attention_Detector SHALL produce an Attention_Flag identifying the specific operational gap
2. WHEN an Extraction_Result contains vaccination expiration information and the stated expiration date falls before or during the requested service period, THE Attention_Detector SHALL produce an Attention_Flag stating "Vaccination information requires staff review because the provided expiration date overlaps the requested service period"
3. WHEN an Extraction_Result contains behavioral concerns (aggression, anxiety, reactivity), THE Attention_Detector SHALL produce an Attention_Flag recommending staff awareness and referencing the specific concern from the owner's instructions
4. WHEN an Extraction_Result contains allergy information, THE Attention_Detector SHALL produce an Attention_Flag identifying each allergen for staff awareness during feeding or treatment
5. THE Attention_Detector SHALL assign a severity level to each Attention_Flag: high for medication instruction gaps that could prevent safe execution of owner instructions, medium for vaccination timing observations and behavioral concerns, and low for allergy awareness
6. WHEN no operational concerns are detected in the Extraction_Result, THE Attention_Detector SHALL produce an empty Attention_Flag list
7. THE Attention_Detector SHALL NOT make clinical claims about medication interactions, veterinary eligibility, or medical safety

### Requirement 5: Explainability of Flagged Items

**User Story:** As a front-desk staff member, I want to understand why the system flagged something, so that I can make informed decisions during review.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. WHEN an Attention_Flag is generated, THE Explainability_Module SHALL produce a concise, evidence-based explanation of 1 to 3 sentences that identifies the triggering data and states the operational concern
2. WHEN an Attention_Flag is generated, THE Explainability_Module SHALL include the relevant text fragment from the Customer_Request that triggered the flag
3. WHEN a user selects an Attention_Flag in the Review_Interface, THE Explainability_Module SHALL display the explanation and the source text together in a single view
4. THE Explainability_Module SHALL produce explanations that are traceable to provided input or a deterministic rule, explicit about uncertainty where it exists, and free from unsupported claims
5. IF the Explainability_Module cannot generate an explanation for an Attention_Flag, THEN THE Review_Interface SHALL display the Attention_Flag with a notice indicating that an explanation is unavailable and present the raw triggering data

### Requirement 6: Care Plan Generation

**User Story:** As a pet-care employee, I want the system to generate a proposed care plan, so that I have a starting point for operational planning.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. WHEN extraction and validation are complete, THE Care_Plan_Generator SHALL produce a proposed Care_Plan containing all extracted pet information, services, schedules, and special instructions
2. THE Care_Plan_Generator SHALL include all Attention_Flags in the proposed Care_Plan, displaying each flag's severity level, explanation, and the referenced source data
3. IF the Extraction_Result contains medication entries, THEN THE Care_Plan_Generator SHALL organize medication schedules into a chronological daily timeline ordered by administration time
4. WHEN the Validation_Layer identifies missing information, THE Care_Plan_Generator SHALL include a labeled placeholder for each missing field
5. THE Care_Plan_Generator SHALL organize the Care_Plan into the following named sections: pet information, services, schedules, medications, attention flags, and special instructions

### Requirement 7: Human-in-the-Loop Review

**User Story:** As a front-desk staff member, I want to review, edit, and approve proposed care plans, so that I maintain control over operational decisions.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. THE Review_Interface SHALL display the original Customer_Request alongside the proposed Care_Plan for comparison
2. THE Review_Interface SHALL display the Extraction_Result showing what the AI extracted from the original text
3. THE Review_Interface SHALL allow the reviewer to edit any text, numeric, or date field in the proposed Care_Plan and SHALL apply the same validation rules to edited values before allowing approval
4. THE Review_Interface SHALL allow the reviewer to approve or reject the proposed Care_Plan via distinct, labeled actions
5. WHEN a reviewer approves a Care_Plan, THE PetOps_System SHALL store the approved Care_Plan in the Record_Store and display a confirmation
6. WHEN a reviewer rejects a Care_Plan, THE PetOps_System SHALL discard the proposed plan, preserve the original Customer_Request text, and navigate the reviewer to the Intake_Module with the original text pre-populated
7. THE Review_Interface SHALL visually highlight Attention_Flags using distinct indicators for each severity level, distinguishable without relying solely on color
8. WHEN a reviewer edits a Care_Plan field and the entered value fails validation, THEN THE Review_Interface SHALL display an inline error message and prevent approval until resolved

### Requirement 8: Operational Record Storage

**User Story:** As a business owner, I want care plan decisions stored persistently, so that staff can reference them during the pet's stay.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. WHEN a Care_Plan is approved, THE Record_Store SHALL persist the complete Care_Plan including original request, extraction result, flags, and final approved content
2. THE Record_Store SHALL assign a unique identifier in UUIDv4 format to each stored Care_Plan record
3. THE Record_Store SHALL record timestamps (createdAt, updatedAt, decisionAt) in ISO 8601 format and the lifecycle status for each Care_Plan record
4. WHEN a stored Care_Plan is requested by identifier, THE Record_Store SHALL return the complete Care_Plan data
5. IF a Care_Plan is requested by an identifier that does not exist, THEN THE Record_Store SHALL return a not-found error

### Requirement 9: Responsive Web User Interface

**User Story:** As a front-desk staff member, I want to use the application on desktop and tablet devices, so that I can process customer requests from the front desk or while walking the facility.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. THE PetOps_System SHALL provide a single-page web application built with React and Vite that loads without full-page refreshes during navigation between views
2. THE PetOps_System SHALL render all interactive elements usably on viewport widths from 768 pixels to 1920 pixels without horizontal scrolling
3. THE PetOps_System SHALL display a loading indicator within 200 milliseconds of initiating AI extraction processing, and SHALL maintain the indicator until the operation completes or fails
4. WHEN an API call returns an HTTP error status, THE PetOps_System SHALL display a user-friendly error message and offer an actionable next step such as retry or return to intake
5. WHEN no Care_Plans exist in the Record_Store, THE PetOps_System SHALL display an empty state view with a call-to-action directing the user to the Intake_Module
6. THE PetOps_System SHALL provide accessible labels, keyboard navigation, and sufficient color contrast (minimum 4.5:1 ratio for normal text) for all interactive elements

### Requirement 10: Serverless AWS Architecture

**User Story:** As a business owner, I want the platform to run on serverless infrastructure, so that costs scale with usage and remain minimal during low-traffic periods.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. THE PetOps_System SHALL use AWS Lambda for all compute operations
2. THE PetOps_System SHALL use Amazon API Gateway HTTP API for all client-server communication
3. THE PetOps_System SHALL use Amazon DynamoDB with on-demand capacity mode for all persistent data storage
4. THE PetOps_System SHALL use Amazon Bedrock for all AI inference operations
5. THE PetOps_System SHALL use Amazon S3 and CloudFront for static frontend hosting
6. THE PetOps_System SHALL operate within a monthly AWS spend target of 10 USD under demonstration load
7. WHEN no requests are being processed, THE PetOps_System SHALL incur no compute charges beyond static hosting and storage baseline costs

### Requirement 11: Infrastructure as Code

**User Story:** As a developer, I want all infrastructure defined as code, so that the environment is reproducible and version-controlled.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. THE PetOps_System SHALL define all AWS resources using Terraform configuration files
2. WHEN a developer runs `terraform apply` from the repository, THE PetOps_System SHALL deploy all required infrastructure without manual AWS Console operations beyond one-time prerequisites
3. THE PetOps_System SHALL store no credentials, secrets, or API keys in source code or Terraform state committed to version control
4. WHEN a developer runs `terraform destroy`, THE PetOps_System SHALL remove all provisioned AWS resources
5. THE PetOps_System SHALL include an account-identity safeguard that causes deployment to fail if the active AWS identity does not belong to account 253881689673

### Requirement 12: Demo-Ready Judge Experience

**User Story:** As a hackathon judge, I want to experience the application immediately without creating an account, so that I can evaluate it within the limited judging time.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. THE PetOps_System SHALL require no account creation, login, or authentication for accessing the demonstration
2. THE PetOps_System SHALL provide a landing page at the root URL containing the product name, a one-sentence value proposition, and a visible call-to-action to begin the demonstration
3. THE PetOps_System SHALL provide a guided demonstration path accessible within 3 clicks from the landing page
4. THE PetOps_System SHALL include a Bentley scenario covering boarding with medication (Apoquel, daily morning) and behavioral concerns (anxiety around large dogs)
5. THE PetOps_System SHALL include a Luna scenario covering grooming with allergy concerns
6. THE PetOps_System SHALL include a Cooper scenario covering boarding with vaccination timing concerns (vaccination expiring within the service period)
7. THE PetOps_System SHALL include a blank intake option for free-form text entry
8. THE PetOps_System SHALL use only fictional pet and customer data

### Requirement 13: Security and Cost Protection

**User Story:** As a developer, I want the system to follow security best practices and protect against abuse, so that the application is resistant to common attack vectors and unbounded cost.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. IF API input fails schema validation, THEN THE PetOps_System SHALL reject the request and return a structured error without processing further
2. THE PetOps_System SHALL scope each Lambda execution role to only the AWS service actions and resources required by that specific function
3. THE PetOps_System SHALL validate AI-generated output against the Extraction_Result JSON schema before use in care plan generation
4. THE PetOps_System SHALL encode all user-provided text before rendering in the UI to prevent XSS
5. THE PetOps_System SHALL configure API Gateway to restrict cross-origin requests to only the CloudFront distribution domain
6. THE PetOps_System SHALL enforce a maximum request body size of 10KB on all API endpoints
7. THE PetOps_System SHALL configure API Gateway throttling to limit burst and sustained request rates
8. THE PetOps_System SHALL bound Bedrock inference output tokens to prevent unbounded generation cost
9. THE PetOps_System SHALL invoke Bedrock only from server-side Lambda functions, never from browser code
10. THE PetOps_System SHALL NOT expose AWS credentials, Bedrock API keys, or internal service endpoints to browser code

### Requirement 14: Graceful Failure Handling

**User Story:** As a front-desk staff member, I want the system to handle errors gracefully, so that I am not blocked by technical failures.

**Priority:** MUST HAVE

#### Acceptance Criteria

1. IF the Extraction_Engine fails to produce a response within the configured timeout, THEN THE PetOps_System SHALL display a timeout message and preserve the original Customer_Request text
2. IF Amazon Bedrock returns a transient error, THEN THE PetOps_System SHALL automatically retry once with brief backoff, then display an error with an explicit manual Retry action if the retry fails
3. WHEN a Customer_Request contains ambiguous date references, THE Extraction_Engine SHALL extract the most likely interpretation and mark the field as uncertain
4. IF the Record_Store is unreachable, THEN THE PetOps_System SHALL inform the reviewer that saving is temporarily unavailable and preserve the Care_Plan in the client session
5. WHEN retry is exhausted, THE PetOps_System SHALL display a clear error explanation, a correlation ID for diagnostics, and preserve the Customer_Request text for manual copying
6. THE PetOps_System SHALL include a correlation ID in all API responses and error displays to support end-to-end request tracing

### Requirement 15: AI Confidence and Uncertainty Indicators

**User Story:** As a front-desk staff member, I want to see which extracted fields may need verification, so that I know what to double-check.

**Priority:** SHOULD HAVE

#### Acceptance Criteria

1. WHEN the Extraction_Engine produces an Extraction_Result, THE Extraction_Engine SHALL classify each extracted field as either confident or uncertain based on the defined uncertainty conditions
2. THE Review_Interface SHALL visually distinguish uncertain fields from confident fields using both a visual indicator and a text label, distinguishable without relying solely on color
3. THE PetOps_System SHALL NOT fabricate numeric confidence percentages
4. THE Review_Interface SHALL display a summary count of uncertain fields at the top of the review view

### Requirement 16: Care Plan History

**User Story:** As a business owner, I want to view recent care plan decisions, so that I can reference past plans.

**Priority:** SHOULD HAVE (minimal recent-results view sufficient for MVP)

#### Acceptance Criteria

1. THE PetOps_System SHALL provide a list view displaying recent stored Care_Plans with summary information including pet name, service type, and status
2. WHEN a Care_Plan is selected from the list view, THE PetOps_System SHALL navigate to the full Care_Plan detail view
3. THE PetOps_System SHALL sort the list view by decision date with most recent entries first
4. IF the list view fails to load, THEN THE PetOps_System SHALL display an error message and offer retry

### Requirement 17: Observability

**User Story:** As a developer, I want the system to produce operational logs, so that I can diagnose issues.

**Priority:** SHOULD HAVE

#### Acceptance Criteria

1. THE PetOps_System SHALL log all Lambda invocations to Amazon CloudWatch with correlation identifiers and retain logs for 14 days
2. THE PetOps_System SHALL log Extraction_Engine response time in milliseconds per invocation
3. IF an unhandled error occurs in any Lambda function, THEN THE PetOps_System SHALL log the error to CloudWatch including the correlation identifier, function name, and error type before returning an error response
4. THE PetOps_System SHALL propagate a shared correlation identifier across all pipeline stages for a single Customer_Request

### Requirement 18: Multi-Pet Extraction

**User Story:** As a front-desk staff member, I want the system to handle requests mentioning multiple pets, so that I can process family drop-offs.

**Priority:** COULD HAVE (post-MVP unless nearly free after single-pet schema is complete)

#### Acceptance Criteria

1. WHEN a Customer_Request contains information about multiple pets, THE Extraction_Engine SHALL produce a separate pet record within the Extraction_Result for each identified pet
2. WHEN the Extraction_Result contains multiple pets, THE Care_Plan_Generator SHALL produce a distinct section per pet

### Requirement 19: Guided Intake Mode

**User Story:** As a front-desk staff member, I want a guided step-by-step intake option, so that I can quickly build a care plan by answering contextual questions rather than typing free-form text.

**Priority:** SHOULD HAVE (competitive enhancement added after judge-ready workflow was established)

**Architecture Constraint:** Guided Intake MUST converge into the same downstream pipeline as AI Quick Intake: structured intake → deterministic validation → operational attention flags → care-plan assembly → human review → approve/reject → DynamoDB.

#### Acceptance Criteria

1. THE PetOps_System SHALL provide two intake modes accessible from the demo/entry point: "AI Quick Intake" (existing Bedrock-powered) and "Guided Intake" (contextual questions)
2. THE Guided Intake SHALL collect pet selection, service type, and service-specific contextual questions through a multi-step interface
3. THE Guided Intake SHALL display a Live Care Plan panel that updates immediately as the user provides answers
4. WHEN guided intake is complete, THE PetOps_System SHALL map the collected answers into the same ExtractionResult-compatible structured contract used by the AI pipeline
5. THE mapped guided intake data SHALL pass through the same deterministic validation, attention detection, and care-plan assembly used by AI Quick Intake
6. THE Guided Intake SHALL enter the same human-review experience (ReviewPanel) as AI Quick Intake for final approve/reject
7. THE Guided Intake SHALL NOT imply AI processing where deterministic UI logic is actually used
8. THE Guided Intake SHALL NOT imply real appointment availability, reservation confirmation, or staff scheduling
9. THE Guided Intake SHALL use only fictional pet data already established in the project
