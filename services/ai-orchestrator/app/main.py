from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from fastapi import FastAPI
from pydantic import BaseModel, Field

from app import llm

app = FastAPI(title="ai-orchestrator", version="0.1.0")


class CandidateProfile(BaseModel):
    target_role: str = "software_engineer"
    seniority_hint: str = "mid"
    company_style: str = "faang_like"
    focus_areas: list[str] = Field(default_factory=list)


class SignalState(BaseModel):
    communication_clarity: float = 0.5
    systems_thinking: float = 0.5
    coding_rigor: float = 0.5
    confidence: float = 0.5
    stress: float = 0.3


class SessionContext(BaseModel):
    profile: CandidateProfile = Field(default_factory=CandidateProfile)
    memory: dict[str, Any] = Field(default_factory=dict)
    signal_state: SignalState = Field(default_factory=SignalState)
    difficulty: float = 0.5
    current_domain: str = "backend"
    turn_count: int = 0


class SessionInitRequest(BaseModel):
    profile: CandidateProfile = Field(default_factory=CandidateProfile)
    context: dict[str, Any] = Field(default_factory=dict)


class InterviewTurnRequest(BaseModel):
    session_id: str
    candidate_input: str
    context: SessionContext


class Event(BaseModel):
    event_type: str
    session_id: str
    timestamp: str
    trace_id: str
    payload: dict[str, Any]


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def infer_signals(candidate_input: str, prior: SignalState) -> SignalState:
    text = candidate_input.lower()
    clarity_bonus = 0.08 if len(candidate_input.split()) > 30 else -0.03
    tradeoff_bonus = 0.12 if "trade-off" in text or "tradeoff" in text else 0.0
    systems_bonus = (
        0.1
        if any(
            k in text
            for k in ["latency", "throughput", "cache", "queue", "consistency"]
        )
        else -0.02
    )
    rigor_bonus = (
        0.1
        if any(k in text for k in ["o(", "complexity", "test", "edge case", "failure"])
        else -0.02
    )
    uncertainty = 0.08 if any(k in text for k in ["maybe", "not sure", "i think"]) else -0.04

    return SignalState(
        communication_clarity=clamp01(prior.communication_clarity + clarity_bonus),
        systems_thinking=clamp01(prior.systems_thinking + systems_bonus + tradeoff_bonus / 2),
        coding_rigor=clamp01(prior.coding_rigor + rigor_bonus),
        confidence=clamp01(prior.confidence - uncertainty + 0.03),
        stress=clamp01(prior.stress + 0.04 if uncertainty > 0 else prior.stress - 0.03),
    )


def adapt_difficulty(current: float, signals: SignalState) -> float:
    performance = (
        signals.communication_clarity * 0.2
        + signals.systems_thinking * 0.35
        + signals.coding_rigor * 0.35
        + signals.confidence * 0.1
    )
    delta = (performance - 0.55) * 0.2
    if signals.stress > 0.75:
        delta -= 0.08
    return clamp01(current + delta)


def pick_domain(context: SessionContext, signals: SignalState) -> str:
    if signals.systems_thinking < 0.45:
        return "system_design"
    if signals.coding_rigor < 0.45:
        return "coding"
    if signals.communication_clarity < 0.45:
        return "behavioral"
    if context.turn_count % 3 == 0:
        return "backend_scalability"
    return context.current_domain


def synthesize_persona(context: SessionContext, signals: SignalState) -> dict[str, str]:
    style = context.profile.company_style.lower()
    pressure = (
        "high" if context.difficulty > 0.72 else "medium" if context.difficulty > 0.45 else "supportive"
    )
    pace = "fast" if signals.confidence > 0.68 else "steady"
    tone = "probing" if "meta" in style or "amazon" in style else "curious"
    if signals.stress > 0.7:
        tone = "calm_but_precise"
        pace = "measured"
    return {"tone": tone, "pace": pace, "pressure": pressure}


