# NEXUS — Complete Phased Execution Plan

> **AI-assisted field-to-schedule execution intelligence platform that transforms unstructured field updates into validated, traceable, schedule-linked project actuals and continuously converts verified execution history into actionable project intelligence.**

---

## Current State Assessment

| Aspect | Status |
|---|---|
| **Framework** | Vite + React 19 + TypeScript (NOT the required Next.js monorepo) |
| **Existing screens** | Landing page, Login (UI-only), Mobile Capture (mock), Review Queue (mock) |
| **Backend** | ❌ None — no FastAPI, no database, no API |
| **Authentication** | ❌ UI-only login form, no real auth |
| **Database** | ❌ No PostgreSQL, no migrations, no schema |
| **AI Pipeline** | ❌ No STT, OCR, LLM extraction, embeddings |
| **Business Logic** | ❌ No matching, scoring, governance, variance |

> [!IMPORTANT]
> The current codebase is a Vite SPA with 4 static UI screens and zero backend logic. **The entire application must be restructured into the spec's monorepo architecture** with a Next.js frontend and Python FastAPI backend. The existing React components can be adapted but the routing, structure, and data layer must be rebuilt from scratch.

---

## Architecture Overview

```mermaid
graph TB
    subgraph "Frontend — Next.js App Router"
        FE["Next.js + React + TypeScript + Tailwind + shadcn/ui"]
    end

    subgraph "Backend — Python FastAPI"
        API["REST API + OpenAPI"]
        AUTH["Auth & RBAC"]
        RULES["Business Rules"]
        AI["AI Pipeline Services"]
        CALC["Deterministic Engines"]
    end

    subgraph "Data Layer"
        PG["PostgreSQL + pgvector"]
        FS["File/Object Storage"]
    end

    subgraph "External AI Providers"
        LLM["LLM Provider"]
        STT["STT Provider"]
        OCR["OCR Provider"]
        EMB["Embedding Provider"]
    end

    FE --> API
    API --> AUTH
    API --> RULES
    API --> AI
    API --> CALC
    AUTH --> PG
    RULES --> PG
    AI --> LLM
    AI --> STT
    AI --> OCR
    AI --> EMB
    CALC --> PG
    AI --> FS
```

### Four-Layer Separation (Non-Negotiable)

| Layer | Responsibility | Technology |
|---|---|---|
| **A — AI/ML** | Interpretation (STT, OCR, LLM, embeddings, retrieval, RAG) | Python services with provider abstraction |
| **B — Intelligence & Scoring** | Evaluation (hybrid matching, confidence, evidence, risk, anomaly) | Deterministic Python scoring functions |
| **C — Deterministic Backend** | Authority (permissions, validation, schedule calc, variance, audit) | FastAPI + SQLAlchemy + Alembic |
| **D — Human Governance** | Decisions (approve, reject, correct, override, clarify) | Next.js review UI + API endpoints |

---

## Phase 1 — Foundation & Infrastructure
**Priority: CRITICAL | Duration: ~3-4 days**

> [!NOTE]
> This phase establishes every structural decision the rest of the platform depends on. No feature code should be written until this is solid.

### 1.1 Monorepo Scaffold

```text
nexus/
├── apps/
│   ├── web/                    ← Next.js App Router
│   │   ├── app/
│   │   │   ├── (auth)/         ← login, register
│   │   │   ├── (dashboard)/    ← protected layout
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/             ← shadcn/ui components
│   │   │   └── shared/         ← app-specific shared components
│   │   ├── features/           ← feature modules
│   │   ├── hooks/
│   │   ├── lib/                ← API client, utils, constants
│   │   ├── types/              ← shared frontend types
│   │   └── styles/
│   │
│   └── api/                    ← Python FastAPI
│       ├── app/
│       │   ├── api/            ← route handlers
│       │   │   └── v1/
│       │   ├── core/           ← config, security, deps
│       │   ├── db/             ← session, base
│       │   ├── models/         ← SQLAlchemy models
│       │   ├── schemas/        ← Pydantic schemas
│       │   ├── services/       ← business logic
│       │   ├── rules/          ← deterministic rules
│       │   ├── ai/             ← AI provider abstractions
│       │   │   ├── stt/
│       │   │   ├── ocr/
│       │   │   ├── extraction/
│       │   │   ├── normalization/
│       │   │   ├── embeddings/
│       │   │   ├── matching/
│       │   │   ├── scoring/
│       │   │   └── rag/
│       │   └── main.py
│       ├── tests/
│       ├── requirements.txt
│       └── pyproject.toml
│
├── packages/
│   ├── shared-types/           ← TypeScript types shared FE↔BE
│   ├── ui/                     ← design system components
│   └── config/                 ← shared configs (ESLint, TS, etc.)
│
├── infrastructure/
│   ├── docker/
│   │   ├── Dockerfile.web
│   │   ├── Dockerfile.api
│   │   └── docker-compose.yml
│   └── migrations/             ← Alembic migrations
│
├── docs/
├── .env.example
├── docker-compose.yml
└── README.md
```

### 1.2 Database Schema — Core Tables (Alembic Migration 001)

**Tables in this phase:**

