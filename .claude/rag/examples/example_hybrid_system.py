"""
Example: Hybrid System (RAG + Memory)
Demonstrates how RAG and Memory work together for context-aware code search
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vector_database import CloudRAGPipeline, VectorProvider
from memory_service import MemoryService
from config import load_config


def main():
    """Demonstrate hybrid RAG + Memory system"""

    print("=" * 60)
    print("EBL Hybrid System Example (RAG + Memory)")
    print("=" * 60)

    # Load configuration
    print("\n1. Loading configuration...")
    config = load_config()
    print(f"   Vector Provider: {config.vector_provider}")
    print(f"   Memory Mode: {config.mem0_mode}")

    # Initialize RAG
    print("\n2. Initializing RAG system...")
    rag = CloudRAGPipeline(
        project_root="C:/Users/bisho/IdeaProjects/ebl",
        provider=VectorProvider.CHROMA,  # Using local for demo
    )

    # Check if indexing is needed
    stats = rag.vector_db.get_stats()
    if stats.get('total_documents', 0) == 0:
        print("   Indexing project (first time)...")
        rag.index_project()
        stats = rag.vector_db.get_stats()
    print(f"   ✓ RAG ready ({stats.get('total_documents')} chunks indexed)")

    # Initialize Memory
    print("\n3. Initializing Memory service...")
    memory = MemoryService(config.get_mem0_config())
    print(f"   ✓ Memory ready ({config.mem0_mode} mode)")

    # Simulate a coding session
    session_id = "hybrid_demo_session"

    print("\n" + "=" * 60)
    print("Scenario: Debugging Audio Buffer Issues")
    print("=" * 60)

    # Phase 1: Starting work
    print("\n--- Phase 1: Starting Work ---")
    print("Developer starts investigating audio buffer issues...")

    memory.save_session_memory(
        session_id=session_id,
        content="Investigating audio buffer starvation causing dropouts",
        metadata={"feature": "audio", "issue": "buffer_starvation"}
    )
    print("✓ Session context saved")

    # Basic RAG query
    print("\nBasic RAG query: 'buffer management'")
    results = rag.query("buffer management", n_results=3)
    print(f"Found {len(results['results'])} results:")
    for i, result in enumerate(results['results'][:2], 1):
        file_path = result['metadata'].get('file_path', 'Unknown')
        print(f"  {i}. {file_path}")

    # Phase 2: Found relevant file
    print("\n--- Phase 2: Found Relevant Code ---")
    print("Developer finds useHybridAudioEngine.ts...")

    memory.save_code_context(
        file_path="src/hooks/useHybridAudioEngine.ts",
        context="Found buffer management code, currently using 16 frame minimum",
        session_id=session_id
    )
    print("✓ Code context saved")

    # Enhanced RAG query with session context
    print("\nEnhanced RAG query with session context...")
    enhanced_query = memory.enhance_rag_query("buffer configuration", session_id)
    print(f"Enhanced: '{enhanced_query}'")

    enhanced_results = rag.query(enhanced_query, n_results=3)
    print(f"Found {len(enhanced_results['results'])} results (more relevant):")
    for i, result in enumerate(enhanced_results['results'][:2], 1):
        file_path = result['metadata'].get('file_path', 'Unknown')
        score = result['similarity_score']
        print(f"  {i}. {file_path} (score: {score:.3f})")

    # Phase 3: Making a change
    print("\n--- Phase 3: Implementing Fix ---")
    print("Developer increases buffer size to 32 frames...")

    memory.save_code_context(
        file_path="src/hooks/useHybridAudioEngine.ts",
        context="Increased minBufferFrames from 16 to 32, testing...",
        session_id=session_id
    )

    memory.save_decision(
        decision="Increase minimum buffer size from 16 to 32 frames",
        rationale="16 frames insufficient for network jitter, causing underruns",
        session_id=session_id
    )
    print("✓ Decision recorded")

    # Phase 4: Testing and learning
    print("\n--- Phase 4: Testing & Learning ---")
    print("Testing the fix...")

    # Search for related decisions from the past
    print("\nSearching for past decisions about buffer sizing...")
    past_decisions = memory.search_decisions("buffer size", limit=3)
    print(f"Found {len(past_decisions)} related decisions:")
    for i, decision in enumerate(past_decisions, 1):
        if isinstance(decision, dict):
            metadata = decision.get('metadata', {})
            print(f"  {i}. {metadata.get('decision', 'N/A')[:80]}...")

    # Record successful outcome
    print("\nTest successful! Recording learning...")
    memory.save_learning(
        lesson="32 frame buffer eliminates dropouts without increasing latency noticeably",
        category="audio_buffer",
        outcome="success",
        session_id=session_id
    )

    # Update decision with outcome
    memory.save_decision(
        decision="Increase minimum buffer size from 16 to 32 frames",
        rationale="16 frames insufficient for network jitter",
        outcome="✓ Successfully eliminated dropouts, no perceivable latency increase",
        session_id=session_id
    )
    print("✓ Learning saved")

    # Phase 5: Finding related issues
    print("\n--- Phase 5: Finding Related Code ---")
    print("Searching for other buffer-related code that might need updating...")

    # Use memory to refine search
    query = "audio buffer configuration"
    enhanced = memory.enhance_rag_query(query, session_id)

    results = rag.query(enhanced, n_results=5)
    print(f"\nFound {len(results['results'])} potentially related files:")

    related_files = set()
    for result in results['results']:
        file_path = result['metadata'].get('file_path', '')
        if file_path and 'audio' in file_path.lower():
            related_files.add(file_path)

    for i, file_path in enumerate(related_files, 1):
        print(f"  {i}. {file_path}")
        # Save context for future reference
        memory.save_code_context(
            file_path=file_path,
            context="Related to buffer management, may need review",
            session_id=session_id
        )

    print("✓ Related files tracked in memory")

    # Summary of hybrid benefits
    print("\n" + "=" * 60)
    print("Hybrid System Benefits")
    print("=" * 60)

    # Show session summary
    print("\nSession Summary:")
    session_memories = memory.get_session_memory(session_id, limit=10)
    print(f"- {len(session_memories)} memories recorded")

    # Show learnings
    learnings = memory.get_learnings(category="audio_buffer", outcome="success")
    print(f"- {len(learnings)} successful learnings")

    # Compare queries
    print("\nQuery Enhancement Comparison:")
    print("  Without context: 'buffer management'")
    print(f"  With context: '{enhanced[:80]}...'")
    print("\n  → Context makes searches more relevant to current work!")

    # Architecture explanation
    print("\n" + "=" * 60)
    print("How RAG + Memory Work Together")
    print("=" * 60)
    print("""
