# VERITAS Master Build Blueprint (Full Detail)

> **AI interprets and proposes. Deterministic software validates and calculates. Humans and policy govern authoritative state.**

Six parts: **1** Roles and real-user workflow, **2** Clean UI system, **3** Phases day by day, **4** Technical contracts, **5** Testing, team, demo, **6** API keys and environment.

---

# PART 1: ROLES AND REAL-USER WORKFLOW

## 1.1 The roles

| Role | Real person | Owns | Never does |
| --- | --- | --- | --- |
| **Admin** | IT / PMO lead | Projects, users, role assignment, baseline import, policy thresholds, audit access | Approves field events (separation of duties) |
| **Field Supervisor** | Site engineer, foreman | Submitting voice/text/photo/PDF, answering clarifications | Sees other projects, edits schedule |
| **Planner / Reviewer** | Planning engineer | Review Inbox (approve, correct, reject, clarify), baseline revisions (versioned) | Edits audit log, overwrites silently |
| **Project Manager** | Decision maker | Dashboard, variance, alerts, traceability, Ask (RAG) | Edits raw events or proposals |
| *Viewer (optional)* | Senior management | Read-only dashboard | Everything else |

Roles are **per project** (`project_members`). The same person can be Planner on one project and Supervisor on another.

## 1.2 Who hands what to whom

| From to | Handed over | Feedback that comes back |
| --- | --- | --- |
| Admin to all | Project, baseline, accounts, thresholds | Usage and audit visibility |
| Supervisor to system | Raw event and evidence | Status on every submission: Received, Processing, Needs review, Applied, Rejected, Question for you |
| Pipeline to Planner | Proposal: extracted fields, top candidates, both confidence scores, evidence flags | The decision is stored and used to measure matching quality |
| Planner to Supervisor | Clarification question ("Line 24 or 26?") | Reply attaches to the same event and evidence chain |
| Engine to PM | Variance, blocker alerts, forecast (labelled as forecast) | PM instructions are logged |
| Memory to PM / Planner | Cited answers from **approved** records only | Rejected data never becomes "truth" |

Users trust systems that talk back. A supervisor who never learns the fate of a report stops reporting.

## 1.3 One real day (all four roles)

Setup: Dev (Admin) created *NH-47 Bypass Package 3*, imported 1,240 activities, invited Ravi (Supervisor), Meena (Planner), Arjun (PM).

| Time | Who | What happens |
| --- | --- | --- |
| 15:05 | Ravi | Taps the mic: *"Line 24 pipe spool erection completed around 3 PM"* and attaches a photo. Sees **Received** at once |
| 15:05 | Pipeline | Speech-to-text, extraction (nulls where unknown), normalize, pgvector top 5, hybrid score. Match L5.2.14, mapping 0.96. Evidence flags computed. Completion events always go to review, so **Needs review** |
| 15:10 | Meena | Opens the inbox. Left: transcript and photo. Right: extracted fields, three candidates, evidence panel. Clicks **Approve** |
| 15:10 | Engine | One transaction: new actual version, variance, audit entry, notification. Ravi sees **Applied** |
| 15:11 | Arjun | Dashboard refetches on its own; activity turns green |
| Next day 10:20 | Ravi | *"Block C concreting stopped at 1, batching plant failed, resume tomorrow"* |
| 10:22 | Engine | Interruption recorded, successor check finds 2 activities slipping, **critical alert** raised |
| 10:23 | Arjun | Opens the alert, then the traceability chain down to Ravi's audio. Asks *"Have we had batching plant failures before?"* and gets cited past records |
| 11:00 | Meena and Ravi | Photo lacks location data. Meena taps **Request clarification**. Ravi replies; the reply joins the evidence chain |
| Later | Dev | Opens the audit explorer and exports the full history of that event |

## 1.4 Permission matrix

| Action | Admin | Supervisor | Planner | PM |
| --- | --- | --- | --- | --- |
| Create project, import baseline, manage users, set policy | Yes | No | No | No |
| Submit events and evidence | No | Yes (own project) | No | No |
| See own submissions and status | No | Yes | Yes | Yes |
| Answer clarification | No | Yes | No | No |
| Review inbox: approve, correct, reject, clarify | No | No | Yes | No |
| Revise baseline (new version) | No | No | Yes | No |
| Dashboard, variance, alerts | Yes | No | Yes | Yes |
| Traceability drill-down | Yes | Own events | Yes | Yes |
| Ask (RAG) | Yes | No | Yes | Yes |
| View audit log | Yes | No | Yes | Read-only |
| Edit audit log or delete evidence | **Nobody** |  |  |  |