| Table | Purpose |
|---|---|
| `users` | User accounts with hashed passwords |
| `roles` | ADMIN, PROJECT_MANAGER, PLANNER, SUPERVISOR, AUDITOR |
| `user_roles` | Many-to-many user ↔ role |
| `projects` | Project entity (id, name, code, description, location, status, timestamps) |
| `project_members` | User assignment to projects with role |
| `audit_logs` | Universal audit trail (actor, entity, action, before/after state, reason, request_id) |

### 1.3 Authentication & RBAC

| Component | Implementation |
|---|---|
| Password hashing | `bcrypt` via `passlib` |
| Session strategy | JWT (HTTP-only cookie) or Bearer tokens |
| CSRF | Token-based protection on state-changing endpoints |
| Backend middleware | `Depends(get_current_user)` + role decorator |
| Frontend guard | Route-level auth check + redirect to `/login` |
| Roles | ADMIN, PROJECT_MANAGER, PLANNER, SUPERVISOR, AUDITOR |
| Permission matrix | Backend-enforced per-endpoint |

### 1.4 Design System Foundation

| Token | Value |
|---|---|
| Font | Inter or IBM Plex Sans (already in use) |
| Base palette | Dark/neutral enterprise command-center |
| Accent | Restrained teal (`#0f766e`) or similar single accent |
| Approach | shadcn/ui primitives + Tailwind + CSS variables |
| Animation | Framer Motion — loading, state transition, navigation ONLY |

### 1.5 Environment Configuration

Create `.env.example` with all required variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/nexus

# Auth
AUTH_SECRET=your-secret-key
AUTH_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# AI Providers
LLM_PROVIDER=openai
LLM_API_KEY=
LLM_MODEL=gpt-4o

STT_PROVIDER=openai
STT_API_KEY=

OCR_PROVIDER=tesseract
OCR_API_KEY=

EMBEDDING_PROVIDER=openai
EMBEDDING_API_KEY=
EMBEDDING_MODEL=text-embedding-3-small

# Storage
STORAGE_PROVIDER=local
STORAGE_BUCKET=./uploads

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Phase 1 Deliverables

- [ ] Working monorepo with `npm run dev` (frontend) and `uvicorn` (backend)
- [ ] Docker Compose for local PostgreSQL + API + Web
- [ ] Alembic migration 001 — users, roles, projects, audit_logs
- [ ] `POST /api/auth/login` — returns JWT
- [ ] `POST /api/auth/register` — admin-only user creation
- [ ] `GET /api/auth/me` — current user + roles
- [ ] RBAC middleware enforcing 5 roles across all endpoints
- [ ] Next.js `/login` page with real auth flow
- [ ] Protected layout shell (sidebar + topbar) for authenticated users
- [ ] shadcn/ui primitives installed (Button, Input, Card, Table, Dialog, etc.)
- [ ] Design tokens in CSS variables
- [ ] Health endpoints: `GET /health`, `GET /ready`
- [ ] Audit log written on user creation, login, project creation

### Phase 1 Acceptance Criteria

```
✅ User can register (admin creates) → login → see protected dashboard shell
✅ Unauthorized requests return 401/403
✅ Role-based menu items show/hide correctly
✅ Audit log records login events
✅ Docker Compose brings up full stack with one command
```

---

## Phase 2 — Schedule Management
**Priority: CRITICAL | Duration: ~3 days**

### 2.1 Database Schema (Migration 002)

| Table | Purpose |
|---|---|
| `schedules` | Schedule entity with version, source_file, imported_by, status |
| `schedule_versions` | Version history of schedule imports |
| `activities` | L5/L6 activity hierarchy with planned dates, quantities, embeddings |
| `activity_dependencies` | Predecessor/successor relationships |

### 2.2 Schedule Import Pipeline

```text
XLSX/CSV Upload
    ↓
File validation (type, size, structure)
    ↓
Parse rows → activity records
    ↓
Detect L5/L6 hierarchy (WBS levels, indentation, or explicit level column)
    ↓
Build dependency graph
    ↓
Validate: no circular deps, dates consistent, required fields present
    ↓
Persist as new schedule version
    ↓
Audit log: "Schedule v2 imported by Planner X"
```

### 2.3 API Endpoints

| Endpoint | Method | Role(s) | Purpose |
|---|---|---|---|
| `/api/schedules/import` | POST | PLANNER, ADMIN | Upload and parse XLSX/CSV |
| `/api/schedules/{id}` | GET | All authenticated | Get schedule details |
| `/api/schedules/{id}/versions` | GET | PLANNER, ADMIN | Version history |
| `/api/activities` | GET | All authenticated | List activities (paginated, filterable) |
| `/api/activities/{id}` | GET | All authenticated | Single activity detail |
| `/api/activities/{id}/dependencies` | GET | All authenticated | Dependency tree |

### 2.4 Frontend Pages

| Page | Description |
|---|---|
| `/projects/[projectId]/schedule` | Schedule overview with import button, version selector |
| `/projects/[projectId]/activities` | Searchable, filterable activity table with L5/L6 hierarchy tree |
| Activity detail panel | Expandable/drawer showing planned dates, deps, hierarchy position |

### Phase 2 Deliverables

- [ ] Alembic migration 002 — schedules, activities, dependencies
- [ ] XLSX/CSV parser with L5/L6 hierarchy detection
- [ ] Dependency graph builder with circular-dependency detection
- [ ] Schedule versioning (import creates new version, old preserved)
- [ ] Activities API with pagination, filtering by project/discipline/location/level
- [ ] Schedule import UI with drag-drop upload, validation feedback
- [ ] Activity tree view showing L5/L6 hierarchy
- [ ] Activity table with search, sort, filter, pagination

