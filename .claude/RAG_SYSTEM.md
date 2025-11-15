# RAG System Documentation

**Location:** `.claude/rag/`
**Status:** Migrated from backend (Agent 2 completed)
**Access:** MCP Tools (Agent 4 integration pending)

## Directory Structure

```
.claude/rag/
├── __init__.py                     # RAG module initialization
├── chunking_strategy.py            # Code chunking and parsing
├── vector_database.py              # Vector DB (ChromaDB) integration
├── enhanced_retrieval.py           # Hybrid search (vector + keyword)
├── audio_domain_training.py        # Domain-specific training data generation
├── evaluation_framework.py         # RAG performance metrics and benchmarking
├── demo_audio_engine.py            # Audio engine demonstration script
├── rag_requirements.txt            # RAG-specific Python dependencies
├── data/                           # RAG Data Files
│   ├── ebl_chunks.json             # Preprocessed code chunks (338 chunks)
│   ├── audio_training_data.jsonl   # Fine-tuning training data
│   └── evaluation_queries.json     # Evaluation test queries
└── scripts/                        # RAG Utility Scripts
    ├── run_rag.py                  # Quick RAG execution
    ├── setup_rag.py                # RAG system setup and chunking
    └── test_rag_improvements.py    # Test RAG improvements
```

## What is RAG?

Retrieval-Augmented Generation (RAG) is a code intelligence system that:
- Semantically searches the codebase using vector embeddings
- Provides contextually relevant code snippets for AI assistants
- Uses hybrid search (vector similarity + keyword matching)
- Includes audio domain-specific optimizations

## Key Components

### 1. Chunking Strategy (`chunking_strategy.py`)
- Parses Python and TypeScript/React files
- Creates semantic code chunks (functions, classes, components)
- Extracts metadata (file path, line numbers, audio terms)
- Prioritizes audio-related code

### 2. Vector Database (`vector_database.py`)
- ChromaDB local persistence (`.claude/rag/chroma_db/`)
- Sentence transformers for embeddings
- Multi-provider support (ChromaDB, Pinecone, Weaviate)
- Extensible factory pattern

### 3. Enhanced Retrieval (`enhanced_retrieval.py`)
- Hybrid search: vector similarity + TF-IDF keyword matching
- Audio domain query expansion (e.g., "frequency" → "hz", "hertz", "oscillation")
- Audio-specific content boosting
- Better embedding model support (`all-mpnet-base-v2`)

### 4. Audio Domain Training (`audio_domain_training.py`)
- Generates positive/negative training pairs
- Audio-specific vocabulary and concepts
- Fine-tuning data for embedding models
- 87KB training dataset generated

### 5. Evaluation Framework (`evaluation_framework.py`)
- Precision@K, Recall, MRR metrics
- Benchmarking different embedding models
- Query-specific performance testing
- Results saved to `.claude/rag/evaluation_results/`

## Migration Details (Agent 2)

### Files Migrated
- **Core Modules:** 6 Python files (chunking, vector DB, retrieval, training, evaluation, demo)
- **Data Files:** 3 JSON/JSONL files (~520KB total)
- **Scripts:** 3 utility scripts
- **Dependencies:** `rag_requirements.txt`

### Backend Cleanup
- ✅ Deleted `backend/rag/` directory
- ✅ Deleted `backend/routes/rag_routes.py` (REST API)
- ✅ Removed RAG imports from `backend/main.py`
- ✅ Deleted root-level scripts (`run_rag.py`, `setup_rag.py`, `test_rag_improvements.py`)

### Path Updates
- `backend/rag/ebl_chunks.json` → `.claude/rag/data/ebl_chunks.json`
- `backend/rag/chroma_db` → `.claude/rag/chroma_db`
- `backend/rag/audio_training_data.jsonl` → `.claude/rag/data/audio_training_data.jsonl`

## Usage (After MCP Integration)

The RAG system will be accessible via MCP tools:
- `search_code(query)` - Semantic code search
- `find_definition(symbol)` - Find function/class definitions
- `get_context(file, line)` - Get code context around a location
- `explain_error(stack_trace)` - Parse errors and retrieve relevant code

## Installation

```bash
# Install RAG dependencies
pip install -r .claude/rag/rag_requirements.txt

# Or individual packages:
pip install chromadb sentence-transformers numpy torch transformers
```

## Performance

- **Total Chunks:** 338 (36% audio-related)
- **Average Chunk Size:** 836 characters
- **Embedding Model:** `all-mpnet-base-v2` (768-dim)
- **Search Latency:** ~50-200ms per query
- **Expected Improvement:** 20-40% better precision on audio queries

## Next Steps (Agent 4)

1. Create MCP server configuration
2. Implement MCP tools using `.claude.rag` modules
3. Test integration with Claude Desktop
4. Replace REST API calls with MCP tool calls
5. Add Mem0 integration (Agent 3) for context persistence

## References

- **MCP Audit Report:** `.claude/MCP_AUDIT_REPORT.md`
- **Migration Report:** `.claude/RAG_MIGRATION_REPORT.md` (this file)
- **Index:** `.claude/INDEX.md`
