# Smart Interview Analyser

AI-driven technical interview simulation and hiring intelligence platform.

This repository also contains related work under `frontend/`, `backend/`, and `ml/`.

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