### Phase 2 Acceptance Criteria

```
✅ Planner uploads Construction_Schedule.xlsx → 100+ activities created with L5/L6 hierarchy
✅ Activities show planned start, planned end, discipline, location
✅ Dependencies are correctly linked
✅ Previous schedule versions are accessible
✅ Non-PLANNER/ADMIN users cannot import schedules
✅ Audit log records schedule import
```

---

## Phase 3 — Field Capture Interface
**Priority: CRITICAL | Duration: ~2-3 days**

> [!TIP]
> Start with text capture first. Voice and file upload are secondary inputs that feed the same downstream pipeline.

### 3.1 Database Schema (Migration 003)

| Table | Purpose |
|---|---|
| `execution_events` | Core event entity with all fields from spec (raw_input, normalized_text, scores, governance_status, etc.) |
| `evidence` | Uploaded evidence files (photos, PDFs, documents) |
| `event_evidence` | Many-to-many event ↔ evidence |

### 3.2 Capture Modes

| Mode | Input | Storage |
|---|---|---|
| **Text** | Typed field update | raw_input → execution_event |
| **Voice** | Audio recording (browser MediaRecorder) | Audio file → storage → STT in Phase 4 |
| **Document** | PDF, image, Excel, CSV | File → storage → OCR/parse in Phase 4 |
| **Evidence** | Photo, document supporting a claim | File → evidence table |

### 3.3 API Endpoints

| Endpoint | Method | Role(s) | Purpose |
|---|---|---|---|
| `/api/capture` | POST | SUPERVISOR | Submit field update (text, file, or audio) |
| `/api/capture/upload` | POST | SUPERVISOR | Upload evidence/document |
| `/api/events` | GET | All authenticated | List events (paginated, filterable) |
| `/api/events/{id}` | GET | All authenticated | Event detail |

### 3.4 Frontend — Supervisor Capture Page (`/capture`)

This must be one of the most polished pages:

```text
"Tell us what happened."

[ 🎙 Hold to Record ]        ← Audio recording (wired later in Phase 4)

[ Type update... ]            ← Text area with rich UX

[ Upload document ]           ← Drag-drop zone

[ Upload evidence ]           ← Multi-file upload

[Project selector]  [Date]  [Location hint]
```

After submission → show real-time processing pipeline states (wired in Phase 4):

```text
✓ Input received
⏳ Processing...              ← placeholder until AI pipeline is wired
```

### Phase 3 Deliverables

- [ ] Alembic migration 003 — execution_events, evidence, event_evidence
- [ ] Text capture API (stores raw_input, sets status=PENDING_PROCESSING)
- [ ] File upload API with type/size validation, secure storage
- [ ] Browser audio recording component (MediaRecorder API)
- [ ] Polished `/capture` page with all input modes
- [ ] Evidence multi-upload with drag-drop, preview, metadata
- [ ] `/events` list page with status badges, filters
- [ ] File storage abstraction (local in dev, S3-compatible in prod)

### Phase 3 Acceptance Criteria

```
✅ Supervisor types an update → event created in DB with status PENDING_PROCESSING
✅ Supervisor uploads a photo → evidence stored, linked to event
✅ Supervisor records audio → audio file stored (STT not yet wired)
✅ Non-SUPERVISOR users cannot access /capture
✅ Events list shows all submitted events with status
✅ Files validated for type and size before acceptance
```

---

## Phase 4 — AI Extraction Pipeline
**Priority: CRITICAL | Duration: ~4-5 days**

> [!IMPORTANT]
> Every AI provider must be behind an abstraction interface. The app must never hard-code to a single vendor.

### 4.1 Provider Abstraction Layer

```python
# Abstract interfaces
class SpeechProvider(ABC):
    async def transcribe(self, audio_file: bytes, language: str) -> TranscriptionResult

class OCRProvider(ABC):
    async def extract_text(self, image: bytes) -> OCRResult

class LLMProvider(ABC):
    async def extract_structured(self, text: str, schema: dict) -> ExtractionResult

class EmbeddingProvider(ABC):
    async def embed(self, text: str) -> list[float]
```

Providers selected via environment variables. Each call logged with request_id, latency, token usage, provider, model.

### 4.2 Speech-to-Text Pipeline

```text
Audio → SpeechProvider.transcribe() → TranscriptionResult
    ├── transcript
    ├── language
    ├── confidence
    ├── duration
    ├── provider/model
    └── timestamp
```

### 4.3 OCR Pipeline

```text
Image/Scanned PDF → is_digital_pdf?
    ├── YES → PDF text parser (PyPDF2/pdfplumber)
    └── NO  → OCRProvider.extract_text()
              ↓
         Extracted text
```

### 4.4 LLM Structured Extraction

```text
Text (from any source) → LLMProvider.extract_structured()
    ↓
Pydantic-validated JSON:
{
    "event_type": "completed|in_progress|interrupted|blocked|...",
    "activity_description": str,
    "location": str | null,
    "start_time": datetime | null,
    "end_time": datetime | null,
    "quantity": float | null,
    "unit": str | null,
    "blocker": str | null,
    "notes": str | null,
    "evidence_references": list[str]
}
```

