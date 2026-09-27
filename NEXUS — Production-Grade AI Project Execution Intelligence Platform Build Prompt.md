# NEXUS — Production-Grade AI Project Execution Intelligence Platform

## 0. ROLE

You are a senior product architect, staff-level full-stack engineer, AI/ML engineer, database architect, security engineer, and premium enterprise UX designer.

Build **NEXUS**, a production-grade AI-powered project execution intelligence platform for infrastructure/construction projects.

Do not build a static prototype, fake dashboard, or collection of disconnected UI screens.

Build a **real end-to-end working application** with:

- real authentication
- role-based access control
- real PostgreSQL persistence
- real project/schedule data
- real AI processing pipeline
- real speech-to-text
- real OCR/document processing
- real structured extraction
- real L5/L6 activity matching
- real confidence and evidence scoring
- real human approval workflow
- real planned-vs-actual variance calculation
- real risk/alert engine
- real audit trail
- real project memory
- real RAG-based project Q&A
- production-grade validation and error handling

The architecture must follow this fundamental principle:

> **AI interprets and proposes. Deterministic software validates and calculates. Humans/policies govern authoritative project state.**

Never allow an LLM to directly modify authoritative schedule state.

---

# 1. PRODUCT VISION

NEXUS converts messy field information into trustworthy, traceable project execution intelligence.

A supervisor may provide:

- voice update
- typed update
- photograph
- scanned document
- PDF
- Excel/CSV
- daily progress report

NEXUS processes the information, identifies what happened, determines which planned L5/L6 activity it belongs to, evaluates evidence and confidence, sends ambiguous/high-impact cases for review, and after approval updates the project's verified actual state.

The system then calculates:

- planned vs actual variance
- delays
- blockers
- schedule health
- risk
- alerts
- historical patterns

Validated information becomes project memory and can later be retrieved through a RAG interface.

Core pipeline:

```text
FIELD INPUT
    ↓
PREPROCESSING
    ├── Voice → Speech-to-Text
    ├── Image/Scanned PDF → OCR
    ├── Digital PDF → PDF Parser
    └── Excel/CSV → Structured Parser
    ↓
AI/NLP EXTRACTION
    ↓
NORMALIZATION
    ↓
L5/L6 CANDIDATE RETRIEVAL
    ↓
HYBRID MATCHING
    ↓
EVIDENCE + CONFIDENCE SCORING
    ↓
GOVERNANCE GATE
    ├── Accept
    ├── Review
    └── Reject
    ↓
VERIFIED ACTUAL
    ↓
PLANNED vs ACTUAL
    ↓
VARIANCE / RISK / ALERTS
    ↓
AUDIT TRAIL
    ↓
PROJECT MEMORY
    ↓
RAG / PROJECT INTELLIGENCE
```

---

# 2. IMPORTANT ARCHITECTURAL RULE

Separate the system into four layers.

## Layer A — AI/ML

Responsible for interpretation:

- Speech-to-Text
- OCR
- LLM/NLP extraction
- terminology normalization
- embeddings
- semantic retrieval
- candidate generation
- candidate ranking assistance
- RAG answer generation

## Layer B — Intelligence & Scoring

Responsible for evaluating information:

- hybrid activity matching
- mapping confidence
- evidence completeness
- data quality
- validation score
- risk score
- anomaly signals

## Layer C — Deterministic Backend

Responsible for authoritative logic:

- permissions
- validation schemas
- business rules
- schedule calculations
- planned-vs-actual variance
- dependency checks
- database state
- versioning
- audit logs

## Layer D — Human Governance

Responsible for:

- approve
- reject
- correct
- override
- request clarification

Never blur these responsibilities.

---

# 3. PRIMARY USER ROLES

Implement RBAC with these roles.

## ADMIN

Can:

- manage users
- manage roles
- manage projects
- configure system
- view all audit logs
- manage AI configuration

## PROJECT MANAGER

Can:

- view assigned projects
- monitor schedule
- view progress
- view risks
- view alerts
- inspect evidence
- use project RAG
- view analytics

## PLANNER

Can:

- import schedules
- inspect activities
- review AI-generated execution events
- approve
- reject
- correct
- override mappings
- inspect evidence
- view audit history

## SUPERVISOR

Can:

- submit field updates
- record voice updates
- upload documents
- upload evidence
- see submitted reports
- track review status

## AUDITOR

Read-only access to:

- events
- evidence
- approvals
- corrections
- audit trail
- historical versions

Implement permission checks both in frontend and backend.

Never rely on frontend-only authorization.

---

# 4. RECOMMENDED TECH STACK

## Frontend

Use:

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui where useful
- React Hook Form
- Zod
- TanStack Query where appropriate
- Recharts or Plotly for analytics
- Framer Motion for restrained transitions

## Backend

Use:

- Python
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic

## Database

Use:

- PostgreSQL
- pgvector

Do not introduce a separate vector database unless there is a real technical requirement.

## AI

Use provider abstraction rather than hard-coding the entire application to one vendor.

Create interfaces such as:

```text
SpeechProvider
OCRProvider
LLMProvider
EmbeddingProvider
```

The application should be able to switch providers through environment variables.

## Document Processing

Use suitable libraries for:

- PDF text extraction
- OCR
- CSV
- XLSX

## Deployment

Design for:

- Vercel frontend
- production FastAPI backend
- managed PostgreSQL
- secure object/file storage

Keep deployment provider-specific code isolated.

---

# 5. APPLICATION STRUCTURE

Create a clean monorepo:

```text
nexus/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── types/
│   │   └── styles/
│   │
│   └── api/
│       ├── app/
│       │   ├── api/
│       │   ├── core/
│       │   ├── db/
│       │   ├── models/
│       │   ├── schemas/
│       │   ├── services/
│       │   ├── rules/
│       │   ├── ai/
│       │   └── main.py
│       └── tests/
│
├── packages/
│   ├── shared-types/
│   ├── ui/
│   └── config/
│
├── infrastructure/
│   ├── docker/
│   └── migrations/
│
├── docs/
│
├── .env.example
├── docker-compose.yml
└── README.md
```

Keep domain logic separate from UI code.

---

# 6. DATABASE DESIGN

Create PostgreSQL migrations and proper foreign keys.

Core tables:

```text
users
roles
user_roles

projects
project_members

schedules
schedule_versions

activities
activity_dependencies

execution_events

evidence
event_evidence

candidate_matches
match_decisions

validations
approvals

alerts
risks

audit_logs

memory_records
embeddings

notifications
```

Important entities:

### Project

```text
id
name
code
description
location
status
created_at
updated_at
```

### Schedule

```text
id
project_id
version
source_file
imported_by
imported_at
status
```

### Activity

```text
id
schedule_id
activity_code
activity_name
level
parent_activity_id
location
discipline
planned_start
planned_end
quantity
unit
status
embedding
```

Support L5/L6 hierarchy.

### ExecutionEvent

```text
id
project_id
reported_by
source_type
raw_input
normalized_text
event_type
activity_id
location
start_time
end_time
quantity
unit
blocker
status

mapping_confidence
evidence_score
data_quality_score
risk_score

governance_status
created_at
updated_at
```

### Evidence

```text
id
event_id
type
storage_url
metadata
captured_at
uploaded_by
hash
```

### MatchDecision

Store:

- selected activity
- candidate activities
- semantic score
- structured score
- final score
- model/provider
- reasoning metadata
- timestamp

Do not store unrestricted chain-of-thought.

Store concise machine-readable decision metadata instead.

### AuditLog

Store:

```text
id
actor_id
entity_type
entity_id
action
before_state
after_state
reason
timestamp
request_id
```

Never silently overwrite authoritative historical information.

Use versioned corrections.

---

# 7. AI PIPELINE

Implement AI as modular services.

```text
ai/
├── stt/
├── ocr/
├── extraction/
├── normalization/
├── embeddings/
├── matching/
├── scoring/
└── rag/
```

---

# 8. SPEECH-TO-TEXT

When the supervisor submits audio:

```text
Audio
 ↓
Speech-to-Text Provider
 ↓
Transcript
 ↓
LLM Extraction
```

Use a Whisper-compatible provider/model through an abstraction layer.

Example:

```text
Audio:
"Line 24 pipe spool erection completed around 3 PM."

Transcript:
"Line 24 pipe spool erection completed around 3 PM."
```

Store:

- transcript
- language
- confidence if available
- duration
- provider
- model
- timestamp

Never directly create a verified event from STT output.

---

# 9. OCR

For scanned documents/images:

```text
Image
 ↓
OCR
 ↓
Extracted text
 ↓
LLM
 ↓
Structured Execution Event
```

For digital PDFs:

```text
PDF
 ↓
PDF parser
 ↓
Text
```

Do not OCR every digital PDF unnecessarily.

Use OCR only when text extraction is unavailable or insufficient.

---

# 10. LLM EXTRACTION

The LLM must return structured JSON validated by Pydantic/Zod.

Example:

```json
{
  "event_type": "completed",
  "activity_description": "pipe spool erection",
  "location": "Line 24",
  "start_time": null,
  "end_time": "15:00",
  "quantity": null,
  "unit": null,
  "blocker": null,
  "notes": null,
  "evidence_references": []
}
```

Rules:

- Never invent missing values.
- Unknown values must be null.
- Normalize dates into ISO format.
- Normalize time into a consistent timezone.
- Preserve original raw text.
- Preserve extracted values separately.
- Validate output with strict schemas.

---

# 11. NORMALIZATION

Normalize:

- activity names
- location names
- discipline
- dates
- time
- units
- status
- blocker terminology

Example:

```text
"RCC casting"
"concrete pouring"
"concrete work"

→ normalized concept:
"Concrete Pouring"
```

Do not destroy the original user wording.

Store both:

```text
raw_input
normalized_value
```

---

# 12. L5/L6 MATCHING ENGINE

This is one of the most important parts of NEXUS.

Use a hybrid approach.

## Step 1 — Semantic retrieval

Generate embedding for the normalized event description.

Query pgvector.

Retrieve top K candidate activities.

## Step 2 — Structured filtering

Use:

- project
- discipline
- location
- date proximity
- activity status
- hierarchy
- equipment/tag
- dependencies

## Step 3 — Hybrid scoring

Create a deterministic scoring function.

Example:

```text
final_score =
    0.40 * semantic_score +
    0.20 * location_score +
    0.15 * discipline_score +
    0.10 * schedule_time_score +
    0.10 * activity_name_score +
    0.05 * dependency_score
```

Make weights configurable.

Do not let an LLM arbitrarily decide the final score.

Example output:

```text
Candidate 1
L6-00231 — Concrete Pouring — Block C
Semantic: 0.94
Location: 1.00
Discipline: 1.00
Schedule: 0.91
Final: 0.95

Candidate 2
L6-00232 — Concrete Pouring — Block D
Final: 0.71
```

---

# 13. IMPORTANT: DIFFERENT SCORES

Do not create one meaningless "AI score".

Display separate scores.

## Mapping Confidence

How confidently the event maps to an activity.

## Evidence Score

How complete/relevant the submitted evidence is.

## Data Quality Score

Whether required fields are present and valid.

## Risk Score

How concerning the resulting project condition is.

## Overall Governance Score

A deterministic aggregation used to determine workflow.

Example:

```text
Mapping Confidence:     95
Evidence Score:         82
Data Quality Score:     96
Risk Score:             34
```

Never describe a mapping confidence score as "94% probability that the work actually happened."

---

# 14. EVIDENCE ENGINE

Evidence can include:

- photo
- PDF
- daily report
- document
- timestamp
- uploader
- location metadata
- supporting reference

Evidence should support a claim but should not automatically be treated as unquestionable truth.

Implement:

```text
Evidence completeness
Evidence relevance
Evidence metadata
Evidence provenance
```

Do not claim perfect image authenticity unless an actual verification mechanism exists.

---

# 15. GOVERNANCE ENGINE

Every AI-generated event enters a governance state.

Possible states:

```text
PROPOSED
REVIEW_REQUIRED
APPROVED
REJECTED
CORRECTION_REQUIRED
SUPERSEDED
```

Example rule:

```text
if mapping_confidence >= 0.90
and evidence_score >= 0.80
and data_quality_score >= 0.90
and event_impact != HIGH:
    eligible_for_policy_based_acceptance

else:
    review_required
```

Make thresholds configurable.

High-impact changes should require planner approval.

---

# 16. PLANNER REVIEW SCREEN

Create a premium review interface.

Layout:

