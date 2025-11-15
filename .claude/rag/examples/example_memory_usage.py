"""
Example: Memory Service Usage
Demonstrates how to use the Mem0-powered memory system for session tracking
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from memory_service import MemoryService
from config import load_config


def main():
    """Demonstrate memory service features"""

    print("=" * 60)
    print("EBL Memory Service Example")
    print("=" * 60)

    # Load configuration
    print("\n1. Loading configuration...")
    config = load_config()
    print(f"   Using Mem0 in {config.mem0_mode} mode")

    # Initialize memory service
    print("\n2. Initializing memory service...")
    memory = MemoryService(config.get_mem0_config())
    print("   ✓ Memory service ready")

    session_id = "example_session_001"

    # Example 1: Save session memory
    print("\n" + "=" * 60)
    print("Example 1: Session Memory")
    print("=" * 60)

    print("\nSaving session context...")
    memory.save_session_memory(
        session_id=session_id,
        content="Working on fixing audio buffer starvation bug in useHybridAudioEngine",
        metadata={
            "feature": "audio_engine",
            "bug_id": "EBL-123",
            "priority": "high"
        }
    )
    print("✓ Session memory saved")

    memory.save_session_memory(
        session_id=session_id,
        content="Identified issue: buffer size too small (16 frames) causing underruns",
        metadata={
            "feature": "audio_engine",
            "finding": "root_cause"
        }
    )
    print("✓ Additional context saved")

    # Retrieve session memory
    print("\nRetrieving session memories...")
    memories = memory.get_session_memory(session_id, limit=5)
    print(f"Found {len(memories)} memories:")
    for i, mem in enumerate(memories, 1):
        if isinstance(mem, dict):
            print(f"\n  {i}. {mem.get('content', 'N/A')}")
            metadata = mem.get('metadata', {})
            if metadata:
                print(f"     Metadata: {metadata}")

    # Example 2: Code context tracking
    print("\n" + "=" * 60)
    print("Example 2: Code Context Tracking")
    print("=" * 60)

    print("\nSaving code context...")
    memory.save_code_context(
        file_path="src/hooks/useHybridAudioEngine.ts",
        context="Increased minBufferFrames from 16 to 32 to prevent audio dropouts",
        session_id=session_id
    )
    print("✓ Code context saved for useHybridAudioEngine.ts")

    memory.save_code_context(
        file_path="src/hooks/useBackendAudioEngine.ts",
        context="Added buffer monitoring and logging for debugging",
        session_id=session_id
    )
    print("✓ Code context saved for useBackendAudioEngine.ts")

    # Retrieve code context
    print("\nRetrieving code context for useHybridAudioEngine.ts...")
    contexts = memory.get_code_context("src/hooks/useHybridAudioEngine.ts", limit=5)
    print(f"Found {len(contexts)} context entries:")
    for i, ctx in enumerate(contexts, 1):
        if isinstance(ctx, dict):
            print(f"  {i}. {ctx.get('content', 'N/A')}")

    # Example 3: Decision recording
    print("\n" + "=" * 60)
    print("Example 3: Architectural Decisions")
    print("=" * 60)

    print("\nRecording design decision...")
    memory.save_decision(
        decision="Use AudioWorklet instead of ScriptProcessorNode for audio processing",
        rationale="AudioWorklet runs on separate thread, prevents blocking main thread, better performance",
        outcome="Successfully eliminated audio glitches and improved responsiveness",
        session_id=session_id
    )
    print("✓ Decision recorded")

    memory.save_decision(
        decision="Implement ring buffer with 16-90 frame capacity",
        rationale="Provides elasticity for network jitter while maintaining low latency",
        outcome="Stable playback even with variable WebSocket timing",
        session_id=session_id
    )
    print("✓ Decision recorded")

    # Search decisions
    print("\nSearching for decisions about audio...")
    decisions = memory.search_decisions("audio performance", limit=3)
    print(f"Found {len(decisions)} relevant decisions:")
    for i, decision in enumerate(decisions, 1):
        if isinstance(decision, dict):
            metadata = decision.get('metadata', {})
            print(f"\n  {i}. Decision: {metadata.get('decision', 'N/A')}")
            print(f"     Rationale: {metadata.get('rationale', 'N/A')}")
            print(f"     Outcome: {metadata.get('outcome', 'N/A')}")

    # Example 4: Learning from experience
    print("\n" + "=" * 60)
    print("Example 4: Learning Tracking")
    print("=" * 60)

    print("\nRecording successful learning...")
    memory.save_learning(
        lesson="Increasing buffer size to 32 frames completely eliminates audio dropouts",
        category="audio_performance",
        outcome="success",
        session_id=session_id
    )
    print("✓ Success recorded")

    print("\nRecording failed approach...")
    memory.save_learning(
        lesson="Tried reducing sample rate to 44.1kHz - caused quality degradation without fixing dropouts",
        category="audio_performance",
        outcome="failure",
        session_id=session_id
    )
    print("✓ Failure recorded (for future reference)")

    # Retrieve learnings
    print("\nRetrieving successful learnings in audio category...")
    successes = memory.get_learnings(category="audio_performance", outcome="success", limit=5)
    print(f"Found {len(successes)} successful approaches:")
    for i, learning in enumerate(successes, 1):
        if isinstance(learning, dict):
            print(f"  {i}. ✓ {learning.get('content', 'N/A')}")

    # Example 5: Memory search
    print("\n" + "=" * 60)
    print("Example 5: Semantic Memory Search")
    print("=" * 60)

    print("\nSearching all memories for 'buffer'...")
    results = memory.search_memory("buffer management", limit=5)
    print(f"Found {len(results)} relevant memories:")
    for i, result in enumerate(results, 1):
        if isinstance(result, dict):
            print(f"\n  {i}. {result.get('content', 'N/A')[:150]}...")

    # Example 6: RAG query enhancement
    print("\n" + "=" * 60)
    print("Example 6: Enhancing RAG Queries")
    print("=" * 60)

    original_query = "buffer management"
    print(f"\nOriginal query: '{original_query}'")

    enhanced_query = memory.enhance_rag_query(original_query, session_id)
    print(f"Enhanced query: '{enhanced_query}'")
    print("\nEnhancement adds session context to make RAG searches more relevant!")

    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print("""
The Memory Service provides:
1. Session Context - Track what you're working on
2. Code Context - Remember file changes and modifications
3. Decision History - Record architectural choices and rationale
4. Learning Tracking - Remember what worked and what didn't
5. Semantic Search - Find relevant memories across sessions
6. RAG Enhancement - Improve code search with session context

Memory complements RAG:
- RAG = Find relevant code (code search)
- Memory = Remember what you're doing (session context)
- Together = More relevant, context-aware results
    """)

    print("Example complete!")


if __name__ == "__main__":
    main()
