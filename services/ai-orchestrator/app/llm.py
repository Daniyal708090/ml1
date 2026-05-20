"""OpenAI-compatible chat completions for dynamic interview text."""

from __future__ import annotations

import json
import os
import re
from typing import Any

import httpx

_JSON_FENCE = re.compile(r"```(?:json)?\s*([\s\S]*?)\s*```", re.IGNORECASE)


def llm_configured() -> bool:
    return bool(os.environ.get("OPENAI_API_KEY", "").strip())


def _model() -> str:
    return os.environ.get("OPENAI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"


def _base_url() -> str:
    return os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")


def _parse_json_object(text: str) -> dict[str, Any]:
    text = text.strip()
    m = _JSON_FENCE.search(text)
    if m:
        text = m.group(1).strip()
    return json.loads(text)


def chat_completion_json(
    system: str,
    user: str,
    *,
    temperature: float = 0.65,
    max_tokens: int = 900,
) -> dict[str, Any]:
    """Call /v1/chat/completions and parse the assistant message as JSON object."""
    if not llm_configured():
        raise RuntimeError("OPENAI_API_KEY is not set")

    api_key = os.environ["OPENAI_API_KEY"].strip()
    url = f"{_base_url()}/chat/completions"
    payload: dict[str, Any] = {
        "model": _model(),
        "messages": [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    # OpenAI API supports JSON mode; many local proxies do not.
    if os.environ.get("OPENAI_JSON_MODE", "1").strip() not in ("0", "false", "no"):
        if "api.openai.com" in _base_url():
            payload["response_format"] = {"type": "json_object"}

    with httpx.Client(timeout=90.0) as client:
        response = client.post(
            url,
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json=payload,
        )
        if response.status_code == 400 and "response_format" in payload:
            del payload["response_format"]
            response = client.post(
                url,
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        response.raise_for_status()
        data = response.json()

    content = data["choices"][0]["message"]["content"]
    if not isinstance(content, str):
        raise ValueError("LLM returned non-string content")
    return _parse_json_object(content)
