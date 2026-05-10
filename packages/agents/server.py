"""
Python Agent Server
-------------------
FastAPI app that exposes all agents as HTTP endpoints.

Start with:
    cd packages
    uvicorn agents.server:app --host 0.0.0.0 --port 8000 --reload

Endpoints:
    POST /api/ask                   → CompareAgent (chat widget)
    POST /api/cron/update-rates     → RateAgent    (n8n every 6h)
    POST /api/cron/draft-blog       → BlogAgent    (n8n weekly)
    POST /api/admin/command         → AdminAgent   (PHP admin panel)
    GET  /api/health                → health check
"""

from __future__ import annotations

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from typing import Optional
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents import compare_agent, blog_agent, admin_agent
from agents.llm import is_available

app = FastAPI(
    title="LoanMatters Agent Server",
    description="Ollama-powered agents for loan comparison, rate updates, blog generation, and admin commands.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")


def require_admin(authorization: str = Header(default="")):
    if _ADMIN_PASSWORD and authorization != f"Bearer {_ADMIN_PASSWORD}":
        raise HTTPException(status_code=401, detail="Unauthorized")


class AskRequest(BaseModel):
    question: str
    n_context: int = 5


class RatesRequest(BaseModel):
    tavily_api_key: Optional[str] = None


class BlogRequest(BaseModel):
    keyword: str
    save_draft: bool = True


class AdminRequest(BaseModel):
    command: str
    tavily_api_key: Optional[str] = None


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "ollama": is_available(),
        "model": os.getenv("OLLAMA_MODEL", "qwen3:8b"),
    }


@app.post("/api/ask")
def ask(req: AskRequest):
    """CompareAgent — answer a loan question with RAG from ChromaDB."""
    try:
        result = compare_agent.run(question=req.question, n_context=req.n_context)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/cron/update-rates")
async def update_rates(req: RatesRequest, _: None = Depends(require_admin)):
    """RateAgent — fetch fresh loan rates and update ChromaDB (n8n every 6h)."""
    try:
        from agents import rate_agent
        result = await rate_agent.run(tavily_api_key=req.tavily_api_key)
        return result
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/cron/draft-blog")
def draft_blog(req: BlogRequest, _: None = Depends(require_admin)):
    """BlogAgent — generate a full SEO blog draft for a keyword (n8n weekly)."""
    try:
        result = blog_agent.run(keyword=req.keyword, save_draft=req.save_draft)
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/api/admin/command")
def admin_command(req: AdminRequest, _: None = Depends(require_admin)):
    """AdminAgent — natural-language admin commands from the PHP admin panel."""
    try:
        result = admin_agent.run(
            command=req.command,
            tavily_api_key=req.tavily_api_key,
        )
        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