## 1.5 Notifications and deadlines

| Trigger | Who | Channel |
| --- | --- | --- |
| Proposal waiting | Planner | In-app; email if unreviewed after 4h; escalates to PM after 8h |
| Clarification requested | Supervisor | In-app and email; reminder after 24h |
| Approved, corrected, rejected | Supervisor | In-app |
| Critical alert | PM, Planner | In-app and email |
| Pipeline failure (`MANUAL_ENTRY_REQUIRED`) | Supervisor | In-app with a link to the manual form |

---

# PART 2: CLEAN UI SYSTEM

## 2.1 Principles

1. **One job per screen** and at most one primary button.
2. **Calm neutral surfaces**, one accent colour; colour appears only to mean status.
3. **Two meters, never one**: mapping confidence and evidence completeness are shown separately.
4. **Plain words**: `IN_REVIEW` shows as "Needs review". No raw enums reach users.
5. **Every data view has loading, empty and error states.**
6. **Supervisor is mobile-first (375px); Planner, PM and Admin are desktop-first (1280px).**

## 2.2 Design tokens

| Item | Choice |
| --- | --- |
| Fonts | Inter (UI), JetBrains Mono (IDs, times) |
| Grid and shape | 4px spacing, 8px radius, one soft shadow |
| Colours | Neutral greys, one accent (indigo or teal). Status: grey Received, blue Processing, amber Needs review / Question, green Applied, red Rejected / Delayed / Failed. Always chip **plus text** |
| Themes | Light and dark via CSS variables from day one |
| Motion | Framer Motion only for chip changes and drawers |

**Components:** `AppShell` (role-aware sidebar, project switcher, bell), `StatusChip`, `ScoreMeter`, `EventCard`, `CompareView`, `ActivityPicker`, `AuditTimeline`, `DataTable` with skeleton, `KpiCard`, `GanttOverlay`, `EmptyState`, `ErrorState`, `Toast`, `ConfirmDialog`.

## 2.3 Screens per role

**Supervisor (PWA)**

- *Capture:* project switcher, one large mic button, text box, photo and file buttons, "sending" progress.
- *My Submissions:* cards with status chips; tap for detail and timeline.
- *Clarifications:* the question, a voice/text reply box.
- *Failure state:* "We couldn't process this. Enter it manually" with a short form.

**Planner**

- *Inbox:* list with filters (confidence band, event type, risk), count badge, keyboard J/K/A/R.
- *Review screen:* left raw input (transcript, audio, photo); middle extracted fields, editable; right candidates via `ActivityPicker` with `ScoreMeter`s and the evidence panel. Buttons: Approve, Modify, Ask clarification, Reject (reason required).
- *Schedule:* Gantt with actuals overlay.

**Project Manager**

- *Dashboard:* four KPIs (On track, Delayed, Open alerts, Pending reviews), variance heatmap, planned-vs-actual Gantt, alerts and blockers list, forecast (labelled).
- *Traceability drawer:* any number opens alert, variance, actual, approval, match, raw input, evidence.
- *Ask:* chat with **source chips**; if nothing validated exists, it says so.

**Admin**

- Project wizard, import mapper (upload, preview, map columns, row-level errors), users and roles, policy sliders, audit explorer with filters and export.

## 2.4 UI behaviour rules

- Approvals are **never optimistic**: wait for the server, then React Query invalidates dashboard, inbox and submission queries.
- Skeletons for variance tables and the inbox; content appears in under 2 seconds on seeded data (target).
- Keyboard operable, AA contrast, visible focus, times in the user's timezone.

---

# PART 3: PHASES DAY BY DAY

Tags: **\[API\]** backend, **\[AI\]** pipeline, **\[UI\]** frontend, **\[OPS\]** infra/QA.

## Phase 0: Prep (Day 0)

- \[OPS\] Turborepo (`apps/api`, `apps/web`), docker-compose (Postgres + pgvector, Redis), Ruff/Mypy, ESLint/Prettier, pre-commit, CI. `.env.example` with names only.
- \[OPS\] Seed script: demo project, \~50 activities, four users.
- \[UI\] Agree tokens; sketch the four screens above.
- **Gate:** `docker compose up` gives green health checks; login page renders.

## Phase 1: Foundation and security (Days 1-3)

- Day 1 \[API\] All models, first Alembic migration, DB roles (see 4.2). \[UI\] Tokens, `AppShell`, `StatusChip`, skeleton/empty/error components.
- Day 2 \[API\] JWT (HS256, 480 min), `require_project_role()` on every route. \[UI\] Login, route guards, role-aware sidebar, React Query client.
- Day 3 \[API\] Tests for every role against every route; OpenAPI to TypeScript types. \[UI\] `/dev/ui` component gallery.
- **Gate:** four users land on four different homes; wrong-role calls return 403 (tested); migrations go up and down.

