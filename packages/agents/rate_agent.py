"""
RateAgent
---------
Handles POST /api/cron/update-rates (triggered by n8n every 6 hours).
Fetches up-to-date education loan rates, summarises changes with Qwen3:8b,
and upserts the results back into ChromaDB so the KB stays current.
"""

from __future__ import annotations

import sys
import os
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import httpx
from agents.llm import chat
from kb.loader import load_documents

_LENDERS = [
    "SBI education loan interest rate 2025",
    "HDFC Credila education loan rate 2025",
    "Axis Bank education loan interest 2025",
    "ICICI Bank education loan rate 2025",
    "Avanse education loan interest 2025",
    "Union Bank education loan rate 2025",
]

_SYSTEM_PROMPT = """You are a financial data analyst for Indian education loans.
Given raw web content about lender rates, extract a clean structured summary with:
- Lender name
- Current interest rate range (ROI)
- Processing fee
- Moratorium period
- Repayment tenure
- Key conditions or restrictions

Format each lender as a concise paragraph. Use INR where applicable.
"""


async def fetch_rate_data(tavily_api_key: str, query: str) -> str:
    """Call Tavily search API to get fresh rate data for one lender."""
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://api.tavily.com/search",
            json={
                "api_key": tavily_api_key,
                "query": query,
                "search_depth": "advanced",
                "include_answer": True,
                "max_results": 3,
                "days": 30,
            },
        )
        response.raise_for_status()
        data = response.json()
        answer = data.get("answer", "")
        snippets = " ".join(
            r.get("content", "") for r in data.get("results", [])[:3]
        )
        return f"{answer}\n\n{snippets}".strip()


def summarise_rates(raw_data: str) -> str:
    """Use Qwen3:8b to summarise raw rate content into structured KB text."""
    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user", "content": f"Raw rate data:\n\n{raw_data}"},
    ]
    result = chat(messages, temperature=0.2)
    assert isinstance(result, str)
    return result


async def run(tavily_api_key: str | None = None) -> dict:
    """
    Fetch fresh loan rates from Tavily, summarise with LLM, store in ChromaDB.

    Args:
        tavily_api_key: Tavily API key. Falls back to TAVILY_API_KEY env var.

    Returns:
        dict with keys: updated_at, lenders_processed, summary.
    """
    api_key = tavily_api_key or os.getenv("TAVILY_API_KEY", "")
    if not api_key:
        raise ValueError("Tavily API key required (pass tavily_api_key or set TAVILY_API_KEY env)")

    raw_parts: list[str] = []
    for query in _LENDERS:
        try:
            raw = await fetch_rate_data(api_key, query)
            raw_parts.append(raw)
        except Exception as exc:
            raw_parts.append(f"[Error fetching '{query}': {exc}]")

    combined_raw = "\n\n===\n\n".join(raw_parts)
    summary = summarise_rates(combined_raw)

    updated_at = datetime.now(timezone.utc).isoformat()
    doc_id = f"rates_update_{datetime.now(timezone.utc).strftime('%Y%m%d_%H')}"

    load_documents(
        texts=[summary],
        ids=[doc_id],
        metadatas=[{"source": "rate_agent", "updated_at": updated_at, "type": "rates"}],
    )

    return {
        "updated_at": updated_at,
        "lenders_processed": len(_LENDERS),
        "summary": summary,
    }
