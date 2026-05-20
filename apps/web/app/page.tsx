"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { io, Socket } from "socket.io-client";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false
});

type InterviewEvent = {
  event_type?: string;
  payload?: Record<string, unknown>;
};

const gatewayUrl =
  process.env.NEXT_PUBLIC_API_GATEWAY_URL || "http://localhost:8080";

export default function InterviewWorkspace() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [nextPrompt, setNextPrompt] = useState("No active session yet.");
  const [candidateInput, setCandidateInput] = useState("");
  const [status, setStatus] = useState("idle");
  const [events, setEvents] = useState<InterviewEvent[]>([]);
  const [code, setCode] = useState("// Write your interview solution here\n");
  const [llmStatus, setLlmStatus] = useState<string>("—");

  const canSubmitTurn = useMemo(
    () => Boolean(sessionId) && status === "active",
    [sessionId, status]
  );

  async function startSession() {
    const response = await fetch(`${gatewayUrl}/v1/interviews/session`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        targetRole: "software_engineer",
        seniorityHint: "mid",
        companyStyle: "google_like",
        focusAreas: ["backend", "system_design"]
      })
    });
    const data = await response.json();
    setSessionId(data.sessionId);
    setNextPrompt(data.nextPrompt);
    setStatus("active");
    setEvents(data.events || []);
    const mode = data.llm?.mode ?? "unknown";
    setLlmStatus(mode === "live" ? "LLM live" : `LLM ${mode}`);

    const liveSocket = io(gatewayUrl, { transports: ["websocket"] });
    liveSocket.emit("subscribe_session", data.sessionId);
    liveSocket.on("interview_turn", (payload) => {
      setNextPrompt(payload.nextPrompt || "Continue...");
      const m = payload.llm?.mode;
      if (m) setLlmStatus(m === "live" ? "LLM live" : `LLM ${m}`);
      if (Array.isArray(payload.events)) {
        setEvents((prev) => [...prev, ...payload.events]);
      }
    });
    liveSocket.on("session_status_changed", (payload) => {
      setStatus(payload.status || "idle");
    });
    setSocket(liveSocket);
  }

  async function submitTurn() {
    if (!canSubmitTurn || !candidateInput.trim()) {
      return;
    }
    const response = await fetch(`${gatewayUrl}/v1/interviews/${sessionId}/turn`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        candidateInput: `${candidateInput}\n\nCode:\n${code.slice(0, 1200)}`
      })
    });
    const data = await response.json();
    setNextPrompt(data.nextPrompt || "Continue...");
    const m = data.llm?.mode;
    if (m) setLlmStatus(m === "live" ? "LLM live" : `LLM ${m}`);
    setCandidateInput("");
    if (Array.isArray(data.events)) {
      setEvents((prev) => [...prev, ...data.events]);
    }
  }

  async function changeStatus(action: "pause" | "resume" | "end") {
    if (!sessionId) return;
    const response = await fetch(`${gatewayUrl}/v1/interviews/${sessionId}/${action}`, {
      method: "POST"
    });
    const data = await response.json();
    setStatus(data.status || status);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-800 bg-slate-900 p-4 lg:col-span-2"
        >
          <div className="mb-3 flex items-center justify-between">
            <h1 className="text-lg font-semibold">Smart Interview Analyser</h1>
            <div className="text-right text-xs text-slate-300">
              <div>
                Session: {sessionId || "not started"} | Status: {status}
              </div>
              <div className="mt-0.5 text-sky-300">{llmStatus}</div>
            </div>
          </div>

          <div className="mb-3 rounded-md bg-slate-800 p-3 text-sm text-slate-100">
            {nextPrompt}
          </div>

          <textarea
            className="mb-3 h-28 w-full rounded-md border border-slate-700 bg-slate-950 p-3 text-sm outline-none"
            placeholder="Speak/type your response rationale..."
            value={candidateInput}
            onChange={(e) => setCandidateInput(e.target.value)}
          />

          <div className="mb-4 h-[320px] overflow-hidden rounded-md border border-slate-700">
            <MonacoEditor
              theme="vs-dark"
              language="typescript"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{ minimap: { enabled: false }, fontSize: 13 }}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={startSession}
              className="rounded-md bg-sky-500 px-3 py-2 text-sm font-medium text-slate-950"
            >
              Start Session
            </button>
            <button
              onClick={submitTurn}
              disabled={!canSubmitTurn}
              className="rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-50"
            >
              Submit Turn
            </button>
            <button
              onClick={() => changeStatus("pause")}
              disabled={!sessionId}
              className="rounded-md border border-slate-600 px-3 py-2 text-sm disabled:opacity-50"
            >
              Pause
            </button>
            <button
              onClick={() => changeStatus("resume")}
              disabled={!sessionId}
              className="rounded-md border border-slate-600 px-3 py-2 text-sm disabled:opacity-50"
            >
              Resume
            </button>
            <button
              onClick={() => changeStatus("end")}
              disabled={!sessionId}
              className="rounded-md border border-rose-500 px-3 py-2 text-sm text-rose-300 disabled:opacity-50"
            >
              End
            </button>
          </div>
        </motion.section>

        <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">
            Live Event Stream
          </h2>
          <div className="h-[620px] space-y-2 overflow-auto text-xs">
            {events.map((event, idx) => (
              <div key={`${event.event_type}-${idx}`} className="rounded-md bg-slate-800 p-2">
                <div className="font-medium text-sky-300">
                  {event.event_type || "unknown.event"}
                </div>
                <pre className="mt-1 whitespace-pre-wrap text-slate-300">
                  {JSON.stringify(event.payload || {}, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