```text
┌─────────────────────────────────────────────┐
│ Execution Event Review                      │
├─────────────────────────────────────────────┤
│ Original Field Report                       │
│ "Concrete pouring for Block C..."           │
│                                             │
│ AI Extracted Data                           │
│ Activity: Concrete Pouring                  │
│ Location: Block C                           │
│ Status: Interrupted                         │
│ Time: 10:00 → 13:00                        │
│                                             │
│ Candidate Activities                        │
│                                             │
│ ✓ Block C Concrete          95%             │
│   Block D Concrete          71%             │
│   Foundation Concrete       65%             │
│                                             │
│ Evidence                                    │
│ [Photo] [Daily Report]                      │
│                                             │
│ Scores                                      │
│ Mapping       95                            │
│ Evidence     82                             │
│ Data Quality 96                             │
│ Risk          34                            │
│                                             │
│ [ APPROVE ] [ CORRECT ] [ REJECT ]          │
└─────────────────────────────────────────────┘
```

The planner must be able to change the selected activity.

If corrected, record:

- original decision
- corrected decision
- actor
- reason
- timestamp

---

# 17. VERIFIED ACTUAL

Only after governance approval should the event become authoritative.

```text
AI Proposal
    ↓
Governance
    ↓
Approved
    ↓
Verified Actual
```

Once verified:

- update actual start/end/status
- calculate variance
- update activity status
- evaluate dependencies
- generate alerts if required
- write audit log

---

# 18. VARIANCE ENGINE

Never use the LLM for arithmetic.

Calculate deterministically.

Examples:

```text
start_variance =
actual_start - planned_start

finish_variance =
actual_finish - planned_finish

duration_variance =
actual_duration - planned_duration
```

Display:

```text
Planned Finish: 08 Oct
Actual Finish: 10 Oct

Variance: +2 days
```

Support:

- activity variance
- milestone variance
- project variance
- cumulative delay
- blocker duration

---

# 19. RISK ENGINE

Implement deterministic rule-based risk detection first.

Example rules:

```text
IF finish_variance > threshold
→ schedule_delay

IF blocker_duration > threshold
→ blocker_risk

IF critical_activity_delayed
→ critical_path_alert

IF repeated blocker
→ recurring_issue

IF dependency predecessor delayed
→ successor_risk
```

Optionally add ML anomaly detection later.

Do not make the MVP dependent on an opaque ML model.

---

# 20. PROJECT MEMORY

Only approved/verified information should become authoritative project memory.

Memory examples:

```text
verified delay
verified blocker
actual duration
productivity
historical variance
recurring issue
validated evidence
```

Rejected events must not silently enter organizational memory.

---

# 21. RAG

Create:

```text
/api/rag/query
```

Flow:

```text
User question
 ↓
Query embedding
 ↓
pgvector retrieval
 ↓
Filter by project + permissions
 ↓
Retrieve validated records
 ↓
LLM synthesis
 ↓
Answer with source references
```

Example:

> "Have we experienced similar concrete pouring delays?"

Answer:

```text
3 similar validated events were found.

Common recorded causes:
- batching plant failure
- material delivery delay
- equipment downtime

Average verified delay:
2.4 days

References:
EV-10492
EV-11821
EV-13277
```

Every RAG answer must expose its supporting records.

Never let the LLM invent historical project information.

---

# 22. MAIN APPLICATION PAGES

Build these pages.

```text
/login

/dashboard

/projects
/projects/[projectId]

/projects/[projectId]/overview
/projects/[projectId]/schedule
/projects/[projectId]/activities
/projects/[projectId]/analytics
/projects/[projectId]/map

/capture

/events
/events/[eventId]

/review
/review/[eventId]

/evidence

/alerts
/audit

/memory
/ask

/settings
/admin/users
/admin/projects
/admin/ai
```

---

# 23. SUPERVISOR CAPTURE PAGE

This should be one of the most polished pages.

Design:

```text
"Tell us what happened."

[ 🎙 Hold to Record ]

or

[ Type update... ]

or

[ Upload document ]

or

[ Upload evidence ]
```

After submission:

```text
Processing...

✓ Speech converted
✓ Information extracted
✓ Activity candidates found
✓ Evidence analyzed
✓ Confidence calculated
```

Then show the proposed event.

---