def generate_followup(domain: str, context: SessionContext) -> str:
    difficulty_label = (
        "advanced"
        if context.difficulty > 0.75
        else "intermediate"
        if context.difficulty > 0.45
        else "foundational"
    )
    role = context.profile.target_role.replace("_", " ")
    prompt_seed = context.memory.get("last_topic", "your previous solution")

    if domain == "system_design":
        return (
            f"Let's go {difficulty_label}. For a {role}, redesign {prompt_seed} to survive a 20x traffic spike, "
            "and explain bottleneck detection, failure isolation, and consistency trade-offs."
        )
    if domain == "coding":
        return (
            f"Take {prompt_seed} and optimize it for both worst-case runtime and maintainability. "
            "Walk through edge cases, test strategy, and rollback-safe refactoring steps."
        )
    if domain == "behavioral":
        return (
            "Describe a moment when your initial technical decision was wrong. "
            "How did you detect it, communicate it to stakeholders, and correct execution quickly?"
        )
    return (
        f"Assume {prompt_seed} is now mission-critical. What observability signals would you instrument first, "
        "and how would you prioritize the first 30 minutes of incident response?"
    )


def build_events(
    session_id: str,
    trace_id: str,
    domain: str,
    persona: dict[str, str],
    signals: SignalState,
    difficulty: float,
    prompt: str,
) -> list[Event]:
    ts = now_iso()
    return [
        Event(
            event_type="persona.updated",
            session_id=session_id,
            timestamp=ts,
            trace_id=trace_id,
            payload=persona,
        ),
        Event(
            event_type="signal.behavioral.inferred",
            session_id=session_id,
            timestamp=ts,
            trace_id=trace_id,
            payload=signals.model_dump(),
        ),
        Event(
            event_type="difficulty.adjusted",
            session_id=session_id,
            timestamp=ts,
            trace_id=trace_id,
            payload={"difficulty": difficulty, "domain": domain},
        ),
        Event(
            event_type="followup.generated",
            session_id=session_id,
            timestamp=ts,
            trace_id=trace_id,
            payload={"prompt": prompt},
        ),
    ]


def _generate_opening_prompt_llm(profile: CandidateProfile) -> tuple[str, dict[str, Any]]:
    system = (
        "You are a senior staff engineer conducting a realistic technical interview. "
        "Respond with a single JSON object only (no markdown). Keys: "
        "opening_prompt (string, one concrete opening question or scenario), "
        "interviewer_note (string, one short sentence on what you are probing for)."
    )
    user = json.dumps(
        {
            "candidate_profile": profile.model_dump(),
            "instruction": "Opening should feel like a real FAANG-style loop: specific, slightly stressful, not generic textbook.",
        }
    )
    data = llm.chat_completion_json(system, user, temperature=0.75, max_tokens=700)
    opening = str(data.get("opening_prompt", "")).strip()
    if not opening:
        raise ValueError("LLM returned empty opening_prompt")
    return opening, {"interviewer_note": data.get("interviewer_note", "")}


def _generate_next_prompt_llm(
    *,
    profile: CandidateProfile,
    domain: str,
    difficulty: float,
    turn_count: int,
    candidate_input: str,
    signals: SignalState,
    persona: dict[str, str],
) -> tuple[str, dict[str, Any]]:
    system = (
        "You are the same interviewer continuing live. Produce exactly one JSON object only (no markdown). Keys: "
        "next_prompt (string, 2–5 sentences: one sharp follow-up or new challenge that reacts to their answer), "
        "brief_assessment (string, one sentence: what was strong/weak about their reply, for internal use)."
    )
    user = json.dumps(
        {
            "candidate_profile": profile.model_dump(),
            "current_domain": domain,
            "difficulty_0_to_1": round(difficulty, 3),
            "turn_count": turn_count,
            "inferred_signals": signals.model_dump(),
            "interviewer_persona": persona,
            "candidate_last_answer": candidate_input[:8000],
            "instruction": "Adapt difficulty and tone from the data. Push deeper on weak areas; escalate if strong.",
        }
    )
    data = llm.chat_completion_json(system, user, temperature=0.7, max_tokens=900)
    nxt = str(data.get("next_prompt", "")).strip()
    if not nxt:
        raise ValueError("LLM returned empty next_prompt")
    return nxt, {"brief_assessment": data.get("brief_assessment", "")}


