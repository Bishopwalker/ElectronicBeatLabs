"""
RAG Status Route — Live introspection of the RAG index.

Exposes /api/rag/status and /api/rag/chunks-summary so the frontend
console and the pipeline diagram can show real-time index metadata.
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter
from fastapi.responses import FileResponse, JSONResponse

router = APIRouter(prefix="/api/rag", tags=["rag"])

_PROJECT_ROOT = Path(__file__).resolve().parents[2]
_RAG_DIR = _PROJECT_ROOT / ".claude" / "rag"
_INDEX_META = _RAG_DIR / "data" / "index_meta.json"
_CHUNKS_FILE = _RAG_DIR / "data" / "ebl_chunks.json"
_CHROMA_DIR = _RAG_DIR / "chroma_db"
_DIAGRAM_HTML = _RAG_DIR / "rag_pipeline_diagram.html"


def _load_meta() -> Dict[str, Any]:
    """Load the persisted index metadata, if present."""
    if _INDEX_META.exists():
        with open(_INDEX_META, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}


def _check_dependencies() -> Dict[str, bool]:
    """Verify whether RAG runtime dependencies are importable."""
    deps = {"chromadb": False, "sentence_transformers": False, "mem0ai": False}
    for pkg in deps:
        try:
            __import__(pkg)
            deps[pkg] = True
        except ImportError:
            pass
    return deps


def _summarize_chunks() -> Dict[str, Any]:
    """Summarize the chunks file by chunk type and unique file count."""
    if not _CHUNKS_FILE.exists():
        return {"total_chunks": 0, "chunk_types": {}, "unique_files": 0}

    with open(_CHUNKS_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    chunk_types: Dict[str, int] = {}
    files = set()
    audio_term_chunks = 0
    for chunk in data.get("chunks", []):
        ctype = chunk.get("chunk_type", "unknown")
        chunk_types[ctype] = chunk_types.get(ctype, 0) + 1
        files.add(chunk.get("file_path", ""))
        if chunk.get("metadata", {}).get("has_audio_terms"):
            audio_term_chunks += 1

    return {
        "total_chunks": data.get("total_chunks", len(data.get("chunks", []))),
        "chunk_types": chunk_types,
        "unique_files": len(files),
        "audio_term_chunks": audio_term_chunks,
    }


@router.get("/status")
async def get_rag_status() -> JSONResponse:
    """
    Return current RAG index status, dependency health, and chunk summary.

    Returns:
        JSON payload describing the live state of the RAG subsystem.
    """
    meta = _load_meta()
    deps = _check_dependencies()
    chunks = _summarize_chunks()

    indexed = bool(meta) and _CHROMA_DIR.exists()
    last_indexed_iso = meta.get("timestamp")
    age_seconds = None
    if last_indexed_iso:
        try:
            last_dt = datetime.strptime(last_indexed_iso, "%Y-%m-%d %H:%M:%S")
            age_seconds = (datetime.now() - last_dt).total_seconds()
        except ValueError:
            pass

    return JSONResponse({
        "indexed": indexed,
        "chunk_count": meta.get("chunk_count", chunks["total_chunks"]),
        "embedding_model": meta.get("embedding_model", "all-MiniLM-L6-v2"),
        "provider": meta.get("provider", "ChromaDB (local)"),
        "last_indexed": last_indexed_iso,
        "age_seconds": age_seconds,
        "elapsed_index_seconds": meta.get("elapsed_seconds"),
        "dependencies": deps,
        "all_deps_ok": all(deps.values()),
        "chunks_summary": chunks,
        "chroma_dir_exists": _CHROMA_DIR.exists(),
        "chunks_file_exists": _CHUNKS_FILE.exists(),
    })


@router.get("/pipeline-diagram")
async def get_pipeline_diagram():
    """
    Serve the RAG pipeline architecture diagram (HTML).

    Returns:
        The static HTML diagram file.
    """
    if _DIAGRAM_HTML.exists():
        return FileResponse(_DIAGRAM_HTML, media_type="text/html")
    return JSONResponse(
        {"error": "Diagram not found", "expected_path": str(_DIAGRAM_HTML)},
        status_code=404,
    )
