"""
Knowledge Base Loader
---------------------
Loads documents into ChromaDB using all-MiniLM-L6-v2 embeddings.
Provides a retrieval interface for all agents.
"""

from __future__ import annotations

import os
from pathlib import Path
from typing import Optional

import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

_DATA_DIR = Path(__file__).parent / "data"
_CHROMA_DIR = Path(__file__).parent / ".chroma"
_COLLECTION_NAME = "loanmatters_kb"
_EMBED_MODEL = "all-MiniLM-L6-v2"

_client: Optional[chromadb.ClientAPI] = None
_collection: Optional[chromadb.Collection] = None
_embedder: Optional[SentenceTransformer] = None


def _get_embedder() -> SentenceTransformer:
    global _embedder
    if _embedder is None:
        _embedder = SentenceTransformer(_EMBED_MODEL)
    return _embedder


def _get_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        _CHROMA_DIR.mkdir(parents=True, exist_ok=True)
        _client = chromadb.PersistentClient(
            path=str(_CHROMA_DIR),
            settings=Settings(anonymized_telemetry=False),
        )
    return _client


def get_collection() -> chromadb.Collection:
    global _collection
    if _collection is None:
        client = _get_client()
        _collection = client.get_or_create_collection(
            name=_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
    return _collection


def load_documents(texts: list[str], ids: list[str], metadatas: list[dict] | None = None) -> None:
    """
    Upsert documents into ChromaDB.

    Args:
        texts:     List of document text chunks.
        ids:       Unique IDs (same length as texts).
        metadatas: Optional list of metadata dicts per document.
    """
    embedder = _get_embedder()
    collection = get_collection()
    embeddings = embedder.encode(texts, show_progress_bar=False).tolist()

    collection.upsert(
        ids=ids,
        documents=texts,
        embeddings=embeddings,
        metadatas=metadatas or [{} for _ in texts],
    )


def load_directory(directory: str | Path | None = None) -> int:
    """
    Load all .txt and .md files from *directory* (defaults to kb/data/).
    Returns the number of chunks loaded.
    """
    directory = Path(directory) if directory else _DATA_DIR
    if not directory.exists():
        directory.mkdir(parents=True, exist_ok=True)
        return 0

    texts, ids, metadatas = [], [], []
    for fpath in sorted(directory.glob("**/*")):
        if fpath.suffix not in {".txt", ".md"}:
            continue
        content = fpath.read_text(encoding="utf-8").strip()
        if not content:
            continue
        chunks = _chunk_text(content, chunk_size=400, overlap=50)
        for i, chunk in enumerate(chunks):
            texts.append(chunk)
            ids.append(f"{fpath.stem}_chunk_{i}")
            metadatas.append({"source": str(fpath.name), "chunk": i})

    if texts:
        load_documents(texts, ids, metadatas)

    return len(texts)


def retrieve(query: str, n_results: int = 5) -> list[dict]:
    """
    Retrieve the top-k most relevant chunks for a query.

    Returns a list of dicts with keys: id, document, metadata, distance.
    """
    embedder = _get_embedder()
    collection = get_collection()

    if collection.count() == 0:
        return []

    query_embedding = embedder.encode([query], show_progress_bar=False).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(n_results, collection.count()),
        include=["documents", "metadatas", "distances"],
    )

    output = []
    for doc, meta, dist, doc_id in zip(
        results["documents"][0],
        results["metadatas"][0],
        results["distances"][0],
        results["ids"][0],
    ):
        output.append({"id": doc_id, "document": doc, "metadata": meta, "distance": dist})

    return output


def collection_count() -> int:
    return get_collection().count()


def _chunk_text(text: str, chunk_size: int = 400, overlap: int = 50) -> list[str]:
    words = text.split()
    chunks: list[str] = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunks.append(" ".join(words[start:end]))
        start += chunk_size - overlap
    return chunks
