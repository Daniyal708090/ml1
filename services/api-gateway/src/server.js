import Fastify from "fastify";
import crypto from "node:crypto";
import { createClient } from "redis";
import { Server } from "socket.io";
import cors from "@fastify/cors";

const app = Fastify({ logger: true });
const port = Number(process.env.PORT || 8080);
const orchestratorBaseUrl =
  process.env.AI_ORCHESTRATOR_URL || "http://localhost:8090";
const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const sessionTtlSeconds = Number(process.env.SESSION_TTL_SECONDS || 86400);
const redis = createClient({ url: redisUrl });
const io = new Server(app.server, {
  cors: { origin: "*" }
});

await app.register(cors, {
  origin: true
});

async function callOrchestrator(path, payload) {
  const response = await fetch(`${orchestratorBaseUrl}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Orchestrator error ${response.status}: ${text}`);
  }
  return response.json();
}

function sessionContextKey(sessionId) {
  return `sia:session:${sessionId}:context`;
}

function sessionEventsKey(sessionId) {
  return `sia:session:${sessionId}:events`;
}

function sessionMetaKey(sessionId) {
  return `sia:session:${sessionId}:meta`;
}

async function touchSessionTTL(sessionId) {
  await redis.expire(sessionContextKey(sessionId), sessionTtlSeconds);
  await redis.expire(sessionEventsKey(sessionId), sessionTtlSeconds);
  await redis.expire(sessionMetaKey(sessionId), sessionTtlSeconds);
}

async function persistSessionState(sessionId, context, events, metaPatch = {}) {
  await redis.set(sessionContextKey(sessionId), JSON.stringify(context));
  if (Array.isArray(events) && events.length > 0) {
    const values = events.map((event) => JSON.stringify(event));
    await redis.rPush(sessionEventsKey(sessionId), values);
  }
  const rawMeta = await redis.get(sessionMetaKey(sessionId));
  const previousMeta = rawMeta ? JSON.parse(rawMeta) : {};
  const nextMeta = {
    ...previousMeta,
    ...metaPatch,
    updatedAt: new Date().toISOString()
  };
  await redis.set(sessionMetaKey(sessionId), JSON.stringify(nextMeta));
  await touchSessionTTL(sessionId);
}

async function loadSessionContext(sessionId) {
  const raw = await redis.get(sessionContextKey(sessionId));
  if (!raw) {
    return null;
  }
  return JSON.parse(raw);
}

async function loadSessionMeta(sessionId) {
  const raw = await redis.get(sessionMetaKey(sessionId));
  if (!raw) {
    return null;
  }
  return JSON.parse(raw);
}

io.on("connection", (socket) => {
  socket.on("subscribe_session", (sessionId) => {
    if (typeof sessionId === "string" && sessionId.length > 0) {
      socket.join(sessionId);
      socket.emit("subscription_confirmed", { sessionId });
    }
  });
});

app.get("/health", async () => {
  return { ok: true, service: "api-gateway" };
});

app.post("/v1/interviews/session", async (request) => {
  const body = request.body || {};
  const orchestration = await callOrchestrator("/v1/orchestrate/session-init", {
    profile: {
      target_role: body.targetRole || "software_engineer",
      seniority_hint: body.seniorityHint || "mid",
      company_style: body.companyStyle || "faang_like",
      focus_areas: body.focusAreas || []
    },
    context: body.context || {}
  });
  await persistSessionState(
    orchestration.session_id,
    orchestration.context,
    orchestration.events,
    {
      sessionId: orchestration.session_id,
      status: "active",
      mode: body.mode || "technical_full_loop",
      createdAt: new Date().toISOString()
    }
  );
  io.to(orchestration.session_id).emit("interview_initialized", {
    sessionId: orchestration.session_id,
    interviewerState: orchestration.interviewer_state,
    nextPrompt: orchestration.next_prompt,
    llm: orchestration.llm,
    events: orchestration.events
  });
  return {
    sessionId: orchestration.session_id,
    traceId: orchestration.trace_id,
    status: "initialized",
    mode: body.mode || "technical_full_loop",
    interviewerState: orchestration.interviewer_state,
    nextPrompt: orchestration.next_prompt,
    llm: orchestration.llm,
    context: orchestration.context,
    events: orchestration.events
  };
});

