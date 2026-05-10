"""
AdminAgent
----------
Handles POST /api/admin/command from the PHP admin panel.
Executes natural-language admin commands using Qwen3:8b:
  - kb:load          — load a directory of docs into ChromaDB
  - kb:status        — report KB document count
  - kb:clear         — delete all KB documents
  - blog:draft       — trigger blog post generation for a keyword
  - rates:update     — trigger rate refresh (requires Tavily key)
  - help             — list available commands
"""

from __future__ import annotations

import sys
import os
import asyncio
import re

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from agents.llm import chat, is_available
from kb.loader import load_directory, collection_count, get_collection

_INTENT_PROMPT = """You are a command router for an admin system. Map the user command to one of these intents:
kb:load, kb:status, kb:clear, blog:draft, rates:update, help, unknown

Also extract any argument from the command (e.g. keyword for blog:draft, path for kb:load, tavily_api_key for rates:update).

Respond ONLY as JSON: {"intent": "...", "argument": "..."}"""

_KNOWN_INTENTS = {"kb:load", "kb:status", "kb:clear", "blog:draft", "rates:update", "help", "unknown"}


def _parse_intent(command: str) -> tuple[str, str]:
    """Use the LLM to classify the command into an intent + argument."""
    import json, re as _re
    messages = [
        {"role": "system", "content": _INTENT_PROMPT},
        {"role": "user", "content": command},
    ]
    raw = chat(messages, temperature=0.0)
    assert isinstance(raw, str)
    raw = _re.sub(r"```(?:json)?|```", "", raw).strip()
    try:
        parsed = json.loads(raw)
        intent = parsed.get("intent", "unknown")
        argument = parsed.get("argument", "")
        return intent if intent in _KNOWN_INTENTS else "unknown", str(argument)
    except Exception:
        return "unknown", ""


def _help_text() -> str:
    return (
        "Available admin commands:\n"
        "  kb:load [path]         - Load documents from a directory into the knowledge base\n"
        "  kb:status              - Show how many documents are in the knowledge base\n"
        "  kb:clear               - Remove all documents from the knowledge base\n"
        "  blog:draft <keyword>   - Generate a blog post draft for a keyword\n"
        "  rates:update           - Fetch and update loan rates in the knowledge base\n"
        "  help                   - Show this help message\n"
    )


def run(command: str, tavily_api_key: str | None = None) -> dict:
    """
    Execute an admin command.

    Args:
        command:        Natural-language command from the PHP admin panel.
        tavily_api_key: Optional Tavily key (needed for rates:update).

    Returns:
        dict with keys: intent, result, message.
    """
    if not is_available():
        return {
            "intent": "error",
            "result": None,
            "message": "Ollama is not available. Start Ollama and ensure qwen3:8b is pulled.",
        }

    intent, argument = _parse_intent(command)

    if intent == "help":
        return {"intent": intent, "result": None, "message": _help_text()}

    if intent == "kb:status":
        count = collection_count()
        return {
            "intent": intent,
            "result": {"count": count},
            "message": f"Knowledge base contains {count} document chunks.",
        }

    if intent == "kb:load":
        path = argument or None
        n = load_directory(path)
        return {
            "intent": intent,
            "result": {"chunks_loaded": n, "path": path},
            "message": f"Loaded {n} chunks into the knowledge base from '{path or 'kb/data/'}'.",
        }

    if intent == "kb:clear":
        col = get_collection()
        all_ids = col.get()["ids"]
        if all_ids:
            col.delete(ids=all_ids)
        return {
            "intent": intent,
            "result": {"deleted": len(all_ids)},
            "message": f"Cleared {len(all_ids)} documents from the knowledge base.",
        }

    if intent == "blog:draft":
        from agents import blog_agent
        keyword = argument or "education loan India"
        draft = blog_agent.run(keyword)
        return {
            "intent": intent,
            "result": {
                "title": draft["title"],
                "slug": draft["slug"],
                "word_count": draft["word_count"],
                "created_at": draft["created_at"],
            },
            "message": f"Blog draft '{draft['title']}' generated ({draft['word_count']} words).",
        }

    if intent == "rates:update":
        from agents import rate_agent
        key = tavily_api_key or argument or os.getenv("TAVILY_API_KEY", "")
        if not key:
            return {
                "intent": intent,
                "result": None,
                "message": "Tavily API key required. Pass it in the request or set TAVILY_API_KEY env var.",
            }
        result = asyncio.run(rate_agent.run(tavily_api_key=key))
        return {
            "intent": intent,
            "result": result,
            "message": f"Rates updated at {result['updated_at']} for {result['lenders_processed']} lenders.",
        }

    return {
        "intent": "unknown",
        "result": None,
        "message": f"Command not understood: '{command}'. Type 'help' for available commands.",
    }