## Phase 2: Projects and schedule, no AI (Days 4-6)

- Day 4 \[API\] Project CRUD, import endpoint (CSV/XLSX via Pandas/OpenPyXL), row-level validation report. \[UI\] Project wizard.
- Day 5 \[API\] Baseline lock, versioned actuals, dependency storage. \[UI\] Import mapper with preview.
- Day 6 \[API\] Schedule and dashboard read endpoints. \[UI\] Schedule list, Gantt, dashboard shell with seeded actuals.
- **Gate:** a 1,000-row file imports with errors reported cleanly; editing a locked baseline returns 409; actuals change only via the service layer.

## Phase 3: AI pipeline (Days 7-12)

- Day 7 \[AI\] Start the **golden set (60-100 utterances with expected JSON and correct activity)**. \[API\] `POST /events` returns 202 plus tracking ID. \[UI\] Capture screen.
- Day 8 \[AI\] Preprocessor: Groq Whisper, pdfplumber/OCR, EXIF. Failures set `MANUAL_ENTRY_REQUIRED`. \[UI\] Submission status chips.
- Day 9 \[AI\] Extraction with constrained schema and provider fallback (Gemini, Groq, Hugging Face). \[UI\] Submission detail and timeline.
- Day 10 \[AI\] Normalization (synonym table) and embeddings of activities. \[UI\] Manual-entry fallback form.
- Day 11 \[AI\] Hybrid matching and scores. \[API\] `ai_proposals` plus `match_candidates`. \[UI\] Clarification inbox.
- Day 12 \[AI\] Golden set in CI, failure-injection tests. \[UI\] Polish.
- **Gate (starting targets):** extraction ≥ 90% field accuracy, correct activity in top 3 ≥ 90% on the golden set; every failure mode lands in a visible queue.

## Phase 4: Governance and deterministic engine (Days 13-16)

- Day 13 \[API\] Proposal list/detail, policy engine. \[UI\] Inbox with filters.
- Day 14 \[API\] Approval transaction (4.5), row locking. \[UI\] Review screen and `CompareView`.
- Day 15 \[API\] Variance engine, dependency check, alerts, notifications and email. \[UI\] PM dashboard KPIs, alerts, audit drawer.
- Day 16 \[API\] Correct, reject, clarify flows, concurrency tests. \[UI\] Keyboard shortcuts, traceability drawer.
- **Gate:** end-to-end test (submit, approve, dashboard updates itself, audit shows the chain); force the audit insert to fail and nothing persists; two planners approving the same proposal resolve safely.

## Phase 5: Memory, RAG and polish (Days 17-20)

- Day 17 \[AI\] Embedding job for approved records. Day 18 \[AI\] `/ask` with project-scoped retrieval and citations. \[UI\] Ask page.
- Day 19 \[UI\] Skeleton coverage, dark mode, real-phone test, empty and error copy. \[OPS\] Demo seed data.
- Day 20 \[OPS\] Rehearse the demo three times.
- **Gate:** Project A user never retrieves Project B; rejected events never appear; the 1.3 day runs live with four logged-in users.

---

# PART 4: TECHNICAL CONTRACTS

## 4.1 Event lifecycle

`RECEIVED` to `PROCESSING` to `EXTRACTED` to `MATCHED` to `PROPOSED`, then one of `IN_REVIEW`, `NEEDS_CLARIFICATION`, `AUTO_APPROVED` (policy, off by default), then `APPROVED` to `APPLIED`, or `REJECTED`. Any stage failure goes to `MANUAL_ENTRY_REQUIRED`.

## 4.2 Tables and hard constraints

`users`, `projects` (policy JSONB), `project_members`, `schedule_versions`, `activities` (planned, immutable), `activity_dependencies`, `activity_actuals` (append-only, `version`, `supersedes_id`), `field_events`, `evidence`, `extractions`, `ai_proposals`, `match_candidates`, `validations`, `variances`, `alerts`, `notifications`, `audit_log`, `memory_records` (`vector(768)`, `embedded_at`).

- Partial unique index: **one current actual per activity**.
- Every table carries `project_id`; every query goes through `require_project_role()`.

```sql
CREATE ROLE ai_worker LOGIN;
GRANT SELECT ON activities TO ai_worker;
GRANT INSERT, SELECT ON extractions, ai_proposals, match_candidates TO ai_worker;
REVOKE UPDATE, DELETE ON activities, activity_actuals FROM ai_worker;
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;
```

