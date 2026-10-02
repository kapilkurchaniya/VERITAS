# VERITAS (NEXUS) Rebuild Master Plan

## 1. Executive Summary & Core Philosophy

VERITAS (formerly NEXUS) is a Production-Grade AI Project Execution Intelligence Platform for infrastructure and construction projects. 

The previous iteration suffered from compounding bugs, tight coupling, and technical debt. This document serves as the **perfect master plan for a clean-slate rebuild** in a new repository. It uses the original concept as a reference but establishes a rigorous, bug-free, and scalable foundation.

**The Golden Rule of VERITAS Architecture:**
> **AI interprets and proposes. Deterministic software validates and calculates. Humans/policies govern authoritative project state.** 
> *Never allow an LLM to directly modify authoritative schedule state.*

---

## 2. Recommended Tech Stack

To ensure a robust, typed, and scalable system, the rebuild should utilize the following stack (mirroring the original but strictly enforcing best practices):

### Backend (API)
- **Framework:** FastAPI (Python 3.12+)
- **Database:** PostgreSQL with `pgvector` (for RAG/embeddings)
- **ORM:** SQLAlchemy 2.0 (Strict Async) + Alembic for migrations
- **Validation:** Pydantic V2
- **AI Integration:** OpenAI API (structured outputs) + LangChain/LlamaIndex (for RAG orchestration)
- **Document Processing:** `pdfplumber`, `pytesseract` (OCR), `whisper` (Speech-to-Text)

### Frontend (Web)
- **Framework:** Next.js (App Router, React 19)
- **Styling:** Tailwind CSS v4 + Framer Motion (for premium micro-interactions)
- **State Management:** Zustand (Global) + React Query/SWR (Server State & Caching)
- **UI Components:** Radix UI / Shadcn UI (for accessible, unstyled primitives)

---

## 3. Core Domain Models (The Database Foundation)

A major source of bugs in complex systems is poorly defined database schemas. The new schema must strictly separate *planned* vs *actual* state and *proposed* vs *approved* data.

1. **Users & Roles:** RBAC (Admin, Project Manager, Field Supervisor, Reviewer).
2. **Projects:** The root entity.
3. **Schedules (L5/L6 Activities):** 
   - Immutable *Planned* state (Baseline).
   - Mutable *Actual* state (Updated only via approved governance).
4. **Field Events (Capture):** Raw inputs (Voice, Image, PDF, Text) from the field.
5. **AI Proposals:** The structured extraction from a Field Event, mapping to a specific Schedule Activity with a confidence score.
6. **Governance (Reviews):** The human approval workflow linking an AI Proposal to a final Schedule update.
7. **Variances & Alerts:** Deterministically calculated discrepancies between Planned vs Actual states.
8. **Audit Log:** Immutable ledger of every state change.

---

## 4. Rebuild Phases (Step-by-Step)

To avoid getting overwhelmed and introducing bugs, the rebuild must follow a strict sequential order. **Do not move to the next phase until the current phase is fully tested.**

### Phase 1: Foundation & Security (Days 1-3)
- Set up the monorepo structure (Turborepo recommended).
- Configure strict ESLint/Prettier (Web) and Ruff/Mypy (API).
- Implement robust Authentication (JWT) and RBAC.
- Define SQLAlchemy models and run initial Alembic migrations.
- Create the core layout, routing, and design system in Next.js.

### Phase 2: Core Project & Schedule Data (Days 4-6)
- Build CRUD APIs for Projects and Schedule Activities.
- Implement the baseline schedule vs. actual schedule logic.
- Create the Web UI for the Project Dashboard and Schedule Gantt/List views.
- **Rule:** No AI at this stage. Ensure traditional deterministic data flows work perfectly.

### Phase 3: The AI Ingestion & Processing Pipeline (Days 7-12)
This is the heart of VERITAS. It must be decoupled into distinct steps:
1. **Capture API:** Accept multipart/form-data (audio, images, pdfs).
2. **Preprocessing Worker:** Convert voice to text, extract text from PDFs/Images.
3. **AI Extraction:** Send parsed text to LLM to extract structured JSON (Entities: Progress %, Issues, Blockers, Dates).
4. **Hybrid Matching:** Match extracted entities to candidate L5/L6 activities using vector similarity + keyword matching.
5. **Proposal Generation:** Save the AI's conclusion as a *Proposal*, **not** a state change.

### Phase 4: Governance & Deterministic Engine (Days 13-16)
- Build the "Review Inbox" for human supervisors.
- UI for side-by-side comparison (Raw Field Data vs AI Proposal).
- Implement the Accept/Reject/Modify API.
- **The Variance Engine:** Upon approval, a deterministic Python service updates the Schedule Actuals and calculates delays/variances.
- Trigger Alerts based on Variance thresholds.

### Phase 5: RAG & Project Memory (Days 17-20)
- Embed approved field reports, schedule updates, and meeting notes into `pgvector`.
- Build the `/ask` conversational interface.
- Implement strict context filtering (ensure RAG only retrieves data for the specific project the user has access to).

