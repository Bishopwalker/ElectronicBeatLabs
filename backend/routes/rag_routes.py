"""
RAG API Routes - Code Intelligence Search
Provides semantic search endpoints for the frontend
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger("ebl.rag_routes")

router = APIRouter(prefix="/api/rag", tags=["rag"])

# Global RAG system (initialized on startup)
rag_system = None


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


def initialize_rag(project_root: str, use_enhanced: bool = True):
    """
    Initialize the RAG system on startup

    Args:
        project_root: Path to the EBL project
        use_enhanced: Use enhanced retrieval with hybrid search
    """
    global rag_system

    try:
        if use_enhanced:
            from rag.enhanced_retrieval import EnhancedRAGRetrieval
            logger.info("Initializing Enhanced RAG Retrieval System...")
            rag_system = EnhancedRAGRetrieval(
                chunks_file="rag/ebl_chunks.json",
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
