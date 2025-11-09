#!/usr/bin/env python3
"""
EBL RAG Setup Script
Convenient script to set up and use the RAG chunking system
"""

from backend.rag.chunking_strategy import EBLChunkingStrategy

def main():

    # Initialize
    chunker = EBLChunkingStrategy(project_root="C:/Users/bisho/ideaprojects/ebl")

    # Chunk your entire project
    chunks = chunker.chunk_project()

    # Save to JSON
    chunker.save_chunks("ebl_chunks.json")

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

    for chunk_type, count in sorted(chunk_types.items()):

    # Test relevance search

    test_queries = [
        "audio engine frequency",
        "binaural beat generator",
        "WebSocket connection",
        "React component hook",
        "backend API route"
    ]

    for query in test_queries:
        relevant = chunker.get_relevant_chunks(query, top_k=3)

        if relevant:
            for i, chunk in enumerate(relevant, 1):
                if chunk.metadata.get('class_name'):
                elif chunk.metadata.get('function_name'):
        else:

if __name__ == "__main__":
    main()