Rules enforced:
- Unknown values → `null` (never invented)
- Dates → ISO format
- Time → project timezone
- Raw text preserved alongside extracted values
- Schema validation via Pydantic (strict mode)

### 4.5 Normalization Service

```text
Normalize:
- activity names ("RCC casting" → "Concrete Pouring")
- locations ("Blk-C" → "Block C")
- disciplines
- dates, times, units
- status terms
- blocker terminology

Store both: raw_input + normalized_value
```

### 4.6 Processing Pipeline Orchestration

```text
Event(status=PENDING_PROCESSING)
    ↓
Determine source_type (text | audio | image | pdf | excel)
    ↓
[If audio] → STT → transcript
[If image/scanned PDF] → OCR → text
[If digital PDF] → PDF parser → text
[If Excel/CSV] → structured parser → text
    ↓
LLM extraction → structured data
    ↓
Normalization
    ↓
Update event: normalized_text, extracted fields
Event(status=EXTRACTED)
```

### 4.7 Real Processing UI

Show actual pipeline states on the capture page:

```text
✓ Input received
✓ Speech converted            (if audio)
✓ Text extracted              (if document)
✓ Information extracted
⏳ Finding activity candidates...
```

Each state corresponds to a real backend operation — NOT fake progress.

### Phase 4 Deliverables

- [ ] `SpeechProvider`, `OCRProvider`, `LLMProvider`, `EmbeddingProvider` abstract interfaces
- [ ] OpenAI implementation for each (default)
- [ ] Whisper-compatible STT with transcript, confidence, duration storage
- [ ] OCR with smart digital-vs-scanned PDF detection
- [ ] PDF text parser (pdfplumber)
- [ ] Excel/CSV structured parser
- [ ] LLM structured extraction with Pydantic schema validation
- [ ] Normalization service for activity names, locations, disciplines, dates
- [ ] Pipeline orchestrator that routes by source_type
- [ ] Real-time processing state updates (WebSocket or polling)
- [ ] AI request logging (request_id, latency, tokens, provider, model)
- [ ] Graceful fallbacks: STT fails → "try text input"; OCR fails → retry/manual

### Phase 4 Acceptance Criteria

```
✅ Supervisor records "Line 24 pipe spool erection completed around 3 PM"
   → STT transcribes → LLM extracts → structured JSON validated by Pydantic
✅ Supervisor uploads scanned daily report → OCR → extraction
✅ Digital PDF → text parser (no unnecessary OCR) → extraction
✅ Excel upload → structured parse → extraction
✅ Unknown values are null, never invented
✅ Processing UI shows real pipeline states
✅ If STT provider is down → graceful error message + fallback to text
✅ All AI calls logged with latency, tokens, provider
```

---

## Phase 5 — L5/L6 Matching Engine
**Priority: CRITICAL | Duration: ~3-4 days**

> [!IMPORTANT]
> This is one of the most important parts of NEXUS. The matching engine determines whether field updates get linked to the correct planned activities.

### 5.1 Embedding Generation

- Generate embeddings for all activity names + descriptions upon schedule import
- Store in `activities.embedding` column (pgvector `vector(1536)` type)
- Create IVFFlat or HNSW index on the embedding column

### 5.2 Three-Step Matching Pipeline

**Step 1 — Semantic Retrieval:**
```text
Event normalized_text → EmbeddingProvider.embed()
    ↓
pgvector cosine similarity query
    ↓
Top K=10 candidate activities (filtered by project)
```

**Step 2 — Structured Filtering:**
```text
Filter/boost candidates by:
- project_id (mandatory)
- discipline match
- location match/proximity
- date proximity to planned dates
- activity status (not already completed/cancelled)
- hierarchy level (prefer L6 over L5)
- equipment/tag match
- dependency feasibility
```

**Step 3 — Hybrid Scoring:**
```text
final_score =
    0.40 × semantic_score +
    0.20 × location_score +
    0.15 × discipline_score +
    0.10 × schedule_time_score +
    0.10 × activity_name_score +
    0.05 × dependency_score
```

Weights configurable via admin settings or environment variables.

### 5.3 Match Result Schema

```text
CandidateMatch:
    activity_id
    activity_code
    activity_name
    semantic_score
    location_score
    discipline_score
    schedule_time_score
    activity_name_score
    dependency_score
    final_score
    rank
```

### 5.4 API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/events/{id}/match` | POST | Trigger matching for an extracted event |
| `/api/events/{id}/candidates` | GET | Get ranked candidate list |

### Phase 5 Deliverables

- [ ] Alembic migration — pgvector extension, embedding column, vector index
- [ ] Embedding generation on schedule import (batch process)
- [ ] Semantic retrieval via pgvector cosine similarity
- [ ] Structured filtering rules (project, discipline, location, date, status)
- [ ] Hybrid scoring function with configurable weights
- [ ] `candidate_matches` table storing all candidates per event
- [ ] API to trigger matching and retrieve ranked candidates
- [ ] Unit tests for scoring function with known inputs/outputs

### Phase 5 Acceptance Criteria

```
✅ Event "pipe spool erection at Line 24" → top candidate is the correct L6 activity
✅ Candidate list shows separate scores (semantic, location, discipline, etc.)
✅ Final score is deterministic — same inputs always produce same output
✅ Weights are configurable without code changes
✅ Activities from other projects never appear as candidates
✅ Completed/cancelled activities deprioritized or excluded
```