@app.get("/health")
def health() -> dict[str, Any]:
    return {
        "ok": True,
        "service": "ai-orchestrator",
        "llm_configured": llm.llm_configured(),
        "llm_model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
    }


@app.post("/v1/orchestrate/session-init")
def session_init(payload: SessionInitRequest) -> dict[str, Any]:
    session_id = str(uuid4())
    trace_id = str(uuid4())
    base_context = SessionContext(profile=payload.profile)
    persona = synthesize_persona(base_context, base_context.signal_state)
    llm_meta: dict[str, Any] = {"mode": "fallback", "reason": "no_api_key"}
    opening_prompt = (
        "You're leading architecture for a user-facing product that just doubled traffic. "
        "Start by outlining how you would identify and prioritize the highest-risk bottlenecks."
    )
    if llm.llm_configured():
        try:
            opening_prompt, extra = _generate_opening_prompt_llm(payload.profile)
            llm_meta = {"mode": "live", **extra}
        except Exception as exc:  # noqa: BLE001
            llm_meta = {"mode": "fallback", "reason": "llm_error", "error": str(exc)[:500]}
    events = [
        Event(
            event_type="session.started",
            session_id=session_id,
            timestamp=now_iso(),
            trace_id=trace_id,
            payload={"profile": payload.profile.model_dump(), "llm": llm_meta},
        ),
        Event(
            event_type="question.generated",
            session_id=session_id,
            timestamp=now_iso(),
            trace_id=trace_id,
            payload={"prompt": opening_prompt, "domain": base_context.current_domain, "llm": llm_meta},
        ),
    ]
    return {
        "session_id": session_id,
        "trace_id": trace_id,
        "interviewer_state": persona,
        "next_prompt": opening_prompt,
        "llm": llm_meta,
        "context": base_context.model_dump(),
        "events": [e.model_dump() for e in events],
    }


@app.post("/v1/orchestrate/next-turn")
def next_turn(payload: InterviewTurnRequest) -> dict[str, Any]:
    trace_id = str(uuid4())
    updated_signals = infer_signals(payload.candidate_input, payload.context.signal_state)
    new_difficulty = adapt_difficulty(payload.context.difficulty, updated_signals)

    payload.context.signal_state = updated_signals
    payload.context.difficulty = new_difficulty
    payload.context.turn_count += 1
    payload.context.current_domain = pick_domain(payload.context, updated_signals)
    payload.context.memory["last_topic"] = payload.context.memory.get("last_topic", "your design approach")

    persona = synthesize_persona(payload.context, updated_signals)
    llm_meta: dict[str, Any] = {"mode": "fallback", "reason": "no_api_key"}
    next_prompt = generate_followup(payload.context.current_domain, payload.context)
    if llm.llm_configured():
        try:
            next_prompt, extra = _generate_next_prompt_llm(
                profile=payload.context.profile,
                domain=payload.context.current_domain,
                difficulty=new_difficulty,
                turn_count=payload.context.turn_count,
                candidate_input=payload.candidate_input,
                signals=updated_signals,
                persona=persona,
            )
            llm_meta = {"mode": "live", **extra}
        except Exception as exc:  # noqa: BLE001
            llm_meta = {"mode": "fallback", "reason": "llm_error", "error": str(exc)[:500]}
            next_prompt = generate_followup(payload.context.current_domain, payload.context)
    events = build_events(
        payload.session_id,
        trace_id,
        payload.context.current_domain,
        persona,
        updated_signals,
        new_difficulty,
        next_prompt,
    )

    return {
        "session_id": payload.session_id,
        "trace_id": trace_id,
        "interviewer_state": persona,
        "next_prompt": next_prompt,
        "analysis": {
            "signal_state": updated_signals.model_dump(),
            "difficulty": new_difficulty,
            "selected_domain": payload.context.current_domain,
            "llm": llm_meta,
            "performance_confidence": round(
                (
                    updated_signals.systems_thinking
                    + updated_signals.coding_rigor
                    + updated_signals.communication_clarity
                )
                / 3,
                3,
            ),
        },
        "llm": llm_meta,
        "context": payload.context.model_dump(),
        "events": [e.model_dump() for e in events],
    }

