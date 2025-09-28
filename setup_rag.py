#!/usr/bin/env python3
"""
EBL RAG Setup Script
Convenient script to set up and use the RAG chunking system
"""

from backend.rag.chunking_strategy import EBLChunkingStrategy

def main():
    print("=" * 50)
    print("EBL RAG Chunking System Setup")
    print("=" * 50)

    # Initialize
    print("1. Initializing chunking strategy...")
    chunker = EBLChunkingStrategy(project_root="C:/Users/bisho/ideaprojects/ebl")

    # Chunk your entire project
    print("2. Chunking entire EBL project...")
    chunks = chunker.chunk_project()
    print(f"   Created {len(chunks)} chunks")

    # Save to JSON
    print("3. Saving chunks to ebl_chunks.json...")
    chunker.save_chunks("ebl_chunks.json")
    print("   Chunks saved successfully!")

    # Show some statistics
    chunk_types = {}
    audio_chunks = 0
    priority_chunks = 0

    for chunk in chunks:
        chunk_type = chunk.chunk_type
        chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1

        if chunk.metadata.get('has_audio_terms'):
            audio_chunks += 1

        if chunk.metadata.get('priority', 0) >= 1.0:
            priority_chunks += 1

    print("\n" + "=" * 50)
    print("CHUNKING STATISTICS")
    print("=" * 50)
    print(f"Total chunks: {len(chunks)}")
    print(f"Audio-related chunks: {audio_chunks}")
    print(f"High priority chunks: {priority_chunks}")
    print("\nChunk types:")
    for chunk_type, count in sorted(chunk_types.items()):
        print(f"  {chunk_type}: {count}")

    # Test relevance search
    print("\n" + "=" * 50)
    print("TESTING RELEVANCE SEARCH")
    print("=" * 50)

    test_queries = [
        "audio engine frequency",
        "binaural beat generator",
        "WebSocket connection",
        "React component hook",
        "backend API route"
    ]

    for query in test_queries:
        print(f"\nQuery: '{query}'")
        relevant = chunker.get_relevant_chunks(query, top_k=3)

        if relevant:
            for i, chunk in enumerate(relevant, 1):
                print(f"  {i}. {chunk.file_path} ({chunk.chunk_type})")
                if chunk.metadata.get('class_name'):
                    print(f"     Class: {chunk.metadata['class_name']}")
                elif chunk.metadata.get('function_name'):
                    print(f"     Function: {chunk.metadata['function_name']}")
        else:
            print("  No relevant chunks found")

    print("\n" + "=" * 50)
    print("RAG SYSTEM READY!")
    print("=" * 50)
    print("Usage:")
    print("  from backend.rag.chunking_strategy import EBLChunkingStrategy")
    print("  chunker = EBLChunkingStrategy(project_root='C:/Users/bisho/ideaprojects/ebl')")
    print("  chunks = chunker.chunk_project()")
    print("  chunker.save_chunks('ebl_chunks.json')")
    print("  relevant = chunker.get_relevant_chunks('your query', top_k=5)")

if __name__ == "__main__":
    main()