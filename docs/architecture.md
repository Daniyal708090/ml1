# Smart Interview Analyser - Architecture

## 1) System Goals

The platform must run fully AI-driven interviews where every major decision is generated from context:

- interviewer behavior
- question selection and follow-ups
- adaptive difficulty
- real-time evaluation
- final scoring narratives and recommendations

No static interview tree or fixed scoring rubric is used.

## 2) Service Topology

### Edge and Experience

- `apps/web`: Candidate + interviewer UI, coding IDE, real-time transcript, report views.
- `services/api-gateway`: Session API, auth integration, websocket streams, event routing.

### AI Core

- `services/ai-orchestrator`:
  - Interview Conductor Agent
  - Persona Synthesis Agent
  - Difficulty Controller Agent
  - Follow-up Generator Agent
  - Behavioral Inference Agent
  - Report Composer Agent

### Intelligence Services

- `services/coding-intelligence`: AST analysis, anti-pattern checks, complexity + architecture signals.
- `services/realtime-voice`: STT/TTS, VAD, turn boundaries, interruption policy.
- `services/analytics-engine`: session and cohort analytics, growth trends, recommendation engine.

### Data Plane

- PostgreSQL: durable entities and reports
- Redis: session state + streaming buffers + rate limiting
- Vector DB: embeddings for resume, answer memory, rubric exemplars, question priors
- Object storage: transcripts, artifacts, interview recordings

## 3) Canonical Event Model

All runtime interactions are normalized as events:

- `session.started`
- `persona.updated`
- `question.generated`
- `candidate.response.received`
- `signal.behavioral.inferred`
- `signal.coding.inferred`
- `difficulty.adjusted`
- `followup.generated`
- `session.ended`
- `report.generated`

Event payloads contain session id, timestamp, source, confidence, and trace ids.

## 4) AI-Driven Interview Loop

1. **Context Build**: ingest resume, role target, prior sessions, learning goals.
2. **Policy Draft**: generate initial interview policy (pace, depth, challenge style).
3. **Question Turn**: generate domain-appropriate prompt and expected signal targets.
4. **Response Analysis**: parallel technical + behavioral inference.
5. **Adaptation**: update persona, pressure, depth, and next-turn objective.
6. **Memory Writeback**: store inferred strengths/weaknesses and confidence trajectory.
7. **Termination and Report**: produce recruiter-style evaluation and candidate roadmap.

## 5) Dynamic Scoring (Non-Static)

Use weighted latent dimensions inferred per turn:

- reasoning depth
- correctness under constraints
- communication clarity
- systems thinking
- ownership and leadership
- adaptability under pressure

Weights are generated per role/seniority/interview type and recalibrated using prior turns.

## 6) Safety and Reliability

- prompt policy firewall for harmful/off-topic outputs
- confidence calibration to avoid over-assertive judgments
- human-review mode for enterprise hiring pipelines
- deterministic trace logging for auditability

## 7) Deployment

- local: Docker Compose
- production: Kubernetes with autoscaling per service
- observability: OpenTelemetry + centralized logs + prompt trace store