# 24. DASHBOARD

Create an enterprise command center.

Top metrics:

```text
Project Progress
Schedule Health
Delayed Activities
Blocked Activities
Open Alerts
Pending Reviews
Verified Events
```

Visualizations:

- progress trend
- planned vs actual
- activity status distribution
- delay distribution
- blocker trend
- risk distribution
- activity timeline
- Gantt view

Avoid excessive charts.

Every visualization must answer a practical project-management question.

---

# 25. ACTIVITY DETAIL

Show:

```text
Activity
Hierarchy
Location
Planned dates
Actual dates
Variance
Dependencies
Execution events
Evidence
Approvals
Risk
Audit history
```

Create a timeline:

```text
Planned
   ↓
Field Report
   ↓
AI Extraction
   ↓
Match
   ↓
Planner Review
   ↓
Approval
   ↓
Verified Actual
   ↓
Variance
```

---

# 26. AUDIT UI

Create a traceability interface.

Example:

```text
WHO:
Supervisor 17

WHAT:
Submitted execution event

WHEN:
10:03 AM

AI:
Matched L6-00231

CONFIDENCE:
95%

EVIDENCE:
Photo P-1827

REVIEWER:
Planner 06

DECISION:
Approved

STATE CHANGE:
Actual status → Interrupted
```

Allow users to inspect previous versions.

---

# 27. DESIGN SYSTEM

The UI must look like a serious enterprise operations platform, not a generic AI SaaS template.

Visual direction:

- dark/neutral enterprise command-center foundation
- restrained accent color
- high information density
- excellent typography
- strong spacing hierarchy
- subtle borders
- professional data tables
- compact status badges
- clear severity colors
- accessible contrast
- responsive layout
- keyboard-friendly interactions

Use the **ui-ux-pro-max** design methodology where available.

Avoid:

- excessive gradients
- random glassmorphism
- huge hero sections
- meaningless animations
- excessive rounded cards
- AI-generated-looking dashboards
- decorative 3D elements that reduce usability

Use animation only to communicate:

- loading
- state transition
- success
- navigation
- live processing
- attention

---

# 28. AI PROCESSING EXPERIENCE

When AI is processing a field report, do not display fake progress such as:

```text
AI is thinking...
```

Instead display real pipeline states:

```text
Receiving input
      ↓
Transcribing
      ↓
Extracting
      ↓
Normalizing
      ↓
Finding activities
      ↓
Evaluating evidence
      ↓
Calculating confidence
      ↓
Preparing review
```

Each state must correspond to an actual backend operation.

---

# 29. API DESIGN

Implement REST APIs with OpenAPI documentation.

Example:

```text
POST   /api/auth/login

GET    /api/projects
POST   /api/projects

GET    /api/projects/{id}

POST   /api/schedules/import

GET    /api/activities

POST   /api/capture

POST   /api/events/{id}/extract

POST   /api/events/{id}/match

POST   /api/events/{id}/evidence

POST   /api/events/{id}/approve
POST   /api/events/{id}/reject
POST   /api/events/{id}/correct

GET    /api/events/{id}/audit

GET    /api/projects/{id}/variance
GET    /api/projects/{id}/risks
GET    /api/projects/{id}/alerts

POST   /api/rag/query
```

Use consistent response envelopes and error codes.

---

# 30. SECURITY

Implement:

- secure password hashing
- HTTP-only session/cookie strategy
- CSRF protection where applicable
- RBAC
- backend authorization
- input validation
- file type validation
- upload size limits
- malware-safe file handling strategy
- rate limiting
- request IDs
- audit logging
- secrets only through environment variables

Never expose API keys to the browser.

---

# 31. ENVIRONMENT VARIABLES

Create `.env.example`.

Example:

```env
DATABASE_URL=

AUTH_SECRET=

LLM_PROVIDER=
LLM_API_KEY=

STT_PROVIDER=
STT_API_KEY=

OCR_PROVIDER=
OCR_API_KEY=

EMBEDDING_PROVIDER=
EMBEDDING_API_KEY=

STORAGE_PROVIDER=
STORAGE_BUCKET=

NEXT_PUBLIC_API_URL=
```

Never hardcode secrets.

---

# 32. OBSERVABILITY

Implement structured logs.