RAG (Code Search):
- Indexes entire codebase
- Semantic search using embeddings
- Finds relevant code snippets
- Fast, scalable searching

Memory (Session Context):
- Tracks what you're working on
- Remembers recent files and changes
- Records decisions and learnings
- Enhances queries with context

Together:
1. Memory knows you're working on audio buffers
2. RAG searches the codebase
3. Memory enhances the query with session context
4. Results are more relevant to your current task
5. Learnings accumulate for future reference

Benefits:
- More relevant search results
- Session continuity across conversations
- Decision tracking and rationale
- Learning from past successes/failures
- Context-aware code discovery
    """)

    # Practical use cases
    print("=" * 60)
    print("Practical Use Cases")
    print("=" * 60)
    print("""
1. Bug Investigation:
   - Memory: Track investigation progress
   - RAG: Find similar bugs in history
   - Together: Context-aware bug search

2. Feature Development:
   - Memory: Track design decisions
   - RAG: Find related code patterns
   - Together: Consistent implementation

3. Code Review:
   - Memory: Track review findings
   - RAG: Find related issues
   - Together: Comprehensive review

4. Onboarding:
   - Memory: Track learning progress
   - RAG: Discover codebase structure
   - Together: Guided learning path

5. Refactoring:
   - Memory: Track changes made
   - RAG: Find all affected code
   - Together: Complete refactoring
    """)

    print("Example complete!")
    print("\nNext steps:")
    print("1. Try running this in your own coding sessions")
    print("2. Integrate with your IDE or workflow")
    print("3. Build custom queries for your specific needs")
    print("4. See SETUP.md for configuration options")


if __name__ == "__main__":
    main()