## 4.3 Extraction schema (missing means `null`)

```json
{
  "event_type": "completion | start | interruption | resumption | delay | other",
  "activity_description": "pipe spool erection",
  "candidate_location": "Line 24",
  "start_time": null,
  "end_time": "15:00",
  "status": "completed",
  "quantity": null,
  "blocker": null,
  "expected_resumption": null,
  "evidence_reference": "P-1827",
  "notes": null
}
```

Invalid JSON gets one repair retry, then `MANUAL_ENTRY_REQUIRED`.

## 4.4 Hybrid match score

Starting weights (tune on the golden set): semantic 0.45, exact ID 0.20, location 0.15, discipline 0.10, equipment 0.05, schedule window 0.05. A valid activity ID in the text sets a floor of 0.95. Dependency state is a plausibility check, not a weight. Stored per candidate so alternatives stay visible.

## 4.5 Governance policy and approval transaction

| Condition | Behaviour |
| --- | --- |
| Completion, critical-path, or high-severity blocker | **Always human review** |
| Confidence ≥ 0.92 and low impact | Auto-approve only if the project enables it (default off); audited; planner can revert as a new version |
| 0.70 to 0.92 | Planner review |
| Below 0.70 or missing critical field | No state change; clarification request |
| Weak or missing evidence | Flagged, never treated as verified |

```
BEGIN
  SELECT proposal FOR UPDATE; require status = pending
  lock activity row
  insert activity_actuals (version + 1, supersedes previous)
  compute variance; check successors; insert alerts if thresholds crossed
  insert validation, audit_log (before, after), notifications, memory_record (embedded_at = null)
  set proposal status
COMMIT   -- embedding happens after commit in a worker, never inside the transaction
```

## 4.6 Variance rules (deterministic)

Start and finish variance = actual minus planned, in working days. Interruptions create a **forecast** slip, labelled as forecast. Severity is critical when the activity is on the critical path or any successor slips by a day or more; thresholds come from project policy.

## 4.7 API map

```
Auth       POST /auth/login | GET /auth/me
Admin      POST /projects | POST /projects/{id}/schedule/import
           GET, POST /users | PATCH /projects/{id}/policy | GET /audit
Supervisor POST /events (multipart) | GET /events/mine
           POST /events/{id}/clarification-response
Planner    GET /proposals?status=pending | GET /proposals/{id}
           POST /proposals/{id}/approve | correct | reject | request-clarification
PM         GET /projects/{id}/dashboard | variances | alerts
           POST /projects/{id}/ask
```

## 4.8 Failure handling

| Failure | Result | User sees |
| --- | --- | --- |
| Speech-to-text fails | `MANUAL_ENTRY_REQUIRED` | "Couldn't hear this. Type it instead" |
| OCR unreadable | Flag, continue with typed text | Evidence marked weak |
| LLM timeout | Next provider, then manual entry | Status stays Processing, then manual form |
| No candidates | `NEEDS_CLARIFICATION` | Planner asks supervisor |

---

# PART 5: TESTING, TEAM, DEMO

**Testing:** unit (schema, scoring, variance, policy thresholds); golden set in CI after any prompt or model change; integration for failure modes; Playwright per role plus the full four-role day; isolation tests (cross-project, AI role cannot update schedule).

| Person | Owns |
| --- | --- |
| A Backend | models, auth, schedule, governance transaction, audit |
| B AI | speech, extraction, matching, RAG, golden set |
| C Frontend | Supervisor PWA, Planner inbox and review |
| D Frontend | PM dashboard, traceability, Ask, design system |
| E (optional) | DevOps, tests, demo data |

Freeze API schemas and generated TypeScript types at the end of Phase 1; hold a 15-minute daily sync against the phase gate.

**Demo (12 min):** problem and golden rule (1) · Admin baseline and policy (2) · Supervisor live voice report (3) · Planner review and approval (2) · PM alert, traceability, Ask (2) · audit log and "what we don't claim" (1) · architecture in one line (1).

**Seven things that keep this rebuild alive:** AI writes only to proposals (DB-enforced) · approval is one transaction · everything versioned, audit immutable · failures become visible queues · React Query refetch, no manual sync · golden set in CI from Day 7 · uncertainty is always shown, with separate mapping and evidence scores.

---

# PART 6: API KEYS AND ENVIRONMENT

## 6.1 Every key, what it does, and whether we need it

