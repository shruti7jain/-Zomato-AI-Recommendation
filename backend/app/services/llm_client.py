"""
LLM Client — Groq Integration
──────────────────────────────
Wraps the Groq Python SDK to call the chat completions API and parse the
strict JSON response expected from the LLM.

Environment variables consumed
------------------------------
GROQ_API_KEY   : required — Groq API key
LLM_MODEL      : optional — model ID (default: llama3-8b-8192)
LLM_TEMPERATURE: optional — float 0–1 (default: 0.3)
LLM_MAX_TOKENS : optional — int (default: 1500)
"""

import json
import logging
import os
from typing import Any

logger = logging.getLogger(__name__)

_DEFAULT_MODEL = "llama-3.3-70b-versatile"
_DEFAULT_TEMPERATURE = 0.3
_DEFAULT_MAX_TOKENS = 1500


# ── Client factory (lazy singleton) ───────────────────────────────────────────

_groq_client = None


def _get_client():
    """Return a cached Groq client, creating it on first call."""
    global _groq_client
    if _groq_client is None:
        try:
            from groq import Groq  # lazy import
        except ImportError as exc:
            raise ImportError(
                "groq package is not installed. Run: pip install groq"
            ) from exc

        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise ValueError(
                "GROQ_API_KEY environment variable is not set. "
                "Copy .env.example to .env and add your key."
            )
        _groq_client = Groq(api_key=api_key)
        logger.info("Groq client initialised (model=%s)", _get_model())
    return _groq_client


def _get_model() -> str:
    return os.getenv("LLM_MODEL", _DEFAULT_MODEL)


def _get_temperature() -> float:
    try:
        return float(os.getenv("LLM_TEMPERATURE", str(_DEFAULT_TEMPERATURE)))
    except ValueError:
        return _DEFAULT_TEMPERATURE


def _get_max_tokens() -> int:
    try:
        return int(os.getenv("LLM_MAX_TOKENS", str(_DEFAULT_MAX_TOKENS)))
    except ValueError:
        return _DEFAULT_MAX_TOKENS


# ── Public API ─────────────────────────────────────────────────────────────────

def call_llm(system_prompt: str, user_message: str) -> dict[str, Any]:
    """
    Call the Groq chat completions API and return the parsed JSON response.

    Parameters
    ----------
    system_prompt : str — SYSTEM role content
    user_message  : str — USER role content

    Returns
    -------
    dict[str, Any]
        Parsed JSON dict with keys "summary" and "recommendations".

    Raises
    ------
    ValueError
        If the LLM response cannot be parsed as the expected JSON structure.
    RuntimeError
        If the Groq API call fails.
    """
    client = _get_client()
    model = _get_model()
    temperature = _get_temperature()
    max_tokens = _get_max_tokens()

    logger.info("Calling Groq API | model=%s | temp=%.2f | max_tokens=%d", model, temperature, max_tokens)

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=temperature,
            max_tokens=max_tokens,
        )
    except Exception as exc:
        logger.error("Groq API call failed: %s", exc)
        raise RuntimeError(f"Groq API call failed: {exc}") from exc

    raw_text: str = response.choices[0].message.content or ""
    logger.debug("Raw LLM response (%d chars): %s…", len(raw_text), raw_text[:200])

    return _parse_response(raw_text)


# ── Response parser ────────────────────────────────────────────────────────────

def _parse_response(raw: str) -> dict[str, Any]:
    """
    Extract and validate the JSON payload from the LLM text.

    The LLM is instructed to return raw JSON with no markdown fences, but we
    defensively strip common wrapping (```json ... ```) just in case.
    """
    text = raw.strip()

    # Strip markdown code fences if present
    if text.startswith("```"):
        lines = text.splitlines()
        # Remove first line (```json or ```) and last closing fence
        inner_lines = []
        in_fence = False
        for line in lines:
            if line.startswith("```"):
                in_fence = not in_fence
                continue
            inner_lines.append(line)
        text = "\n".join(inner_lines).strip()

    # Attempt to locate the outermost JSON object
    start = text.find("{")
    end = text.rfind("}") + 1
    if start == -1 or end == 0:
        raise ValueError(f"No JSON object found in LLM response: {raw[:300]!r}")

    json_str = text[start:end]

    try:
        data = json.loads(json_str)
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM response is not valid JSON: {exc}\nRaw: {json_str[:300]!r}") from exc

    # Basic structure validation
    if "recommendations" not in data:
        raise ValueError(f"LLM JSON missing 'recommendations' key. Got: {list(data.keys())}")
    if not isinstance(data["recommendations"], list):
        raise ValueError("'recommendations' must be a JSON array.")

    return data
