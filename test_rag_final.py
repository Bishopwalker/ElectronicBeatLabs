import sys
sys.path.append(r'C:\Users\bisho\ideaprojects\ebl')

from backend.rag.vector_database import CloudRAGPipeline, VectorProvider

# Initialize RAG with local ChromaDB
print("Initializing RAG pipeline...")
rag = CloudRAGPipeline(
    project_root="C:/Users/bisho/ideaprojects/ebl",
    provider=VectorProvider.CHROMA  # Local - no API key needed!
)

# Index your project (first time only)
print("\nIndexing project...")
rag.index_project(force_reindex=True)

# Test some searches
test_queries = [
    "audio engine frequency",
    "useAudioEngine hook", 
    "websocket connection"
]

print("\nTesting searches:")
for query in test_queries:
    results = rag.query(query, n_results=3)
    print(f"\nQuery: '{query}'")
    print(f"Found {len(results['results'])} results")
    for r in results['results'][:2]:
        print(f"  - {r['metadata']['file_path']}")