---

## Phase 6 — Governance & Review Workflow
**Priority: CRITICAL | Duration: ~3-4 days**

### 6.1 Multi-Dimensional Scoring

| Score | What it measures | Calculation |
|---|---|---|
| **Mapping Confidence** | How confidently event maps to an activity | Hybrid matching final_score |
| **Evidence Score** | Completeness/relevance of submitted evidence | Evidence count, type diversity, metadata completeness |
| **Data Quality Score** | Whether required fields are present and valid | Field completeness, format validation, consistency |
| **Risk Score** | How concerning the resulting project condition is | Variance, critical path impact, blocker severity |
| **Overall Governance Score** | Deterministic aggregation for routing | Weighted composite of above |

### 6.2 Governance State Machine

```mermaid
stateDiagram-v2
    [*] --> PROPOSED: AI completes extraction + matching
    PROPOSED --> REVIEW_REQUIRED: governance rules trigger review
    PROPOSED --> APPROVED: auto-accept (high confidence + low impact)
    REVIEW_REQUIRED --> APPROVED: Planner approves
    REVIEW_REQUIRED --> REJECTED: Planner rejects
    REVIEW_REQUIRED --> CORRECTION_REQUIRED: Planner requests correction
    CORRECTION_REQUIRED --> REVIEW_REQUIRED: Corrected & resubmitted
    APPROVED --> SUPERSEDED: Later correction supersedes
```

### 6.3 Governance Rules (Configurable)

```python
if mapping_confidence >= 0.90
   and evidence_score >= 0.80
   and data_quality_score >= 0.90
   and event_impact != HIGH:
    → eligible_for_policy_based_acceptance

else:
    → REVIEW_REQUIRED
```

Thresholds stored in DB config, adjustable via admin UI.

### 6.4 Planner Review Screen (`/review/[eventId]`)

Premium review interface showing:

```text
┌─────────────────────────────────────────────┐
│ Execution Event Review                      │
├─────────────────────────────────────────────┤
│ ① Original Field Report (raw text/audio)    │
│ ② AI Extracted Data (structured fields)     │
│ ③ Candidate Activities (ranked list)        │
│   - Select different activity if needed     │
│ ④ Evidence gallery (photos, docs)           │
│ ⑤ Score breakdown                           │
│   Mapping: 95  Evidence: 82                 │
│   Quality: 96  Risk: 34                     │
│ ⑥ Actions                                  │
│   [ APPROVE ] [ CORRECT ] [ REJECT ]        │
│   Reason field (required for reject/correct)│
└─────────────────────────────────────────────┘
```

### 6.5 Correction Tracking

When planner corrects:

| Field | Value |
|---|---|
| `original_activity_id` | AI's pick |
| `corrected_activity_id` | Planner's pick |
| `corrected_by` | Planner user_id |
| `correction_reason` | Required text |
| `corrected_at` | Timestamp |

Stored in `match_decisions` table. Original decision preserved, never overwritten.

### 6.6 API Endpoints

| Endpoint | Method | Role(s) | Purpose |
|---|---|---|---|
| `/api/review` | GET | PLANNER | Queue of events needing review |
| `/api/review/{eventId}` | GET | PLANNER | Full review detail |
| `/api/events/{id}/approve` | POST | PLANNER | Approve event |
| `/api/events/{id}/reject` | POST | PLANNER | Reject event (reason required) |
| `/api/events/{id}/correct` | POST | PLANNER | Change activity + approve |

### Phase 6 Deliverables

- [ ] Alembic migration — match_decisions, validations, approvals tables
- [ ] Multi-dimensional scoring engine (mapping, evidence, quality, risk)
- [ ] Governance rules engine with configurable thresholds
- [ ] Governance state machine with valid transitions
- [ ] `/review` queue page showing pending events sorted by priority
- [ ] `/review/[eventId]` premium review interface
- [ ] Approve/reject/correct actions with audit trail
- [ ] Correction tracking (original + corrected decision preserved)
- [ ] Review queue filters: by project, score range, date, urgency

### Phase 6 Acceptance Criteria

```
✅ High-confidence + low-impact events auto-accepted
✅ Low-confidence or high-impact events route to review queue
✅ Planner can change the selected activity during review
✅ Rejection requires a reason
✅ Correction records both original and corrected decision
✅ Every governance action writes audit log
✅ Review queue shows count badge in sidebar
```

---

## Phase 7 — Verified Actual & Variance Engine
**Priority: CRITICAL | Duration: ~3 days**

### 7.1 Verified Actual State Transition

```text
Event(governance_status=APPROVED)
    ↓
Create/update Verified Actual record
    ↓
Update activity:
    - actual_start (if first event)
    - actual_end (if completion event)
    - actual_status
    - actual_quantity
    ↓
Evaluate dependencies:
    - If predecessor completed, unlock successors
    - If predecessor delayed, flag successor risk
    ↓
Write audit log (before_state → after_state)
```

### 7.2 Variance Engine (Deterministic — NO LLM)

```python
start_variance  = actual_start  - planned_start     # in days
finish_variance = actual_finish - planned_finish     # in days
duration_variance = actual_duration - planned_duration

# Positive = late, Negative = early
```

Support:
- Activity-level variance
- Milestone variance
- Project-level aggregate variance
- Cumulative delay tracking
- Blocker duration tracking