app.post("/v1/interviews/:sessionId/turn", async (request) => {
  const params = request.params || {};
  const body = request.body || {};
  const sessionId = params.sessionId;
  const storedContext = await loadSessionContext(sessionId);
  const meta = await loadSessionMeta(sessionId);
  if (!storedContext) {
    return {
      error: "session_not_found",
      message:
        "Session context not found in Redis. Initialize session before submitting turns."
    };
  }
  if (!meta || meta.status !== "active") {
    return {
      error: "session_not_active",
      message: "Session is not active. Resume session before submitting turns."
    };
  }
  const orchestration = await callOrchestrator("/v1/orchestrate/next-turn", {
    session_id: sessionId || crypto.randomUUID(),
    candidate_input: body.candidateInput || "",
    context: storedContext
  });
  await persistSessionState(
    orchestration.session_id,
    orchestration.context,
    orchestration.events,
    { status: "active" }
  );
  io.to(orchestration.session_id).emit("interview_turn", {
    sessionId: orchestration.session_id,
    traceId: orchestration.trace_id,
    interviewerState: orchestration.interviewer_state,
    nextPrompt: orchestration.next_prompt,
    analysis: orchestration.analysis,
    llm: orchestration.llm,
    context: orchestration.context,
    events: orchestration.events
  });
  return {
    sessionId: orchestration.session_id,
    traceId: orchestration.trace_id,
    interviewerState: orchestration.interviewer_state,
    nextPrompt: orchestration.next_prompt,
    analysis: orchestration.analysis,
    llm: orchestration.llm,
    context: orchestration.context,
    events: orchestration.events
  };
});

app.get("/v1/interviews/:sessionId/state", async (request) => {
  const params = request.params || {};
  const sessionId = params.sessionId;
  const context = await loadSessionContext(sessionId);
  const meta = await loadSessionMeta(sessionId);
  if (!context) {
    return {
      error: "session_not_found",
      message: "No persisted state exists for the requested session."
    };
  }
  const events = await redis.lRange(sessionEventsKey(sessionId), 0, -1);
  return {
    sessionId,
    meta,
    context,
    events: events.map((raw) => JSON.parse(raw))
  };
});

app.post("/v1/interviews/:sessionId/pause", async (request) => {
  const sessionId = request.params?.sessionId;
  const context = await loadSessionContext(sessionId);
  if (!context) {
    return { error: "session_not_found", message: "Cannot pause missing session." };
  }
  await persistSessionState(sessionId, context, [], { status: "paused" });
  io.to(sessionId).emit("session_status_changed", { sessionId, status: "paused" });
  return { sessionId, status: "paused" };
});

app.post("/v1/interviews/:sessionId/resume", async (request) => {
  const sessionId = request.params?.sessionId;
  const context = await loadSessionContext(sessionId);
  if (!context) {
    return { error: "session_not_found", message: "Cannot resume missing session." };
  }
  await persistSessionState(sessionId, context, [], { status: "active" });
  io.to(sessionId).emit("session_status_changed", { sessionId, status: "active" });
  return { sessionId, status: "active" };
});

app.post("/v1/interviews/:sessionId/end", async (request) => {
  const sessionId = request.params?.sessionId;
  const context = await loadSessionContext(sessionId);
  if (!context) {
    return { error: "session_not_found", message: "Cannot end missing session." };
  }
  await persistSessionState(sessionId, context, [], { status: "completed" });
  io.to(sessionId).emit("session_status_changed", { sessionId, status: "completed" });
  return { sessionId, status: "completed" };
});

async function start() {
  await redis.connect();
  app.log.info({ redisUrl, sessionTtlSeconds }, "Connected to Redis");
  await app.listen({ host: "0.0.0.0", port });
}

start().catch((err) => {
  app.log.error(err);
  process.exit(1);
});

