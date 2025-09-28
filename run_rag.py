import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import from the backend RAG module
import backend.rag.chunking_strategy as cs

# Initialize
chunker = cs.EBLChunkingStrategy(project_root="C:/Users/bisho/ideaprojects/ebl")

# Chunk your entire project
chunks = chunker.chunk_project()

# Save to JSON
chunker.save_chunks("ebl_chunks.json")

# Find relevant chunks for a query
relevant = chunker.get_relevant_chunks("audio engine frequency", top_k=5)

print("EBL RAG System Successfully Set Up!")
print(f"Created {len(chunks)} chunks")
print(f"Found {len(relevant)} relevant chunks for 'audio engine frequency'")