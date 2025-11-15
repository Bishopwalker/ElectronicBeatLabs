# EBL RAG System Setup Guide

Complete setup instructions for the EBL RAG system with Mem0 and Supabase integration.

## Quick Start (Local Setup - No Cloud Required)

The system works out of the box with ChromaDB and local Mem0. No cloud setup needed!

```bash
# 1. Install dependencies
cd .claude/rag
pip install -r rag_requirements.txt

# 2. Create .env file (optional, uses defaults)
# No configuration needed for local setup!

# 3. Run example
python vector_database.py
```

**That's it!** The system will use:
- ChromaDB (local vector storage)
- Local Mem0 (no API key needed)

## Configuration Options

### Environment Variables

Create a `.env` file in your project root or set these environment variables:

```bash
# Vector Storage (default: chroma)
VECTOR_PROVIDER=chroma              # Options: "chroma" or "supabase"
CHROMA_PERSIST_DIR=./.claude/rag/chroma_db

# Supabase (optional - only if VECTOR_PROVIDER=supabase)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_TABLE=ebl_code_chunks

# Mem0 (optional - defaults to local)
MEM0_MODE=local                     # Options: "local" or "cloud"
MEM0_API_KEY=your-mem0-api-key     # Only for cloud mode
MEM0_ORGANIZATION_ID=your-org-id    # Optional
MEM0_PROJECT_ID=your-project-id     # Optional

# Model (optional)
EMBEDDING_MODEL=all-MiniLM-L6-v2    # Default sentence transformer
```

### Configuration Validation

Test your configuration:

```python
from .claude.rag import load_config, print_config_summary

# Load and validate configuration
config = load_config()

# Print summary
print_config_summary(config)
```

## Local Setup (ChromaDB + Local Mem0)

### Advantages
- No cloud accounts required
- Zero cost
- Fast (no network latency)
- Privacy (all data stays local)

### Setup Steps

1. **Install dependencies:**
   ```bash
   pip install -r rag_requirements.txt
   ```

2. **No configuration needed!** ChromaDB and local Mem0 work automatically.

3. **Optional: Create .env for custom paths:**
   ```bash
   VECTOR_PROVIDER=chroma
   CHROMA_PERSIST_DIR=./custom/path/chroma_db
   MEM0_MODE=local
   ```

4. **Test it:**
   ```python
   from .claude.rag import CloudRAGPipeline, VectorProvider, MemoryService, load_config

   # Initialize RAG
   rag = CloudRAGPipeline(
       project_root="C:/Users/bisho/IdeaProjects/ebl",
       provider=VectorProvider.CHROMA
   )
   rag.index_project()

   # Initialize Memory
   config = load_config()
   memory = MemoryService(config.get_mem0_config())

   # Test
   results = rag.query("audio engine")
   print(f"Found {len(results['results'])} results")
   ```

## Cloud Setup (Supabase + Cloud Mem0)

### Advantages
- Accessible from anywhere
- Scales automatically
- Team collaboration
- Persistent across machines

### Supabase Setup

#### Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Create a new project
4. Note your project URL and API key

#### Step 2: Enable pgvector Extension

1. Go to your project dashboard
2. Navigate to: **Database → Extensions**
3. Search for `vector` and enable `pgvector`

#### Step 3: Create Vector Table

Run this SQL in the Supabase SQL Editor:

```sql
-- Create the code chunks table
CREATE TABLE ebl_code_chunks (
    id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(384),  -- all-MiniLM-L6-v2 produces 384-dim vectors
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for fast vector search
CREATE INDEX ON ebl_code_chunks USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create RPC function for vector search
CREATE OR REPLACE FUNCTION match_code_chunks(
    query_embedding vector(384),
    match_count INT DEFAULT 5,
    filter JSONB DEFAULT '{}'::jsonb
)
RETURNS TABLE (
    id TEXT,
    content TEXT,
    metadata JSONB,
    distance FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ebl_code_chunks.id,
        ebl_code_chunks.content,
        ebl_code_chunks.metadata,
        1 - (ebl_code_chunks.embedding <=> query_embedding) AS distance
    FROM ebl_code_chunks
    WHERE (filter = '{}'::jsonb) OR (ebl_code_chunks.metadata @> filter)
    ORDER BY ebl_code_chunks.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
```

#### Step 4: Configure Environment

