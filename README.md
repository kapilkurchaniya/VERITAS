 # NEXUS — Project Execution Intelligence Platform

AI-powered platform that transforms unstructured field updates into validated, traceable, schedule-linked project actuals.

## Quick Start

### Prerequisites
- Docker Desktop (for PostgreSQL)
- Node.js 20+
- Python 3.11+

### 1. Start Database
```bash
docker-compose up -d
```

### 2. Set up Backend
```bash
cd apps/api
python -m venv venv

# Windows
.\venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Run Migrations & Seed
```bash
cd apps/api
alembic upgrade head
python -m app.seed
```

### 4. Start Backend
```bash
cd apps/api
.\venv\Scripts\uvicorn app.main:app --reload --port 8000
```
API docs available at: http://localhost:8000/docs

### 5. Start Frontend
```bash
cd apps/web
npm run dev
```
Frontend available at: http://localhost:3000

## Dev Credentials

| Email | Password | Role |
|---|---|---|
| admin@nexus.dev | admin123 | ADMIN |
| pm@nexus.dev | pm123 | PROJECT_MANAGER |
| planner@nexus.dev | planner123 | PLANNER |
| supervisor@nexus.dev | supervisor123 | SUPERVISOR |
| auditor@nexus.dev | auditor123 | AUDITOR |

## Architecture

```
apps/
├── web/     → Next.js App Router (frontend)
└── api/     → FastAPI + SQLAlchemy (backend)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript, Tailwind CSS |
| Backend | Python, FastAPI, Pydantic, SQLAlchemy |
| Database | PostgreSQL + pgvector |
| Auth | JWT + bcrypt |