Every AI request should record:

```text
request_id
project_id
user_id
provider
model
operation
latency
success/failure
token usage if available
```

Do not log sensitive raw documents unnecessarily.

Add health endpoints:

```text
GET /health
GET /ready
```

---

# 33. ERROR HANDLING

Every layer must fail gracefully.

Examples:

### STT unavailable

Show:

```text
Voice processing is temporarily unavailable.
You can submit the update as text.
```

### OCR failure

Allow:

```text
Retry
Download/inspect file
Manual text entry
```

### LLM failure

Do not create a fake event.

Set:

```text
processing_failed
```

### Matching confidence low

Send to manual review.

### Database failure

Do not claim successful submission.

---

# 34. TESTING

Implement:

## Unit tests

For:

- scoring
- normalization
- variance
- risk rules
- permissions

## Integration tests

For:

```text
capture
→ extraction
→ matching
→ approval
→ verified actual
```

## AI evaluation tests

Create a fixed dataset of field reports and expected structured outputs.

Measure:

- extraction accuracy
- matching accuracy
- false matches
- missing-field rate
- review rate

Do not evaluate the AI only through subjective visual inspection.

---

# 35. SEED DATA

Create realistic demo data.

Example project:

```text
NEXUS Metro Package A
```

Include:

- 100+ activities
- L5/L6 hierarchy
- multiple disciplines
- dependencies
- planned dates
- completed activities
- delayed activities
- blocked activities
- sample evidence
- historical execution events
- alerts
- audit records

Seed data must make the dashboard look alive immediately.

---

# 36. DEMO SCENARIO

The application must support this exact end-to-end demonstration.

## Step 1

Planner imports:

```text
Construction_Schedule.xlsx
```

## Step 2

NEXUS creates L5/L6 activities.

## Step 3

Supervisor records:

> "Line 24 pipe spool erection completed around 3 PM today."

## Step 4

STT converts audio to text.

## Step 5

LLM extracts:

```json
{
  "activity_description": "pipe spool erection",
  "location": "Line 24",
  "status": "completed",
  "end_time": "15:00"
}
```

## Step 6

Normalization occurs.

## Step 7

pgvector retrieves candidate activities.

## Step 8

Hybrid matching ranks them.

## Step 9

NEXUS displays:

```text
Best Match: L6-00231
Mapping Confidence: 95
```

## Step 10

Evidence is attached.

## Step 11

Governance determines:

```text
REVIEW_REQUIRED
```

## Step 12

Planner opens review.

## Step 13

Planner clicks:

```text
APPROVE
```

## Step 14

System creates verified actual.

## Step 15

Variance engine calculates:

```text
Planned Finish: 08 Oct
Actual Finish: 10 Oct
Variance: +2 days
```

## Step 16

Risk engine generates an alert.

## Step 17

Audit log records every transition.

## Step 18

Verified event enters project memory.

## Step 19

Manager asks:

> "Have we seen similar delays before?"

## Step 20

RAG retrieves validated historical events and answers with references.

This entire flow must work using real application state.

---

# 37. IMPLEMENTATION ORDER

Do not attempt everything simultaneously.

## Phase 1 — Foundation

Build:

- monorepo
- Next.js
- FastAPI
- PostgreSQL
- migrations
- authentication
- RBAC
- project model

## Phase 2 — Schedule

Build:

- CSV/XLSX import
- schedule versions
- L5/L6 activities
- dependencies
- schedule UI

## Phase 3 — Field Capture

Build:

- text capture
- voice recording
- file upload
- evidence upload

Start with text before STT to simplify debugging.

## Phase 4 — AI Extraction

Build:

- STT
- OCR
- PDF parsing
- LLM structured extraction
- validation

## Phase 5 — Matching

Build:

- embeddings
- pgvector
- candidate retrieval
- structured filtering
- hybrid scoring

## Phase 6 — Governance

Build:

- confidence scores
- evidence score
- review queue
- approve/reject/correct
- versioning

## Phase 7 — Verified Actual

Build:

- authoritative state transitions
- variance engine
- dependency evaluation
- alerts

## Phase 8 — Analytics

Build:

- dashboard
- Gantt
- variance charts
- risk
- blocker analytics

## Phase 9 — Memory + RAG

Build:

- validated memory records
- embeddings
- retrieval
- project Q&A
- source references

## Phase 10 — Production Hardening

Build:

- tests
- security
- logging
- rate limits
- error handling
- monitoring
- accessibility
- performance optimization
- deployment

---

# 38. MVP PRIORITY

If development time becomes limited, prioritize in exactly this order:

```text
1. Authentication/RBAC
2. Schedule import
3. Supervisor text capture
4. LLM extraction
5. L5/L6 matching
6. Confidence scoring
7. Planner review
8. Verified actual
9. Planned-vs-actual variance
10. Audit trail
11. Dashboard
12. Voice/STT
13. OCR
14. Project memory
15. RAG
```

The central chain must work before adding advanced features.

---

# 39. NON-FUNCTIONAL REQUIREMENTS

The application should be:

- responsive
- accessible
- type-safe
- modular
- observable
- secure
- testable
- maintainable
- horizontally scalable where appropriate
- resilient to AI-provider failures

Do not create unnecessary microservices.

Start as a modular monolith with clear service boundaries.

Extract services only when there is a real scaling requirement.

---

# 40. PERFORMANCE

Optimize:

- database indexes
- pgvector indexes
- API pagination
- server-side filtering
- lazy loading
- document processing jobs
- AI calls
- caching
- dashboard aggregation queries

Long-running operations such as:

- OCR
- STT
- embedding generation
- document processing

should use background jobs where appropriate.

The UI must show real processing state.

---

# 41. DATA INTEGRITY

Critical rule:

```text
Raw Input
      ↓
AI Proposal
      ↓
Validation
      ↓
Human/Policy Governance
      ↓
Verified Actual
```

Never:

```text
Raw Input
      ↓
LLM
      ↓
Direct Database Update
```

All authoritative state changes must be auditable.

---

# 42. UI QUALITY BAR

The application should feel comparable to a serious enterprise operations platform.

Every screen must have:

- clear information hierarchy
- loading state
- empty state
- error state
- success state
- responsive layout
- keyboard accessibility
- meaningful micro-interactions
- consistent terminology
- clear action hierarchy

Tables should support:

- search
- filter
- sort
- pagination
- status
- date range
- project
- discipline
- location

---

# 43. FINAL ACCEPTANCE CRITERIA

The implementation is NOT complete until all of the following work:

### Authentication

```text
Login → RBAC → authorized application
```

### Schedule

```text
XLSX → parsed → activities → L5/L6 hierarchy
```

### Capture

```text
Voice/Text/File → stored
```

### AI

```text
Voice → STT
Image/scan → OCR
Input → structured extraction
```

### Matching

```text
Execution Event → candidates → hybrid ranking
```

### Scoring

```text
mapping confidence
evidence score
data quality score
risk score
```

### Governance

```text
proposed → review → approve/reject/correct
```

### Authoritative state

```text
approved → verified actual
```

### Analytics

```text
planned vs actual → variance → risk/alert
```

### Audit

```text
every important state change traceable
```

### Memory

```text
verified events → project memory
```

### RAG

```text
question → retrieval → grounded answer + references
```

### Production

```text
tests
security
logging
validation
error handling
deployment
```

---

# 44. FINAL DEVELOPMENT INSTRUCTION

Do not generate the entire application as one giant unverified code dump.

Work incrementally.

For every phase:

1. Inspect existing code.
2. Identify dependencies.
3. Implement the smallest production-quality slice.
4. Run type checks.
5. Run linting.
6. Run unit tests.
7. Run integration tests where applicable.
8. Verify the UI.
9. Fix errors.
10. Only then move to the next phase.

Do not replace working code unnecessarily.

Do not create duplicate components.

Do not hardcode demo values into production components.

Use seeded demo data through the database.

Use environment variables for providers.

Use typed contracts between frontend and backend.

Keep AI providers replaceable.

Keep business rules deterministic.

Keep authoritative state auditable.

---

# 45. THE CORE PRODUCT PRINCIPLE

NEXUS is not:

> "An AI chatbot for construction."

NEXUS is:

> **An AI-assisted field-to-schedule execution intelligence platform that transforms unstructured field updates into validated, traceable, schedule-linked project actuals and continuously converts verified execution history into actionable project intelligence.**

Build the product around that principle.