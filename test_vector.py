# Create test_vector.py in your project root
import sys
sys.path.append(r'C:\Users\bisho\ideaprojects\ebl')

from backend.rag.vector_database import EBLRAGPipeline

# Initialize and index
rag = EBLRAGPipeline(project_root="C:/Users/bisho/ideaprojects/ebl")
rag.index_project(force_reindex=True)

# Test a search
results = rag.query("audio engine", n_results=3, search_type="hybrid")
for r in results['results']:
    print(f"Found: {r['metadata']['file_path']}")jects\ebl")