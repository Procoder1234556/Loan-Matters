"""
LLM Client
----------
Thin wrapper around Ollama for Qwen3:8b.
All agents use this module as their sole LLM interface.
"""

from __future__ import annotations

import os
from typing import Generator

import ollama

_DEFAULT_MODEL = os.getenv("OLLAMA_MODEL", "qwen3:8b")
_DEFAULT_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

_client = ollama.Client(host=_DEFAULT_HOST)


def chat(
    messages: list[dict],
    model: str | None = None,
    stream: bool = False,
    temperature: float = 0.7,
) -> str | Generator[str, None, None]:
    """
    Send a chat request to Ollama / Qwen3:8b.

    Args:
        messages:    List of {"role": "...", "content": "..."} dicts.
        model:       Override the default model (qwen3:8b).
        stream:      If True, returns a generator yielding text chunks.
        temperature: Sampling temperature (0.0–1.0).

    Returns:
        Full response string, or a generator of text chunks when stream=True.
    """
    model = model or _DEFAULT_MODEL
    options = {"temperature": temperature}

    if stream:
        def _stream_gen() -> Generator[str, None, None]:
            for chunk in _client.chat(
                model=model,
                messages=messages,
                stream=True,
                options=options,
            ):
                yield chunk["message"]["content"]
        return _stream_gen()

    response = _client.chat(
        model=model,
        messages=messages,
        stream=False,
        options=options,
    )
    return response["message"]["content"]


def complete(prompt: str, model: str | None = None, temperature: float = 0.7) -> str:
    """Convenience wrapper: single-turn completion from a plain prompt string."""
    messages = [{"role": "user", "content": prompt}]
    result = chat(messages, model=model, temperature=temperature)
    assert isinstance(result, str)
    return result


def is_available() -> bool:
    """Return True if the Ollama server is reachable and the model is loaded."""
    try:
        models = _client.list()
        names = [m["model"] for m in models.get("models", [])]
        target = _DEFAULT_MODEL.split(":")[0]
        return any(target in n for n in names)
    except Exception:
        return False
