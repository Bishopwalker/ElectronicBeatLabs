# EBL RAG System Examples

Comprehensive examples demonstrating the RAG system with Mem0 and Supabase integration.

## Quick Start

```bash
# Install dependencies
cd .claude/rag
pip install -r rag_requirements.txt

# Run any example
python examples/example_memory_usage.py
python examples/example_supabase_setup.py
python examples/example_hybrid_system.py
```

## Examples Overview

### 1. Memory Service Usage (`example_memory_usage.py`)

**What it demonstrates:**
- Session memory tracking
- Code context recording
- Architectural decision logging
- Learning from successes/failures
- Memory search and retrieval
- RAG query enhancement

**Use cases:**
- Track work across Claude sessions
- Remember what files you've been working on
- Record why you made certain decisions
- Learn from past approaches

**Run it:**
```bash
python examples/example_memory_usage.py
```

**Key features shown:**
```python
# Save session context
memory.save_session_memory(
    session_id="session_123",
    content="Fixing audio buffer starvation bug"
)

# Track code changes
memory.save_code_context(
    file_path="src/hooks/useHybridAudioEngine.ts",
    context="Increased buffer size to 32 frames"
)

# Record decisions
memory.save_decision(
    decision="Use AudioWorklet instead of ScriptProcessorNode",
    rationale="Better performance",
    outcome="Successfully eliminated glitches"
)

# Search memories
results = memory.search_memory("audio buffer")
```

### 2. Supabase Setup (`example_supabase_setup.py`)

**What it demonstrates:**
- Supabase cloud vector storage setup
- Project indexing to cloud
- Vector similarity search
- Metadata filtering
- Performance benchmarking

**Use cases:**
- Team collaboration (shared vector database)
- Access codebase from anywhere
- Scale beyond local storage
- Cloud-first development

**Prerequisites:**
1. Supabase account and project
2. pgvector extension enabled
3. Table created (see SETUP.md)
4. Environment variables set

**Run it:**
```bash
# Set up .env first
VECTOR_PROVIDER=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-key

# Run example
python examples/example_supabase_setup.py
```

**Key features shown:**
```python
# Initialize with Supabase
rag = CloudRAGPipeline(
    project_root="C:/Users/bisho/IdeaProjects/ebl",
    provider=VectorProvider.SUPABASE,
    supabase_url=os.getenv("SUPABASE_URL"),
    supabase_key=os.getenv("SUPABASE_KEY")
)

# Index to cloud
rag.index_project()

# Search
results = rag.query("audio buffer management")

# Performance test
# ... shows average query latency
```

### 3. Hybrid System (`example_hybrid_system.py`)

**What it demonstrates:**
- RAG + Memory working together
- Context-aware code search
- Real-world coding session simulation
- Decision tracking during development
- Learning accumulation

**Use cases:**
- Complete development workflow
- Bug investigation with context
- Feature development with memory
- Code review with history
- Onboarding new developers

**Run it:**
```bash
python examples/example_hybrid_system.py
```

**Key features shown:**
```python
# Initialize both systems
config = load_config()
rag = CloudRAGPipeline(...)
memory = MemoryService(config.get_mem0_config())

# Save work context
memory.save_session_memory(
    session_id="session_123",
    content="Debugging audio buffer issues"
)

# Basic RAG query
results = rag.query("buffer management")

# Enhanced query with memory context
enhanced = memory.enhance_rag_query("buffer management", "session_123")
better_results = rag.query(enhanced)
# → More relevant results!
```

## Example Scenarios

### Scenario 1: Bug Investigation