Create `.env` file:

```bash
VECTOR_PROVIDER=supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_TABLE=ebl_code_chunks
```

#### Step 5: Test Supabase Connection

```python
from .claude.rag import CloudRAGPipeline, VectorProvider, load_config

# Load config (will validate Supabase credentials)
config = load_config()

# Initialize RAG with Supabase
rag = CloudRAGPipeline(
    project_root="C:/Users/bisho/IdeaProjects/ebl",
    provider=VectorProvider.SUPABASE,
    **config.get_vector_config()
)

# Index project
rag.index_project()

# Test search
results = rag.query("audio buffer management")
print(f"Supabase search found {len(results['results'])} results")
```

### Mem0 Cloud Setup

#### Step 1: Get Mem0 API Key

1. Go to [https://mem0.ai](https://mem0.ai)
2. Sign up for an account
3. Create a new project
4. Generate an API key
5. Note your Organization ID and Project ID

#### Step 2: Configure Environment

Add to `.env`:

```bash
MEM0_MODE=cloud
MEM0_API_KEY=your-mem0-api-key
MEM0_ORGANIZATION_ID=your-org-id
MEM0_PROJECT_ID=your-project-id
```

#### Step 3: Test Mem0 Connection

```python
from .claude.rag import MemoryService, load_config

# Load config
config = load_config()

# Initialize memory service
memory = MemoryService(config.get_mem0_config())

# Test memory
session_id = "test_session"
memory.save_session_memory(
    session_id=session_id,
    content="Testing Mem0 cloud integration",
    metadata={"test": True}
)

# Retrieve
memories = memory.get_session_memory(session_id)
print(f"Retrieved {len(memories)} memories")
```

## Usage Examples

### Basic RAG Query

```python
from .claude.rag import CloudRAGPipeline, VectorProvider

rag = CloudRAGPipeline(
    project_root="C:/Users/bisho/IdeaProjects/ebl",
    provider=VectorProvider.CHROMA  # or VectorProvider.SUPABASE
)

# Index project (only needed once or when code changes)
rag.index_project()

# Search
results = rag.query("audio engine buffer management", n_results=5)

for result in results['results']:
    print(f"\n{result['metadata']['file_path']} (lines {result['metadata']['start_line']}-{result['metadata']['end_line']})")
    print(f"Score: {result['similarity_score']:.3f}")
    print(result['content'][:200])
```

### Using Memory Service

```python
from .claude.rag import MemoryService, load_config

config = load_config()
memory = MemoryService(config.get_mem0_config())

session_id = "my_session"

# Save session context
memory.save_session_memory(
    session_id=session_id,
    content="Working on fixing audio buffer starvation bug",
    metadata={"feature": "audio", "bug_id": "123"}
)

# Save code context
memory.save_code_context(
    file_path="src/hooks/useHybridAudioEngine.ts",
    context="Increased buffer size from 16 to 32 frames",
    session_id=session_id
)

# Record decision
memory.save_decision(
    decision="Use AudioWorklet instead of ScriptProcessorNode",
    rationale="Better performance, non-blocking",
    outcome="Successfully eliminated glitches",
    session_id=session_id
)

# Search memories
results = memory.search_memory("audio buffer")
for result in results:
    print(f"- {result['content']}")

# Get recent session context
recent = memory.get_session_memory(session_id, limit=5)
for mem in recent:
    print(f"[{mem['metadata']['timestamp']}] {mem['content']}")
```

### Hybrid System (RAG + Memory)

```python
from .claude.rag import CloudRAGPipeline, MemoryService, load_config, VectorProvider

# Initialize
config = load_config()
rag = CloudRAGPipeline(
    project_root="C:/Users/bisho/IdeaProjects/ebl",
    provider=VectorProvider.CHROMA
)
memory = MemoryService(config.get_mem0_config())

session_id = "current_session"

# User is working on a feature
memory.save_session_memory(
    session_id=session_id,
    content="Optimizing audio engine performance",
    metadata={"feature": "audio_optimization"}
)

# Enhance RAG query with session context
query = "buffer management"
enhanced_query = memory.enhance_rag_query(query, session_id)

# Search with enhanced context
results = rag.query(enhanced_query)

# Process results and save learnings
if results['results']:
    memory.save_learning(
        lesson="Found relevant buffer management code in useHybridAudioEngine",
        category="audio",
        outcome="success",
        session_id=session_id
    )
```

## Switching Between Providers

You can switch between ChromaDB and Supabase by changing the environment variable:

```bash
# Use local ChromaDB
VECTOR_PROVIDER=chroma

# Use cloud Supabase
VECTOR_PROVIDER=supabase
```

Both use the same API, so your code doesn't change:

```python
from .claude.rag import CloudRAGPipeline, load_config

config = load_config()

# Automatically uses the configured provider
rag = CloudRAGPipeline(
    project_root="C:/Users/bisho/IdeaProjects/ebl",
    provider=config.vector_provider,  # chroma or supabase
    **config.get_vector_config()
)
```

## Troubleshooting

### ChromaDB Issues

**Error: "Can't create directory"**
- Check `CHROMA_PERSIST_DIR` path exists and is writable
- Use absolute paths: `C:/Users/bisho/IdeaProjects/ebl/.claude/rag/chroma_db`

**Error: "Collection already exists"**
- This is normal, ChromaDB reuses existing collections
- To start fresh, delete the `chroma_db` directory

### Supabase Issues

**Error: "Table not found"**
- Run the SQL setup script in Supabase SQL Editor (Step 3 above)
- Check table name matches `SUPABASE_TABLE` in .env

**Error: "pgvector not enabled"**
- Enable the `vector` extension in Supabase (Step 2 above)
- Database → Extensions → Search "vector" → Enable

**Error: "Invalid API key"**
- Check `SUPABASE_URL` and `SUPABASE_KEY` are correct
- Use the "anon" public key, not the service role key (for security)

**Error: "RPC function not found"**
- Run the `CREATE FUNCTION match_code_chunks` SQL (Step 3 above)
- Check function name is exactly `match_code_chunks`

### Mem0 Issues

**Error: "mem0ai not installed"**
```bash
pip install mem0ai
```

**Error: "Invalid API key" (cloud mode)**
- Check `MEM0_API_KEY` in .env
- Verify key is active at mem0.ai dashboard

**Local Mem0 not working:**
- Set `MEM0_MODE=local` explicitly
- Ensure no `MEM0_API_KEY` is set (it auto-detects cloud mode)

### Configuration Issues

**Error: "SUPABASE_URL required"**
- Set `VECTOR_PROVIDER=chroma` to use local storage
- Or add Supabase credentials to .env

**Error: "Invalid VECTOR_PROVIDER"**
- Must be "chroma" or "supabase" (lowercase)
- Check .env file for typos

## Performance Tips

### ChromaDB
- Use SSD for persistence directory
- Index once, query many times
- Batch operations for large imports

### Supabase
- Use appropriate index parameters (lists = 100 for <100k vectors)
- Consider upgrading Supabase plan for better performance
- Use connection pooling for high-traffic applications

### Mem0
- Batch similar operations when possible
- Use session IDs consistently for better context
- Filter searches to reduce latency

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use anon keys** for Supabase in client applications
3. **Rotate API keys** periodically
4. **Limit Supabase RLS** (Row Level Security) policies
5. **Use environment-specific credentials** (dev, staging, prod)

## Migration Guide

### From ChromaDB to Supabase

```python
from .claude.rag import CloudRAGPipeline, VectorProvider

# Export from ChromaDB
chroma_rag = CloudRAGPipeline(
    project_root="C:/Users/bisho/IdeaProjects/ebl",
    provider=VectorProvider.CHROMA
)

# Index to Supabase
supabase_rag = CloudRAGPipeline(
    project_root="C:/Users/bisho/IdeaProjects/ebl",
    provider=VectorProvider.SUPABASE,
    supabase_url=os.getenv("SUPABASE_URL"),
    supabase_key=os.getenv("SUPABASE_KEY")
)

# Re-index (this will populate Supabase)
supabase_rag.index_project(force_reindex=True)

print("Migration complete!")
```

## Next Steps

- See `examples/` directory for more usage examples
- Read `.claude/MEM0_INTEGRATION_REPORT.md` for architecture details
- Check `.claude/INDEX.md` for navigation to other RAG components

## Support

For issues or questions:
1. Check this SETUP.md guide
2. Review example scripts in `examples/`
3. Check Supabase/Mem0 documentation
4. Open an issue in the project repository
