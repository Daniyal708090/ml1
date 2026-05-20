# Smart Interview Analyser

AI-driven technical interview simulation and hiring intelligence platform.

## Vision

Smart Interview Analyser is a production-grade ecosystem that simulates realistic software engineering interviews (coding, system design, behavioral, recruiter screen) with adaptive AI behavior.  
The platform is designed to avoid static interview trees, hardcoded rubrics, and fixed question banks.

## Core Principles

- AI-generated interview flows (no static scripts)
- Real-time adaptive difficulty and interviewer behavior
- Multi-agent evaluation over technical and behavioral signals
- Retrieval-augmented questioning from candidate context
- Stateful longitudinal memory across interview sessions

## Proposed Monorepo Layout

```text
apps/
  web/                    # Next.js interviewer + candidate UI (live implemented)
services/
  api-gateway/            # Node.js + Fastify + Socket.IO + orchestration
  ai-orchestrator/        # Python FastAPI multi-agent runtime
  realtime-voice/         # WebRTC + streaming + turn detection
  coding-intelligence/    # Static/dynamic code analysis workers
  analytics-engine/       # Aggregation + scoring narratives
packages/
  shared-types/           # Type-safe contracts (TS + JSON schema)
  prompt-kits/            # Dynamic prompt templates + policy constraints
infra/
  docker/                 # Local compose setup
docs/
  architecture.md         # System architecture and data flows
```

## High-Level Runtime

1. Candidate starts a session in `apps/web`.
2. `api-gateway` creates a session context and streams events.
3. `ai-orchestrator` composes interviewer persona, difficulty policy, and question plan dynamically.
4. Candidate answers (voice/text/code); events are analyzed by coding + behavioral evaluators.
5. Difficulty, tone, and follow-ups adapt in real time.
6. Analytics engine produces hiring-style reports and personalized learning plans.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind, Monaco, Framer Motion, WebRTC, Socket.IO
- Backend: Node.js, FastAPI microservices, PostgreSQL, Redis, vector DB
- AI: LLM orchestration, RAG pipelines, embeddings, multi-agent evaluators, streaming inference
- Infra: Docker, Kubernetes-ready services

## Initial Scope Implemented In This Bootstrap

- Architecture blueprint and interfaces
- Service contracts and event model
- Minimal service skeletons for API gateway and AI orchestrator
- Docker Compose for local development
- Adaptive Interview Conductor loop (persona + difficulty + follow-up + signals)
- API turn endpoint wired to orchestrator
- Web interview workspace with Monaco + Socket.IO stream

## Next Build Milestones

1. Implement event bus + session store
2. Add dynamic interview policy engine
3. Add voice pipeline with turn-taking and interruption handling
4. Integrate code execution sandbox + semantic code analysis
5. Build recruiter dashboard with cohort analytics

## Current API Surface

- `POST /v1/interviews/session`
  - Initializes an adaptive AI interview session from candidate profile context.
- `POST /v1/interviews/:sessionId/turn`
  - Accepts candidate answer and loads prior context from Redis (server-stateful), then returns next adaptive follow-up, updated interviewer state, inferred signals, and emitted events.
- `GET /v1/interviews/:sessionId/state`
  - Returns persisted session context and full event history from Redis.
- `POST /v1/interviews/:sessionId/pause`
  - Sets lifecycle status to `paused`.
- `POST /v1/interviews/:sessionId/resume`
  - Sets lifecycle status to `active`.
- `POST /v1/interviews/:sessionId/end`
  - Sets lifecycle status to `completed`.

## Real-time Event Streaming

- Socket.IO server is hosted by `api-gateway`.
- Client emits `subscribe_session` with `sessionId` to join session room.
- Server emits:
  - `interview_initialized`
  - `interview_turn`
  - `session_status_changed`
  - `subscription_confirmed`

## Session Storage Policy

- Redis keys:
  - `sia:session:<sessionId>:context`
  - `sia:session:<sessionId>:events`
  - `sia:session:<sessionId>:meta`
- TTL for all session keys is controlled by `SESSION_TTL_SECONDS` (default `86400`).

## Run Locally

