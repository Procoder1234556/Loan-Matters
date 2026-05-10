"""
CompareAgent
------------
Handles POST /api/ask from the chat widget.
Retrieves relevant knowledge-base context and answers loan-related questions
using Ollama → Qwen3:8b.
"""

from __future__ import annotations

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from kb.loader import retrieve
from agents.llm import chat

_SYSTEM_PROMPT = """You are LoanMate, an expert assistant for Indian STEM students navigating education loans.
You specialise in comparing loan products from SBI, HDFC Credila, Axis Bank, ICICI, Avanse, and other lenders.
Always give clear, structured answers. Use INR amounts and Indian context.
When you do not know something, say so — do not fabricate interest rates or bank policies.
"""


def run(question: str, n_context: int = 5) -> dict:
    """
    Answer a user question with RAG context from ChromaDB.

    Args:
        question:  The user's chat message.
        n_context: Number of KB chunks to include as context.

    Returns:
        dict with keys: answer (str), sources (list[dict]).
    """
    chunks = retrieve(question, n_results=n_context)

    context_block = ""
    if chunks:
        context_parts = [
            f"[Source: {c['metadata'].get('source', 'kb')}]\n{c['document']}"
            for c in chunks
        ]
        context_block = "\n\n---\n\n".join(context_parts)

    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
    ]

    if context_block:
        messages.append({
            "role": "system",
            "content": f"Relevant knowledge base context:\n\n{context_block}",
        })

    messages.append({"role": "user", "content": question})

    answer = chat(messages, temperature=0.5)
    assert isinstance(answer, str)

    sources = [
        {"source": c["metadata"].get("source", "kb"), "excerpt": c["document"][:200]}
        for c in chunks
    ]

    return {"answer": answer, "sources": sources}
