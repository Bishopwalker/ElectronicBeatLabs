import sys
sys.path.append(r'C:\Users\bisho\ideaprojects\ebl')
print('Testing EBL Chunking Strategy...')

try:
    from backend.rag.chunking_strategy import EBLChunkingStrategy
    print('Successfully imported chunking strategy')
    
    chunker = EBLChunkingStrategy(r'C:\Users\bisho\ideaprojects\ebl')
    print('Initialized chunker')
    
    chunks = chunker.chunk_project()
    print(f'Created {len(chunks)} chunks')
    
    if len(chunks) > 0:
        print('Sample chunks:')
        for chunk in chunks[:3]:
            print(f'  - {chunk.file_path} ({chunk.chunk_type})')
    
    chunker.save_chunks('backend/rag/ebl_chunks.json')
    print('Saved chunks to ebl_chunks.json')
    
except Exception as e:
    print(f'Error: {e}')
    import traceback
    traceback.print_exc()
