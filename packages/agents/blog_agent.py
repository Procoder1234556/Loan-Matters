"""
BlogAgent
---------
Handles POST /api/cron/draft-blog (triggered by n8n weekly).
Generates a full SEO blog post draft on a given keyword using Qwen3:8b
and stores the result for review before publishing.
"""

from __future__ import annotations

import sys
import os
import json
import re
from datetime import datetime, timezone
from pathlib import Path

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from kb.loader import retrieve
from agents.llm import chat

_DRAFTS_DIR = Path(__file__).parent.parent / "drafts"
_DRAFTS_DIR.mkdir(exist_ok=True)

_OUTLINE_PROMPT = """You are an expert SEO content strategist specialising in Indian education finance.
Given a keyword, produce a structured blog post outline as JSON:
{
  "title": "...",
  "meta_description": "...",
  "slug": "...",
  "sections": [
    {"heading": "...", "key_points": ["...", "..."]}
  ]
}
Output ONLY valid JSON, no markdown fences."""

_WRITE_PROMPT = """You are a senior content writer for LoanMatters, a platform helping STEM students in India navigate education loans.
Write a comprehensive, SEO-optimised blog post section based on the heading and key points provided.
Tone: professional yet approachable. Target audience: Indian engineering/STEM students and their parents.
Include relevant data points, real lender names, and practical advice.
Length: 250-400 words per section."""


def _build_outline(keyword: str, context: str) -> dict:
    messages = [
        {"role": "system", "content": _OUTLINE_PROMPT},
        {
            "role": "user",
            "content": f"Keyword: {keyword}\n\nContext from knowledge base:\n{context}",
        },
    ]
    raw = chat(messages, temperature=0.4)
    assert isinstance(raw, str)
    raw = re.sub(r"```(?:json)?|```", "", raw).strip()
    return json.loads(raw)


def _write_section(heading: str, key_points: list[str], keyword: str) -> str:
    points_text = "\n".join(f"- {p}" for p in key_points)
    messages = [
        {"role": "system", "content": _WRITE_PROMPT},
        {
            "role": "user",
            "content": (
                f"Main keyword: {keyword}\n"
                f"Section heading: {heading}\n"
                f"Key points to cover:\n{points_text}"
            ),
        },
    ]
    result = chat(messages, temperature=0.7)
    assert isinstance(result, str)
    return result


def run(keyword: str, save_draft: bool = True) -> dict:
    """
    Generate a full blog post draft for the given keyword.

    Args:
        keyword:    The SEO keyword / topic for the blog post.
        save_draft: If True, save the draft to packages/drafts/ as JSON.

    Returns:
        dict with keys: title, slug, meta_description, sections, created_at, word_count.
    """
    chunks = retrieve(keyword, n_results=6)
    context = "\n\n".join(c["document"] for c in chunks)

    outline = _build_outline(keyword, context)

    sections_content: list[dict] = []
    for sec in outline.get("sections", []):
        content = _write_section(sec["heading"], sec.get("key_points", []), keyword)
        sections_content.append({"heading": sec["heading"], "content": content})

    full_text = "\n\n".join(
        f"## {s['heading']}\n\n{s['content']}" for s in sections_content
    )
    word_count = len(full_text.split())

    created_at = datetime.now(timezone.utc).isoformat()
    draft = {
        "title": outline.get("title", keyword),
        "slug": outline.get("slug", keyword.lower().replace(" ", "-")),
        "meta_description": outline.get("meta_description", ""),
        "keyword": keyword,
        "sections": sections_content,
        "created_at": created_at,
        "word_count": word_count,
        "status": "draft",
    }

    if save_draft:
        fname = _DRAFTS_DIR / f"{draft['slug']}_{datetime.now(timezone.utc).strftime('%Y%m%d')}.json"
        fname.write_text(json.dumps(draft, indent=2, ensure_ascii=False))

    return draft
