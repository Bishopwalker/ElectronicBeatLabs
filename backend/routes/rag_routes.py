"""
RAG API Routes - Code Intelligence Search
Provides semantic search endpoints for the frontend
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional, Tuple
from pathlib import Path
import os
import logging

logger = logging.getLogger("ebl.rag_routes")

router = APIRouter(prefix="/api/rag", tags=["rag"])

# Global RAG system (initialized on startup)
rag_system = None
rag_project_root: Optional[Path] = None

class SearchQuery(BaseModel):
    """Search query model"""
    query: str
    n_results: int = 5
    vector_weight: float = 0.7
    keyword_weight: float = 0.3
    audio_boost_weight: float = 0.2

class SearchResponse(BaseModel):
    """Search response model"""
    query: str
    expanded_terms: List[str]
    results: List[Dict[str, Any]]
    total_results: int

class ErrorContextRequest(BaseModel):
    """Request body for error-context extraction"""
    stack_trace: str
    query: Optional[str] = None
    top_k: int = 5
    context_lines: int = 15

class ErrorContextResponse(BaseModel):
    """Response for error-context extraction"""
    frames: List[Dict[str, Any]]
    matches: List[Dict[str, Any]]
    suggestions: List[str]


def initialize_rag(project_root: str, use_enhanced: bool = True):
    """
    Initialize the RAG system on startup

    Args:
        project_root: Path to the EBL project
        use_enhanced: Use enhanced retrieval with hybrid search
    """
    global rag_system, rag_project_root

    try:
        rag_project_root = Path(project_root)
        if use_enhanced:
            # Local package import
            from rag.enhanced_retrieval import EnhancedRAGRetrieval
            logger.info("Initializing Enhanced RAG Retrieval System...")
            chunks_path = Path(__file__).resolve().parents[1] / "rag" / "ebl_chunks.json"
            rag_system = EnhancedRAGRetrieval(
                chunks_file=str(chunks_path),
                embedding_model="all-mpnet-base-v2"  # Better embeddings
            )
            logger.info(f"Enhanced RAG initialized with {len(rag_system.chunks)} chunks")
        else:
            from rag.vector_database import CloudRAGPipeline, VectorProvider
            logger.info("Initializing Cloud RAG Pipeline...")
            rag_system = CloudRAGPipeline(
                project_root=project_root,
                provider=VectorProvider.CHROMA
            )
            logger.info("Cloud RAG pipeline initialized")

        return True

    except Exception as e:
        logger.error(f"Failed to initialize RAG system: {e}")
        logger.error(f"Install dependencies: pip install sentence-transformers scikit-learn chromadb")
        rag_system = None
        rag_project_root = None
        return False

@router.get("/status")
async def get_rag_status():
    """Check RAG system status"""
    if rag_system is None:
        return {
            "status": "offline",
            "message": "RAG system not initialized. Install dependencies: pip install sentence-transformers scikit-learn chromadb"
        }

    try:
        chunk_count = len(rag_system.chunks) if hasattr(rag_system, 'chunks') else 0
        return {
            "status": "online",
            "system_type": "EnhancedRAGRetrieval" if hasattr(rag_system, 'hybrid_search') else "CloudRAGPipeline",
            "total_chunks": chunk_count,
            "embedding_model": rag_system.embedding_model_name if hasattr(rag_system, 'embedding_model_name') else "unknown"
        }
    except Exception as e:
        logger.error(f"Error getting RAG status: {e}")
        return {
            "status": "error",
            "message": str(e)
        }

@router.post("/search", response_model=SearchResponse)
async def search_code(search_query: SearchQuery):
    """
    Search the codebase using semantic search

    **Examples:**
    - "audio engine frequency generation"
    - "useAudioEngine hook implementation"
    - "WebSocket real-time streaming"
    - "binaural beat calculation"
    """
    if rag_system is None:
        raise HTTPException(
            status_code=503,
            detail="RAG system not initialized. Install dependencies: pip install sentence-transformers scikit-learn chromadb"
        )

    try:
        # Use enhanced hybrid search if available
        if hasattr(rag_system, 'hybrid_search'):
            results = rag_system.hybrid_search(
                query=search_query.query,
                n_results=search_query.n_results,
                vector_weight=search_query.vector_weight,
                keyword_weight=search_query.keyword_weight,
                audio_boost_weight=search_query.audio_boost_weight
            )

            # Get expanded terms
            expanded_terms = rag_system.query_expander.expand_query(search_query.query)

            # Format results
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "chunk_id": result.chunk_id,
                    "content": result.content,
                    "file_path": result.file_path,
                    "metadata": result.metadata,
                    "scores": {
                        "vector": float(result.vector_score),
                        "keyword": float(result.keyword_score),
                        "audio_boost": float(result.audio_boost),
                        "final": float(result.final_score)
                    }
                })

            return SearchResponse(
                query=search_query.query,
                expanded_terms=expanded_terms,
                results=formatted_results,
                total_results=len(formatted_results)
            )

        else:
            # Use basic vector search
            results = rag_system.query(search_query.query, search_query.n_results)

            return SearchResponse(
                query=search_query.query,
                expanded_terms=[search_query.query],
                results=results.get('results', []),
                total_results=len(results.get('results', []))
            )

    except Exception as e:
        logger.error(f"Search error: {e}")
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

@router.get("/search")
async def search_code_get(
    query: str = Query(..., description="Search query"),
    n_results: int = Query(5, ge=1, le=20, description="Number of results")
):
    """
    Search the codebase using GET method (for quick testing)
    """
    search_query = SearchQuery(query=query, n_results=n_results)
    return await search_code(search_query)

@router.get("/suggest")
async def get_suggestions():
    """Get suggested search queries for audio-related code"""
    return {
        "suggestions": [
            {
                "category": "Audio Engine",
                "queries": [
                    "audio engine frequency generation",
                    "binaural beat calculation",
                    "audio buffer management",
                    "sample rate processing"
                ]
            },
            {
                "category": "React Hooks",
                "queries": [
                    "useAudioEngine hook",
                    "useBackendAudioEngine implementation",
                    "audio context management",
                    "real-time audio state"
                ]
            },
            {
                "category": "WebSocket",
                "queries": [
                    "WebSocket audio streaming",
                    "real-time data transmission",
                    "websocket connection handling",
                    "binary audio frames"
                ]
            },
            {
                "category": "Components",
                "queries": [
                    "frequency visualizer component",
                    "timer countdown display",
                    "audio controls UI",
                    "equalizer interface"
                ]
            }
        ]
    }

@router.get("/stats")
async def get_rag_stats():
    """Get RAG system statistics"""
    if rag_system is None:
        raise HTTPException(status_code=503, detail="RAG system not initialized")

    try:
        stats = {
            "total_chunks": len(rag_system.chunks) if hasattr(rag_system, 'chunks') else 0,
            "system_type": "EnhancedRAGRetrieval" if hasattr(rag_system, 'hybrid_search') else "CloudRAGPipeline"
        }

        if hasattr(rag_system, 'embedding_model_name'):
            stats["embedding_model"] = rag_system.embedding_model_name

        if hasattr(rag_system, 'tfidf_matrix'):
            stats["tfidf_features"] = rag_system.tfidf_matrix.shape[1]

        return stats

    except Exception as e:
        logger.error(f"Error getting RAG stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# -----------------------------
# Error-context endpoint
# -----------------------------

def _load_file_excerpt(abs_path: Path, line: int, context_lines: int) -> Tuple[str, int, int]:
    """Return a text excerpt around a 1-based line number.

    Returns (excerpt_text, start_line, end_line) where start_line/end_line are 1-based.
    """
    try:
        content = abs_path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        content = abs_path.read_text(encoding="latin-1")
    lines = content.splitlines()
    idx = max(1, line)
    start = max(1, idx - context_lines)
    end = min(len(lines), idx + context_lines)
    excerpt = "\n".join(lines[start - 1 : end])
    return excerpt, start, end


def _match_chunks_for_frame(file_rel: str, line: int) -> List[Dict[str, Any]]:
    """Find chunks in rag_system that match a file and line.

    Returns a list of dicts with chunk metadata and simple scores (closest first).
    """
    results: List[Tuple[int, Dict[str, Any]]] = []
    if not hasattr(rag_system, "chunks"):
        return []

    for chunk in rag_system.chunks:
        # chunk['file_path'] is relative in our prebuilt JSON
        if str(chunk.get("file_path", "")).endswith(file_rel.replace("\\", "/")):
            start = int(chunk.get("start_line", 1))
            end = int(chunk.get("end_line", start))
            if start <= line <= end:
                distance = 0
            else:
                # distance to nearest edge
                distance = min(abs(line - start), abs(line - end))
            results.append((distance, chunk))

    results.sort(key=lambda x: x[0])
    out: List[Dict[str, Any]] = []
    for dist, ch in results[:5]:
        out.append(
            {
                "id": ch.get("id"),
                "file_path": ch.get("file_path"),
                "chunk_type": ch.get("chunk_type"),
                "start_line": ch.get("start_line"),
                "end_line": ch.get("end_line"),
                "metadata": ch.get("metadata", {}),
                "proximity_score": max(0, 1.0 - min(dist, 50) / 50.0),
            }
        )
    return out


@router.post("/error-context", response_model=ErrorContextResponse)
async def error_context(req: ErrorContextRequest):
    """Parse a stack trace and return the most relevant code slices and chunks.

    - Parses Python and Node/TS stack traces
    - Maps frames to repository files (using project_root)
    - Retrieves matching chunks and small excerpts around failing lines
    - Optionally augments with hybrid semantic search if a free-text `query` is provided
    """
    if rag_project_root is None:
        raise HTTPException(status_code=503, detail="RAG not initialized (project root unknown)")

    try:
        from utils.stack_trace import parse_stack_trace
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Stack trace parser unavailable: {e}")

    frames_raw = parse_stack_trace(req.stack_trace)
    frames: List[Dict[str, Any]] = []
    matches: List[Dict[str, Any]] = []

    for fr in frames_raw:
        # Normalize and resolve path
        rel_path_guess = fr.file_path.replace("\\", "/")
        # Try direct rel to project root; also try stripping leading './' or absolute project path
        candidates: List[Path] = []
        p1 = rag_project_root / rel_path_guess
        candidates.append(p1)

        # If absolute inside project, make it relative
        try:
            abs_path = Path(fr.file_path)
            if abs_path.is_absolute() and str(abs_path).startswith(str(rag_project_root)):
                candidates.append(abs_path)
        except Exception:
            pass

        abs_file: Optional[Path] = None
        for cand in candidates:
            if cand.exists() and cand.is_file():
                abs_file = cand
                break

        frame_dict = {
            "file_path": fr.file_path,
            "resolved_path": str(abs_file) if abs_file else None,
            "line": fr.line,
            "column": fr.column,
            "function": fr.function,
            "language": fr.language,
        }
        frames.append(frame_dict)

        # Collect chunk matches
        rel_for_lookup = None
        if abs_file:
            try:
                rel_for_lookup = str(abs_file.relative_to(rag_project_root)).replace("\\", "/")
            except Exception:
                rel_for_lookup = rel_path_guess
        else:
            rel_for_lookup = rel_path_guess

        chunk_matches = _match_chunks_for_frame(rel_for_lookup, fr.line)

        # Add excerpt for the best local match, if we could resolve the file
        excerpt_info: Optional[Tuple[str, int, int]] = None
        if abs_file:
            try:
                excerpt_info = _load_file_excerpt(abs_file, fr.line, req.context_lines)
            except Exception:
                excerpt_info = None

        if chunk_matches:
            best = chunk_matches[0]
            entry = {
                "frame": frame_dict,
                "best_chunk": best,
                "other_chunks": chunk_matches[1:],
            }
            if excerpt_info:
                excerpt_text, start_line, end_line = excerpt_info
                entry["excerpt"] = {
                    "text": excerpt_text,
                    "start_line": start_line,
                    "end_line": end_line,
                }
            matches.append(entry)
        elif excerpt_info:
            excerpt_text, start_line, end_line = excerpt_info
            matches.append(
                {
                    "frame": frame_dict,
                    "best_chunk": None,
                    "other_chunks": [],
                    "excerpt": {
                        "text": excerpt_text,
                        "start_line": start_line,
                        "end_line": end_line,
                    },
                }
            )

    # Optional semantic augmentation using the provided query
    if req.query and hasattr(rag_system, "hybrid_search"):
        try:
            extra_res = rag_system.hybrid_search(req.query, n_results=max(1, req.top_k))
            for r in extra_res:
                matches.append(
                    {
                        "frame": None,
                        "best_chunk": {
                            "id": r.chunk_id,
                            "file_path": r.file_path,
                            "chunk_type": r.metadata.get("chunk_type") if r.metadata else None,
                            "start_line": r.metadata.get("start_line") if r.metadata else None,
                            "end_line": r.metadata.get("end_line") if r.metadata else None,
                            "metadata": r.metadata or {},
                            "proximity_score": r.final_score,
                        },
                        "other_chunks": [],
                        "excerpt": None,
                    }
                )
        except Exception as e:
            logger.debug(f"Hybrid search augmentation failed: {e}")

    suggestions = [
        "Verify import/export paths and casing",
        "Search symbol definitions and usages",
        "Check nearby test files for examples",
    ]

    return ErrorContextResponse(frames=frames, matches=matches, suggestions=suggestions)