---

## 6. Critical Pitfalls to Avoid (Lessons Learned)

Based on common failures in AI-driven enterprise apps, avoid these at all costs:

1. **AI Hallucinating State Changes:** The AI must only ever write to `ai_proposals` tables. It must never run an `UPDATE` on a `schedule_activities` table.
2. **Missing Transactional Integrity:** When a human approves a proposal, the update to the schedule, the creation of a variance, and the audit log entry MUST happen in a single SQL transaction. If one fails, they all rollback.
3. **Frontend State Desync:** Use React Query/SWR to ensure the dashboard automatically re-fetches data after a governance approval. Do not rely on manual state mutations.
4. **Poor Error Handling in Pipeline:** The AI pipeline will fail (OCR failure, LLM timeout, hallucinated JSON). The pipeline must fail gracefully, alerting the user that manual entry is required, rather than crashing the system.
5. **Slow UI:** The Next.js dashboard must feel instant. Use React Suspense and loading skeletons heavily, especially around the Variance tables and Governance inbox.

---

## 7. Recommended Directory Structure for New Repo

```text
veritas-v2/
├── apps/
│   ├── api/                  # FastAPI Backend
│   │   ├── app/
│   │   │   ├── api/          # Route handlers (v1)
│   │   │   ├── core/         # Config, Security, DB session
│   │   │   ├── models/       # SQLAlchemy models
│   │   │   ├── schemas/      # Pydantic validation models
│   │   │   ├── services/     # Business logic (Variance Engine, AI Pipeline)
│   │   │   └── tasks/        # Background processing (if using Celery/RQ)
│   │   ├── alembic/          # Database migrations
│   │   └── pyproject.toml    # Python dependencies (use uv or poetry)
│   └── web/                  # Next.js Frontend
│       ├── src/
│       │   ├── app/          # App router pages (dashboard, login, etc.)
│       │   ├── components/   # UI primitives and shared components
│       │   ├── lib/          # API clients, utils, store (Zustand)
│       │   └── hooks/        # React Query hooks
│       ├── package.json
│       └── tailwind.config.ts
├── packages/                 # (Optional) Shared types or configs
├── .gitignore
├── docker-compose.yml        # For local Postgres, Redis, etc.
└── README.md
```

---

## 8. Environment Variables (.env)

The following `.env` structure represents exactly what is currently being used in the VERITAS (NEXUS) ecosystem. 

> [!CAUTION]
> Do not commit the actual `.env` file to version control. The keys listed below outline what is required and what each service does.

### Database Configuration (Neon Postgres)
- `DATABASE_URL_SYNC`: Synchronous connection string for Alembic migrations (e.g., `postgresql://...neon.tech/neondb?sslmode=require`).
- `DATABASE_URL`: Asynchronous connection string for the FastAPI app (e.g., `postgresql+asyncpg://...neon.tech/neondb?ssl=require`).

### Security & Authentication
- `AUTH_SECRET`: Used to cryptographically sign JWT access tokens.
- `AUTH_ALGORITHM`: The hashing algorithm for JWTs (e.g., `HS256`).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Lifespan of the access token (e.g., `480` for 8 hours).

### AI Providers & Fallback Engine
VERITAS utilizes a multi-model fallback engine (`LLM_PROVIDER=fallback` and `LLM_MODEL=fallback-auto`) for robust AI processing.
- `GEMINI_API_KEY`: Used for Gemini models and specifically for generating embeddings (`text-embedding-004`).
- `GROQ_API_KEY`: Used for ultra-fast LLM inference and specifically for the free Whisper endpoint (Speech-to-Text).
- `HUGGINGFACE_API_KEY`: Used for accessing open-source models or alternative embeddings via Hugging Face.
- `COHERE_API_KEY`: Used for advanced embeddings or document reranking.
- `TAVILY_API_KEY`: Used for agentic web search to augment the AI's knowledge base.

### Vector Database (RAG & Memory)
- `PINECONE_API_KEY`: Connects to Pinecone for storing and retrieving project memory.
- `PINECONE_INDEX_NAME`: The specific index name (e.g., `nexus`).

### Email Notifications (SMTP)
- `EMAIL_USER`: The Gmail address used to send out system alerts and governance notifications.
- `EMAIL_APP_PASSWORD`: The Google App Password used to authenticate the SMTP session.

### Storage 
- `STORAGE_PROVIDER`: Set to `local` for storing field photos, audio, and PDFs.
- `STORAGE_PATH`: Directory path for local file storage (e.g., `./uploads`).

### Communication & Configuration
- `NEXT_PUBLIC_API_URL`: Configures the Next.js frontend to point to the FastAPI backend (e.g., `http://localhost:8000`).
- `BACKEND_CORS_ORIGINS`: Configures FastAPI to allow CORS requests from the frontend domain (e.g., `http://localhost:3000`).
- `LOG_LEVEL`: Verbosity of backend logging (e.g., `INFO`).