### 7.3 Risk & Alert Engine (Rule-Based)

| Rule | Trigger | Alert Type |
|---|---|---|
| `finish_variance > threshold` | Activity delayed beyond tolerance | `SCHEDULE_DELAY` |
| `blocker_duration > threshold` | Blocker persisting too long | `BLOCKER_RISK` |
| `critical_activity_delayed` | Activity on critical path delayed | `CRITICAL_PATH_ALERT` |
| `repeated_blocker` | Same blocker type appears ≥N times | `RECURRING_ISSUE` |
| `predecessor_delayed` | Predecessor delayed → successor at risk | `SUCCESSOR_RISK` |

### 7.4 Database Schema (Migration)

| Table | Purpose |
|---|---|
| `alerts` | Generated alerts with severity, status, related activity |
| `risks` | Risk assessments with score, category, mitigation |
| `notifications` | User notifications for alerts, reviews, approvals |

### 7.5 API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/projects/{id}/variance` | GET | Project-level variance summary |
| `/api/activities/{id}/variance` | GET | Activity-level variance detail |
| `/api/projects/{id}/risks` | GET | Active risks |
| `/api/projects/{id}/alerts` | GET | Active alerts |

### Phase 7 Deliverables

- [ ] Verified actual state transition logic
- [ ] Activity status update on approval (actual_start, actual_end, status)
- [ ] Dependency evaluation engine
- [ ] Variance calculation (start, finish, duration — all deterministic)
- [ ] Rule-based risk detection engine with 5+ rules
- [ ] Alert generation and persistence
- [ ] Notification system for reviewers and managers
- [ ] Variance API endpoints
- [ ] Risk/alert API endpoints

### Phase 7 Acceptance Criteria

```
✅ Approved event → activity actual dates updated → variance calculated
✅ Variance shows "+2 days" for a late activity (deterministic, no LLM)
✅ Delayed critical-path activity generates CRITICAL_PATH_ALERT
✅ Dependency: completed predecessor unlocks successor
✅ Delayed predecessor flags successor with SUCCESSOR_RISK
✅ Repeated blocker → RECURRING_ISSUE alert
✅ All state changes audited with before/after state
```

---

## Phase 8 — Dashboard & Analytics
**Priority: HIGH | Duration: ~3-4 days**

### 8.1 Enterprise Dashboard (`/dashboard`)

**Top KPIs (cards):**

| Metric | Source |
|---|---|
| Project Progress | % activities completed vs total |
| Schedule Health | Aggregate variance indicator |
| Delayed Activities | Count where finish_variance > 0 |
| Blocked Activities | Count where status = blocked |
| Open Alerts | Count of unresolved alerts |
| Pending Reviews | Count of events in REVIEW_REQUIRED |
| Verified Events | Count of APPROVED events |

**Visualizations (Recharts):**

| Chart | Type | Purpose |
|---|---|---|
| Progress trend | Line chart | Progress over time |
| Planned vs Actual | Dual bar chart | Per-activity comparison |
| Activity status distribution | Donut/pie | On track / delayed / blocked / completed |
| Delay distribution | Histogram | Distribution of variance days |
| Blocker trend | Bar chart | Blockers over time by category |
| Risk distribution | Heatmap or grouped bar | Risk by discipline/area |
| Activity timeline | Gantt chart | Visual schedule with actuals overlay |

### 8.2 Project-Level Pages

| Page | Content |
|---|---|
| `/projects/[id]/overview` | Project KPIs, recent events, active alerts |
| `/projects/[id]/schedule` | Gantt view with planned vs actual overlay |
| `/projects/[id]/activities` | Full activity table with variance columns |
| `/projects/[id]/analytics` | Deep-dive charts: variance trend, productivity, blockers |
| `/projects/[id]/map` | Location-based view (if geo data available) |

### 8.3 Activity Detail Page (`/projects/[id]/activities/[activityId]`)

Full lifecycle timeline:

```text
Planned → Field Report → AI Extraction → Match → Review → Approval → Verified Actual → Variance
```

Shows: hierarchy, dependencies, evidence gallery, approvals, audit history, risk.

### Phase 8 Deliverables

- [ ] Dashboard page with 7 KPI cards
- [ ] Progress trend line chart
- [ ] Planned vs Actual bar chart
- [ ] Activity status distribution donut chart
- [ ] Delay distribution histogram
- [ ] Gantt chart with planned vs actual overlay
- [ ] Project overview page
- [ ] Activity detail page with full lifecycle timeline
- [ ] Responsive layout for all dashboard components
- [ ] Dashboard aggregation queries optimized with proper indexes
- [ ] Role-based dashboard (PM sees projects, Supervisor sees submissions)

### Phase 8 Acceptance Criteria

```
✅ Dashboard loads in <2s with 100+ activities
✅ Charts reflect real data from database (not hardcoded)
✅ Gantt shows planned bars vs actual bars
✅ Clicking a delayed activity → navigates to activity detail
✅ KPI cards update after an event is approved
✅ All charts answer a practical PM question
✅ Responsive layout works on tablet/desktop
```

---

## Phase 9 — Project Memory & RAG
**Priority: HIGH | Duration: ~3 days**

### 9.1 Project Memory

Only **approved/verified** information enters project memory:

| Memory Type | Source |
|---|---|
| Verified delay | Approved event with positive variance |
| Verified blocker | Approved event with blocker field |
| Actual duration | Computed from verified actual dates |
| Productivity | Quantity / duration |
| Historical variance | Variance records over time |
| Recurring issue | Repeated blocker patterns |
| Validated evidence | Evidence linked to approved events |

**Rejected events NEVER enter organizational memory.**

### 9.2 RAG Pipeline

```text
User question
    ↓
Query embedding (EmbeddingProvider)
    ↓
pgvector retrieval (memory_records + embeddings table)
    ↓
Filter by project_id + user permissions
    ↓
Retrieve validated records only
    ↓
LLM synthesis with retrieved context
    ↓
Answer with source references (event IDs, dates, evidence)
```

### 9.3 RAG UI (`/ask`)

```text
"Ask anything about your project..."

[ What types of delays have we seen on Block C? ]

─────────────────────────────────────────────

3 similar validated events were found.

Common recorded causes:
• Batching plant failure
• Material delivery delay

Average verified delay: 2.4 days

References:
EV-10492 (Sep 12) — Concrete pour delay, Block C
EV-11821 (Sep 18) — Equipment downtime, Block C
EV-13277 (Sep 22) — Material delivery, Block C

[View Event EV-10492] [View Event EV-11821] [View Event EV-13277]
```

Every answer **must expose supporting records**. The LLM **must not invent** historical project information.

### 9.4 API Endpoints

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/rag/query` | POST | Submit question, get grounded answer |
| `/api/memory` | GET | Browse project memory records |

### Phase 9 Deliverables

- [ ] Alembic migration — memory_records, embeddings tables
- [ ] Memory ingestion pipeline (triggered on event approval)
- [ ] Embedding generation for memory records
- [ ] RAG query endpoint with pgvector retrieval + LLM synthesis
- [ ] Permission-scoped retrieval (user only sees their projects' data)
- [ ] Source reference linking in RAG answers
- [ ] `/ask` page with chat-like Q&A interface
- [ ] `/memory` page showing browsable memory records
- [ ] Rejected events excluded from memory and RAG context

### Phase 9 Acceptance Criteria

```
✅ "Have we seen similar delays?" → returns validated events with references
✅ Every RAG answer shows clickable source event references
✅ Rejected events never appear in RAG answers
✅ RAG scoped to user's project permissions
✅ LLM does not invent non-existent project history
```

---

## Phase 10 — Production Hardening, Testing & Deployment
**Priority: HIGH | Duration: ~4-5 days**

### 10.1 Testing

| Test Type | Coverage |
|---|---|
| **Unit Tests** | Scoring functions, normalization, variance calc, risk rules, RBAC permissions |
| **Integration Tests** | Full pipeline: capture → extraction → matching → approval → verified actual |
| **AI Evaluation Tests** | Fixed dataset of field reports → measure extraction accuracy, matching accuracy, false match rate, missing-field rate, review rate |
| **Frontend Tests** | Key flows: login, capture, review, dashboard rendering |

### 10.2 Security Hardening

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt (already in Phase 1) |
| HTTP-only cookies | Secure, SameSite=Strict |
| CSRF tokens | On all state-changing endpoints |
| Input validation | Pydantic (backend) + Zod (frontend) |
| File validation | Type whitelist, size limits, content-type verification |
| Rate limiting | `slowapi` on auth + AI endpoints |
| Request IDs | UUID per request, propagated through logs |
| Secret management | Environment variables only, `.env` gitignored |
| CORS | Restricted to frontend origin |

### 10.3 Observability

```text
Structured logs (JSON):
- request_id, project_id, user_id
- operation, latency, status
- provider, model, token_usage (AI calls)

