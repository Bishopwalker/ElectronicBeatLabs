#!/usr/bin/env python3
"""
EBL RAG Setup Script
Convenient script to set up and use the RAG chunking system
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)) + "/../../..")

from .claude.rag.chunking_strategy import EBLChunkingStrategy

def main():

    # Initialize
    chunker = EBLChunkingStrategy(project_root="C:/Users/bisho/ideaprojects/ebl")

    # Chunk your entire project
    chunks = chunker.chunk_project()

    # Save to JSON
    chunker.save_chunks(".claude/rag/data/ebl_chunks.json")

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
        print(f"{chunk_type}: {count}")

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
        print(f"\nQuery: '{query}'")
        if relevant:
            for i, chunk in enumerate(relevant, 1):
                if chunk.metadata.get('class_name'):
                    print(f"  {i}. Class {chunk.metadata['class_name']} in {chunk.file_path}")
                elif chunk.metadata.get('function_name'):
                    print(f"  {i}. Function {chunk.metadata['function_name']} in {chunk.file_path}")
        else:
            print("  No relevant chunks found")

if __name__ == "__main__":
    main()
