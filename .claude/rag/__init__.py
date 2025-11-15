"""
EBL RAG System - Code Intelligence & Search
Provides semantic search over the codebase using vector embeddings

Agent 3 additions:
- Memory Service (Mem0 integration)
- Configuration system
- Supabase vector storage
"""

from .chunking_strategy import EBLChunkingStrategy, CodeChunk
from .vector_database import (
    VectorProvider,
    BaseVectorDatabase,
    ChromaVectorDatabase,
    SupabaseVectorDatabase,
    VectorDatabaseFactory,
    CloudRAGPipeline
)
from .enhanced_retrieval import (
    EnhancedRAGRetrieval,
    SearchResult,
    AudioDomainQueryExpander
)
from .config import RAGConfig, load_config, print_config_summary
from .memory_service import MemoryService, MemoryType, Memory

__all__ = [
    # Core RAG (Agent 2)
    'EBLChunkingStrategy',
    'CodeChunk',
    'VectorProvider',
    'BaseVectorDatabase',
    'ChromaVectorDatabase',
    'SupabaseVectorDatabase',
    'VectorDatabaseFactory',
    'CloudRAGPipeline',
    'EnhancedRAGRetrieval',
    'SearchResult',
    'AudioDomainQueryExpander',
    # Agent 3: Mem0 + Supabase
    'RAGConfig',
    'load_config',
    'print_config_summary',
    'MemoryService',
    'MemoryType',
    'Memory'
]
