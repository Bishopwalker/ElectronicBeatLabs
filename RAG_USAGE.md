# EBL RAG System Usage Guide

## ✅ Setup Complete!

Your EBL RAG chunking system has been successfully set up with:
- **338 total chunks** generated from your project
- **423KB JSON file** saved at `backend/rag/ebl_chunks.json`
- **Audio-focused relevance scoring** implemented

## 🚀 Usage Pattern (Exactly as Requested)

```python
from backend.rag.chunking_strategy import EBLChunkingStrategy

# Initialize
chunker = EBLChunkingStrategy(project_root="C:/Users/bisho/ideaprojects/ebl")

# Chunk your entire project
chunks = chunker.chunk_project()

# Save to JSON
chunker.save_chunks("ebl_chunks.json")

# Find relevant chunks for a query
relevant = chunker.get_relevant_chunks("audio engine frequency", top_k=5)
```

## 📊 System Features

### Chunk Types Generated:
- **Python classes** with methods and metadata
- **Python functions** with docstrings
- **TypeScript/React components**
- **Import statements** and dependencies
- **Interfaces and type definitions**

### Audio-Specific Intelligence:
- Recognizes audio terms: `Hz`, `binaural`, `carrier`, `beat`, `phase`, `amplitude`
- Prioritizes audio components: `AudioEngine`, `BinauralTest`, `PatternSelector`
- Identifies audio hooks: `useAudioEngine`, `useWebSocket`, `useBackendAPI`
- Maps API routes: `/api/audio`, `/api/patterns`, `/api/timer`

### Priority System:
- **High Priority (1.0)**: Files in `src/hooks/`, `src/components/audio/`, `backend/services/`
- **Medium Priority (0.5)**: Main source files
- **Low Priority (0.3)**: Test files

## 🔍 Example Queries That Work Well:

```python
# Audio-related queries
relevant = chunker.get_relevant_chunks("audio engine frequency", top_k=5)
relevant = chunker.get_relevant_chunks("binaural beat generator", top_k=5)
relevant = chunker.get_relevant_chunks("WebSocket connection", top_k=5)

# Component queries
relevant = chunker.get_relevant_chunks("React component hook", top_k=5)
relevant = chunker.get_relevant_chunks("backend API route", top_k=5)
```

## 📁 Files Generated:
- `backend/rag/chunking_strategy.py` - The main chunking logic
- `backend/rag/ebl_chunks.json` - Your project chunks (423KB)
- `test_chunking.py` - Test script
- `RAG_USAGE.md` - This usage guide

## 🎯 Ready for RAG Integration!

Your chunks are now ready to be used with:
- Vector databases (Pinecone, Weaviate, Chroma)
- Embedding models (OpenAI, Sentence Transformers)
- LLM retrieval systems
- Semantic search applications

The chunking strategy is specifically optimized for your EBL audio project and will prioritize audio-related code when searching, Cash Money! 🎧