| Variable | Service | Used for | Phase | Status |
| --- | --- | --- | --- | --- |
| `DATABASE_URL`, `DATABASE_URL_SYNC` | Neon Postgres | App connection (asyncpg); Alembic migrations (sync) | 0+ | **Required** |
| `AUTH_SECRET`, `AUTH_ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES` | JWT | Signing tokens (HS256, 480 min) | 1 | **Required** |
| `LLM_PROVIDER=fallback`, `LLM_MODEL=fallback-auto` | Internal | Switches on the provider fallback chain | 3 | **Required** |
| `GEMINI_API_KEY` | Google Gemini | Primary extraction LLM and **all embeddings** (`text-embedding-004`, 768 dims) | 3, 5 | **Required** |
| `GROQ_API_KEY` | Groq | Whisper speech-to-text and fast LLM fallback | 3 | **Required** (speech) |
| `HUGGINGFACE_API_KEY` | Hugging Face | Last-resort fallback model | 3 | Optional |
| `COHERE_API_KEY` | Cohere | Reranking candidate activities or RAG results | 3, 5 | Optional: add only if the golden set shows it improves top-3 accuracy |
| `TAVILY_API_KEY` | Tavily | Web search | none | **Leave out.** Ask must answer only from validated project records; web search would bring generic answers back in |
| `PINECONE_API_KEY`, `PINECONE_INDEX_NAME` | Pinecone | none | none | **Remove.** pgvector replaces it |
| `EMAIL_USER`, `EMAIL_APP_PASSWORD` | Gmail SMTP | Clarification, approval and critical-alert emails | 4 | **Required** for the alert demo |
| `STORAGE_PROVIDER=local`, `STORAGE_PATH` | Local disk | Field audio, photos, PDFs | 0 | **Required**; mount a Docker volume so files survive restarts |
| `NEXT_PUBLIC_API_URL`, `BACKEND_CORS_ORIGINS`, `LOG_LEVEL` | Config | Frontend-to-API URL, allowed origins, log verbosity | 0 | Required, **not secrets** |
| `DATABASE_URL_AI` (new) | Neon Postgres | Connection string for the restricted `ai_worker` role (see 4.2) | 3 | **Required** |

## 6.2 How the providers are used

| Job | Chain | Notes |
| --- | --- | --- |
| Extraction | Gemini, then Groq, then Hugging Face | 20s timeout, one retry per provider, then the next |
| Speech-to-text | Groq Whisper | On failure the event goes to `MANUAL_ENTRY_REQUIRED` |
| Embeddings | Gemini only | **Never switch models mid-project**; the 768-dim column would need a full re-embed |
| Reranking | Cohere (optional) | Only after the golden set proves it helps |

Record the provider and model on every extraction (`extractions.provider`, `extractions.model`) so the audit trail shows which model produced each proposal.

## 6.3 Rules for handling keys

1. `.env` is in `.gitignore`. Only `.env.example` is committed, with **names and placeholders, never real values**.
2. Keys live on the server only. The browser sees only `NEXT_PUBLIC_*`, which must hold no secret. The frontend never calls Gemini or Groq directly.
3. **Rotate any key that has appeared in a chat, document, screenshot or git history.** Do this before the demo, not after.
4. Generate `AUTH_SECRET` fresh with `openssl rand -hex 32`. Use different secrets for dev and demo.
5. Use separate keys per environment (dev, demo) and keep a **backup key set** for demo day in case of quota limits.
6. Least privilege: the API connects as the app role, the AI worker connects with `DATABASE_URL_AI`.
7. Gmail: turn on 2-step verification, use an **App Password**, and use a dedicated project account, not a personal one.
8. Fail fast: load settings with `pydantic-settings` so a missing variable stops startup with a clear message. `/health` reports which providers are reachable and **never prints keys**.
9. Protect free-tier quotas: rate-limit submissions per user, queue with backoff, embed each activity **once** at import, and log usage per provider.
10. Never log keys, and redact personal data from logged prompts. Field audio and text go to third-party providers; disclose that before any real deployment.

```bash
# .env.example (names only)
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST/DB?ssl=require
DATABASE_URL_SYNC=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
DATABASE_URL_AI=postgresql+asyncpg://ai_worker:PASSWORD@HOST/DB?ssl=require
AUTH_SECRET=change-me
AUTH_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480
LLM_PROVIDER=fallback
LLM_MODEL=fallback-auto
GEMINI_API_KEY=
GROQ_API_KEY=
HUGGINGFACE_API_KEY=
COHERE_API_KEY=
EMAIL_USER=
EMAIL_APP_PASSWORD=
STORAGE_PROVIDER=local
STORAGE_PATH=./uploads
NEXT_PUBLIC_API_URL=http://localhost:8000
BACKEND_CORS_ORIGINS=http://localhost:3000
LOG_LEVEL=INFO
```