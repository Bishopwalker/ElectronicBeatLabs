import sys
sys.path.append(r"C:\Users\bisho\ideaprojects\ebl")

print("Checking RAG setup...")

# Test chunking strategy
try:
    from backend.rag.chunking_strategy import EBLChunkingStrategy
    print("✅ Chunking strategy found!")
except ImportError as e:
    print(f"❌ Chunking strategy error: {e}")

# Test vector database
try:
    from backend.rag.vector_database import EBLRAGPipeline
    print("✅ EBLRAGPipeline found!")
except ImportError as e:
    print("❌ EBLRAGPipeline NOT found - need to save vector_database.py")
    print("   You need to copy the vector database code from the artifact!")