```python
from .claude.rag import CloudRAGPipeline, MemoryService, load_config, VectorProvider

config = load_config()
rag = CloudRAGPipeline(project_root="...", provider=VectorProvider.CHROMA)
memory = MemoryService(config.get_mem0_config())

session_id = "bug_investigation_001"

# 1. Start investigation
memory.save_session_memory(
    session_id=session_id,
    content="User reports audio dropouts at 48kHz",
    metadata={"bug_id": "EBL-456", "severity": "high"}
)

# 2. Search for related code
results = rag.query("audio buffer 48kHz")

# 3. Found issue in useHybridAudioEngine.ts
memory.save_code_context(
    file_path="src/hooks/useHybridAudioEngine.ts",
    context="Buffer size hardcoded to 16 frames",
    session_id=session_id
)

# 4. Make fix and record
memory.save_decision(
    decision="Increase buffer to 32 frames",
    rationale="16 frames insufficient at 48kHz",
    outcome="Fixed dropouts",
    session_id=session_id
)

# 5. Document learning
memory.save_learning(
    lesson="48kHz requires larger buffer than 44.1kHz",
    category="audio_buffer",
    outcome="success",
    session_id=session_id
)
```

### Scenario 2: Feature Development

```python
session_id = "feature_spatial_audio"

# 1. Start feature work
memory.save_session_memory(
    session_id=session_id,
    content="Implementing 8D spatial audio visualization",
    metadata={"feature": "spatial_audio"}
)

# 2. Search for similar features
enhanced = memory.enhance_rag_query("visualization patterns", session_id)
results = rag.query(enhanced)

# 3. Track design decisions
memory.save_decision(
    decision="Use Three.js for 3D visualization",
    rationale="Better performance than custom WebGL",
    session_id=session_id
)

# 4. Track implementation progress
memory.save_code_context(
    file_path="src/components/SpatialVisualizer.tsx",
    context="Implemented electromagnetic field visualization",
    session_id=session_id
)
```

### Scenario 3: Code Review

```python
session_id = "code_review_pr123"

# 1. Start review
memory.save_session_memory(
    session_id=session_id,
    content="Reviewing PR #123: Audio engine refactor",
    metadata={"pr": "123", "author": "teammate"}
)

# 2. Search for related issues
results = rag.query("audio engine previous bugs")

# 3. Record findings
memory.save_code_context(
    file_path="src/hooks/useBackendAudioEngine.ts",
    context="Missing error handling in WebSocket disconnect",
    session_id=session_id
)

# 4. Track review decision
memory.save_decision(
    decision="Request changes: Add WebSocket error handling",
    rationale="Previous bugs caused by unhandled disconnects",
    session_id=session_id
)
```

## Configuration for Examples

### Local (Default)
```bash
# No configuration needed!
# Examples work out of the box with ChromaDB and local Mem0
```

### Cloud (Optional)
```bash
# Create .env file
VECTOR_PROVIDER=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-key
MEM0_MODE=cloud
MEM0_API_KEY=your-key
```

### Hybrid
```bash
# Local vector, cloud memory
VECTOR_PROVIDER=chroma
MEM0_MODE=cloud
MEM0_API_KEY=your-key
```

## Troubleshooting

### "mem0ai not installed"
```bash
pip install mem0ai
```

### "supabase not installed"
```bash
pip install supabase
```

### "Configuration error: SUPABASE_URL required"
- Set `VECTOR_PROVIDER=chroma` to use local
- Or configure Supabase credentials

### "Table not found"
- Run Supabase setup SQL (see SETUP.md)
- Check table name matches config

## Next Steps

1. **Try the examples** - Run each one to understand features
2. **Read SETUP.md** - Comprehensive configuration guide
3. **Check integration report** - See `.claude/MEM0_INTEGRATION_REPORT.md`
4. **Build your own** - Use examples as templates

## Support

- **Setup issues:** See `.claude/rag/SETUP.md`
- **Configuration:** See `.env.example`
- **Architecture:** See `.claude/MEM0_INTEGRATION_REPORT.md`
- **Navigation:** See `.claude/INDEX.md`

## Tips

1. **Start local** - No setup needed, works immediately
2. **Try memory first** - Most useful for session tracking
3. **Add cloud later** - When you need team access
4. **Use hybrid system** - RAG + Memory together is powerful
5. **Track learnings** - Build knowledge base over time

Happy coding! 🚀
