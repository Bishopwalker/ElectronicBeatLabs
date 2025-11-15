"""
Example: Supabase Vector Storage Setup
Demonstrates how to set up and use Supabase as a cloud vector database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from vector_database import CloudRAGPipeline, VectorProvider
from config import load_config, print_config_summary


def main():
    """Demonstrate Supabase vector storage"""

    print("=" * 60)
    print("EBL Supabase Vector Storage Example")
    print("=" * 60)

    # Load configuration
    print("\n1. Loading configuration...")
    try:
        config = load_config()
        print_config_summary(config)
    except ValueError as e:
        print(f"\n✗ Configuration error: {e}")
        print("\nTo use Supabase, ensure your .env file has:")
        print("  VECTOR_PROVIDER=supabase")
        print("  SUPABASE_URL=https://xxxxx.supabase.co")
        print("  SUPABASE_KEY=your-supabase-anon-key")
        print("\nSee SETUP.md for detailed instructions.")
        return

    # Check if using Supabase
    if config.vector_provider != "supabase":
        print(f"\n⚠ Configuration is set to use '{config.vector_provider}'")
        print("   To use this example, set VECTOR_PROVIDER=supabase in .env")
        print("   Or change the example code to use ChromaDB")
        return

    # Initialize RAG with Supabase
    print("\n2. Initializing RAG with Supabase...")
    try:
        rag = CloudRAGPipeline(
            project_root="C:/Users/bisho/IdeaProjects/ebl",
            provider=VectorProvider.SUPABASE,
            **config.get_vector_config()
        )
        print("   ✓ Supabase connection established")
    except Exception as e:
        print(f"   ✗ Failed to connect to Supabase: {e}")
        print("\n   Make sure you've:")
        print("   1. Created a Supabase project")
        print("   2. Enabled the pgvector extension")
        print("   3. Run the table creation SQL (see SETUP.md)")
        return

    # Check database stats
    print("\n3. Checking database status...")
    stats = rag.vector_db.get_stats()
    print(f"   Provider: {stats.get('provider')}")
    print(f"   Table: {stats.get('table')}")
    print(f"   Total documents: {stats.get('total_documents')}")

    # Index project (if needed)
    if stats.get('total_documents', 0) == 0:
        print("\n4. Indexing project (first time setup)...")
        print("   This may take a few minutes...")
        try:
            rag.index_project(force_reindex=True)
            stats = rag.vector_db.get_stats()
            print(f"   ✓ Indexed {stats.get('total_documents')} code chunks")
        except Exception as e:
            print(f"   ✗ Indexing failed: {e}")
            return
    else:
        print("\n4. Database already indexed")
        print(f"   ({stats.get('total_documents')} chunks available)")

    # Example queries
    print("\n" + "=" * 60)
    print("Example Queries")
    print("=" * 60)

    queries = [
        "audio engine buffer management",
        "WebSocket connection handling",
        "frequency visualization",
        "binaural beat generation",
        "React hooks for audio"
    ]

    for i, query in enumerate(queries, 1):
        print(f"\n{i}. Query: '{query}'")
        try:
            results = rag.query(query, n_results=3)
            print(f"   Found {len(results['results'])} results:")

            for j, result in enumerate(results['results'], 1):
                metadata = result['metadata']
                file_path = metadata.get('file_path', 'Unknown')
                chunk_type = metadata.get('chunk_type', 'unknown')
                score = result['similarity_score']

                print(f"\n   {j}. {file_path} ({chunk_type})")
                print(f"      Similarity: {score:.3f}")
                print(f"      Lines: {metadata.get('start_line')}-{metadata.get('end_line')}")
                print(f"      Preview: {result['content'][:100]}...")

        except Exception as e:
            print(f"   ✗ Query failed: {e}")

    # Test metadata filtering
    print("\n" + "=" * 60)
    print("Metadata Filtering")
    print("=" * 60)

    print("\nSearching for audio-related hooks...")
    try:
        results = rag.query(
            "audio processing",
            n_results=5
        )

        hook_results = [
            r for r in results['results']
            if 'hook' in r['metadata'].get('chunk_type', '').lower()
            or 'use' in r['metadata'].get('file_path', '').lower()
        ]

        print(f"Found {len(hook_results)} hook-related results:")
        for i, result in enumerate(hook_results, 1):
            file_path = result['metadata'].get('file_path', 'Unknown')
            print(f"  {i}. {file_path}")

    except Exception as e:
        print(f"✗ Filtering failed: {e}")

    # Performance comparison
    print("\n" + "=" * 60)
    print("Performance Test")
    print("=" * 60)

    import time

    print("\nRunning 10 queries to measure performance...")
    test_query = "audio buffer management"
    times = []

    for i in range(10):
        start = time.time()
        try:
            results = rag.query(test_query, n_results=5)
            elapsed = time.time() - start
            times.append(elapsed)
        except Exception as e:
            print(f"Query {i+1} failed: {e}")
            break

    if times:
        avg_time = sum(times) / len(times)
        min_time = min(times)
        max_time = max(times)

        print(f"\nResults:")
        print(f"  Average: {avg_time*1000:.1f}ms")
        print(f"  Min: {min_time*1000:.1f}ms")
        print(f"  Max: {max_time*1000:.1f}ms")

        if avg_time < 0.5:
            print("  ✓ Excellent performance!")
        elif avg_time < 1.0:
            print("  ✓ Good performance")
        else:
            print("  ⚠ Consider optimizing indexes or upgrading Supabase plan")

    # Summary
    print("\n" + "=" * 60)
    print("Summary")
    print("=" * 60)
    print(f"""
Supabase Vector Storage Status:
- Provider: {stats.get('provider')}
- Table: {stats.get('table')}
- Documents: {stats.get('total_documents')}
- Connection: ✓ Working

Advantages of Supabase:
- Cloud-hosted (access from anywhere)
- Auto-scaling
- Built-in PostgreSQL features (JSONB, full-text search, etc.)
- Team collaboration
- Persistent across machines

Next Steps:
1. Use rag.query() to search your codebase
2. Integrate with Memory Service for context
3. Set up automatic re-indexing on code changes
4. Configure Row Level Security for team access

See SETUP.md for more configuration options!
    """)

    print("Example complete!")


if __name__ == "__main__":
    main()