- `docker compose up --build`
- Open `http://localhost:3000`
- Web app calls gateway at `http://localhost:8080` and subscribes to session stream events.

### Real LLM (OpenAI-compatible)

The orchestrator calls a chat model when `OPENAI_API_KEY` is set.

1. Copy `.env.example` to `.env` in the repo root and set `OPENAI_API_KEY`.
2. Optional: set `OPENAI_MODEL`, `OPENAI_BASE_URL` (for Azure, OpenRouter, local proxies), `OPENAI_JSON_MODE=0` if the server rejects JSON mode.
3. Rebuild or restart: `docker compose up --build`

Verify the model is wired:

- `GET http://localhost:8090/health` → `llm_configured: true` when the key is present in the orchestrator container.
- After `POST /v1/interviews/session`, the JSON field `llm.mode` should be `"live"`. If the key is missing or the API errors, you will see `"fallback"` and a reason.

# Smart Interview Analyser

Production-ready AI-powered technical interview platform for software engineers.

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4, Framer Motion, shadcn/ui (Radix), Recharts, Monaco Editor |
| Backend | Node.js, Express 5, Prisma, PostgreSQL, Redis, Socket.io, OpenAI |
| Auth | JWT access tokens + refresh token sessions |

## Folder Structure

```
in/
├── frontend/                 # Next.js app
│   └── src/
│       ├── app/              # App Router pages
│       ├── components/       # UI, interview, navigation
│       ├── features/pages/   # Page-level client components
│       └── lib/              # types, api, mockData, utils
├── backend/
│   ├── prisma/               # schema + seed
│   └── src/
│       ├── routes/           # REST API
│       ├── services/         # AI engine, auth, interviews
│       └── websocket/        # Real-time chat
└── Frontend Interview Analysis/  # Original Vite prototype (reference)
```

## Pages

- `/` — Landing
- `/login`, `/register` — Authentication
- `/dashboard` — Overview & mode selection
- `/interview` — AI chat room (code editor, voice input)
- `/results` — Analysis & score cards
- `/progress` — Charts & heatmaps
- `/achievements` — Gamification
- `/settings` — Profile & preferences

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/users/me` | Current user |
| PATCH | `/api/users/me` | Update profile |
| GET | `/api/users/progress` | Progress snapshots |
| POST | `/api/interviews/start` | Start interview |
| POST | `/api/interviews/:id/answer` | Submit answer + get analysis |
| GET | `/api/interviews/history` | Interview history |
| GET | `/api/companies` | Company simulations |

WebSocket events: `join-interview`, `chat-message`, `chat-chunk`, `typing`

## Quick Start

### 2. Backend (uses SQLite locally — no Docker required)

```bash
cd backend
cp .env.example .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Optional: use `docker compose up -d` for PostgreSQL + Redis if you prefer Postgres in production-like setups.

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

## Environment

**Backend** (`backend/.env`): `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `OPENAI_API_KEY` (optional — uses heuristic scoring without it)

**Frontend** (`frontend/.env.local`): `NEXT_PUBLIC_API_URL=http://localhost:4000`

## Deployment

- **Frontend**: Vercel (`frontend/`)
- **Backend**: Railway / Render / Fly.io with managed PostgreSQL + Redis
- Run `prisma migrate deploy` in production

## Completeness Checklist

| Feature | Status |
|---------|--------|
| Landing, Dashboard, Interview, Results, Progress, Settings | ✅ |
| Auth (JWT + sessions) | ✅ |
| 3 tracks, 6 modes | ✅ |
| AI analysis format (6 sections + 6 dimensions) | ✅ |
| Company simulation selector | ✅ |
| Code editor (Monaco) | ✅ |
| Voice input (Web Speech API) | ✅ |
| WebSocket streaming chat | ✅ |
| Prisma models (all required entities) | ✅ |
| Rate limiting, helmet, logging | ✅ |
| GitHub/LeetCode/resume fields in schema | ✅ Schema |
| Multiplayer / whiteboard | 🔶 Schema-ready, UI stub |
| LeetCode sync | 🔶 Settings placeholder |

Demo mode works without backend (mock data). Connect API + OpenAI for full AI scoring.