Health endpoints:
- GET /health — app liveness
- GET /ready  — DB + service readiness
```

### 10.4 Error Handling

| Scenario | Behavior |
|---|---|
| STT unavailable | "Voice processing temporarily unavailable. Submit as text." |
| OCR failure | Retry button + manual text entry fallback |
| LLM failure | Set status `processing_failed`, do NOT create fake event |
| Low matching confidence | Route to manual review |
| Database failure | Do NOT claim successful submission |
| Upload too large | Immediate rejection with size limit message |

### 10.5 Performance Optimization

| Area | Optimization |
|---|---|
| Database | Indexes on foreign keys, status, project_id, timestamps |
| pgvector | HNSW index on embedding columns |
| API | Pagination on all list endpoints, server-side filtering |
| Dashboard | Pre-computed aggregation queries, caching |
| AI calls | Background job queue for long-running STT/OCR/embedding |
| Frontend | Lazy loading, code splitting, React Suspense |

### 10.6 Seed Data

Create realistic demo data for `NEXUS Metro Package A`:

| Data | Count |
|---|---|
| Activities (L5/L6) | 100+ |
| Disciplines | 5+ (Civil, Mechanical, Electrical, Piping, Structural) |
| Dependencies | 50+ |
| Historical execution events | 30+ (mix of approved, rejected, pending) |
| Evidence records | 20+ |
| Alerts | 10+ |
| Audit records | 50+ |
| Users | 5 (one per role) |

### 10.7 Deployment Architecture

```text
Frontend:  Vercel (Next.js)
Backend:   Cloud Run / Railway / Render (FastAPI)
Database:  Managed PostgreSQL (Supabase / Neon / RDS)
Storage:   S3-compatible object storage
```

Deployment-specific code isolated — one env change to switch providers.

### Phase 10 Deliverables

- [ ] Unit test suite (≥80% coverage on scoring, variance, risk, RBAC)
- [ ] Integration test: full capture → approve → variance pipeline
- [ ] AI evaluation dataset with 10+ field reports and expected outputs
- [ ] Security audit: CSRF, rate limiting, input validation, file validation
- [ ] Structured logging throughout
- [ ] Error handling on every layer with user-friendly messages
- [ ] Database indexes optimized
- [ ] Seed data script (`python seed.py`)
- [ ] Docker Compose production profile
- [ ] Deployment documentation
- [ ] `.env.example` with all variables documented
- [ ] README with setup, architecture, API docs links

### Phase 10 Acceptance Criteria

```
✅ Full demo scenario (steps 1-20 from spec) works end-to-end with real data
✅ All unit tests pass
✅ Integration test: capture → extraction → match → approve → variance → memory → RAG
✅ No hardcoded demo values in production components
✅ Error gracefully handled on every AI provider failure
✅ Application starts with docker-compose up
✅ Seed data makes dashboard look alive immediately
```

---

## End-to-End Demo Scenario Validation

The final validation is the 20-step demo from the spec. Every step must work with real application state:

| Step | Action | System Behavior |
|---|---|---|
| 1 | Planner imports `Construction_Schedule.xlsx` | Schedule created, 100+ L5/L6 activities |
| 2 | Activities created | Hierarchy, deps, planned dates, embeddings |
| 3 | Supervisor records voice: "Line 24 pipe spool erection completed around 3 PM" | Audio stored |
| 4 | STT converts | Transcript created with confidence |
| 5 | LLM extracts | Structured JSON validated by Pydantic |
| 6 | Normalization | Terms standardized |
| 7 | pgvector retrieves | Candidate activities found |
| 8 | Hybrid matching ranks | Deterministic scoring |
| 9 | Best match displayed | L6-00231, confidence 95 |
| 10 | Evidence attached | Photo linked to event |
| 11 | Governance determines | REVIEW_REQUIRED |
| 12 | Planner opens review | Full review interface |
| 13 | Planner approves | Governance status → APPROVED |
| 14 | Verified actual created | Activity actual dates updated |
| 15 | Variance calculated | Planned: Oct 8, Actual: Oct 10, Variance: +2 days |
| 16 | Risk alert generated | SCHEDULE_DELAY alert |
| 17 | Audit log records | Every transition traceable |
| 18 | Memory ingested | Verified event enters project memory |
| 19 | Manager asks: "Similar delays?" | RAG query submitted |
| 20 | RAG answers with references | Grounded answer with event IDs |

---

## Phase Dependency Map

```mermaid
graph LR
    P1["Phase 1\nFoundation"]
    P2["Phase 2\nSchedule"]
    P3["Phase 3\nField Capture"]
    P4["Phase 4\nAI Extraction"]
    P5["Phase 5\nMatching"]
    P6["Phase 6\nGovernance"]
    P7["Phase 7\nVerified Actual"]
    P8["Phase 8\nDashboard"]
    P9["Phase 9\nMemory + RAG"]
    P10["Phase 10\nProduction"]

    P1 --> P2
    P1 --> P3
    P2 --> P5
    P3 --> P4
    P4 --> P5
    P5 --> P6
    P6 --> P7
    P7 --> P8
    P7 --> P9
    P8 --> P10
    P9 --> P10

    style P1 fill:#0f766e,color:#fff
    style P2 fill:#0f766e,color:#fff
    style P3 fill:#0f766e,color:#fff
    style P4 fill:#0f766e,color:#fff
    style P5 fill:#0f766e,color:#fff
    style P6 fill:#0f766e,color:#fff
    style P7 fill:#0f766e,color:#fff
    style P8 fill:#115e59,color:#fff
    style P9 fill:#115e59,color:#fff
    style P10 fill:#115e59,color:#fff
```

> [!NOTE]
> Phases 2 and 3 can proceed in parallel after Phase 1 is complete. Phases 8 and 9 can proceed in parallel after Phase 7 is complete.

---

## Estimated Timeline Summary

| Phase | Name | Duration | Dependencies |
|---|---|---|---|
| **1** | Foundation & Infrastructure | 3-4 days | — |
| **2** | Schedule Management | 3 days | Phase 1 |
| **3** | Field Capture | 2-3 days | Phase 1 (parallel with P2) |
| **4** | AI Extraction Pipeline | 4-5 days | Phase 3 |
| **5** | L5/L6 Matching Engine | 3-4 days | Phase 2 + Phase 4 |
| **6** | Governance & Review | 3-4 days | Phase 5 |
| **7** | Verified Actual & Variance | 3 days | Phase 6 |
| **8** | Dashboard & Analytics | 3-4 days | Phase 7 (parallel with P9) |
| **9** | Project Memory & RAG | 3 days | Phase 7 (parallel with P8) |
| **10** | Production Hardening | 4-5 days | Phase 8 + Phase 9 |
| | **Total** | **~32-39 days** | |

> [!CAUTION]
> The current Vite SPA codebase will need to be **restructured into a Next.js monorepo**. The existing screen components (Landing, Login, Capture, Review) contain useful UI patterns that can be adapted, but the routing, data layer, and project structure will be rebuilt.
