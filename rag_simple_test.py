"""
Simple RAG test to identify fine-tuning opportunities for EBL project
"""

import os
import json
from pathlib import Path
from typing import List, Dict, Any
from dataclasses import dataclass

# Simple chunk representation
@dataclass
class SimpleChunk:
    id: str
    file_path: str
    content: str
    chunk_type: str
    metadata: Dict[str, Any]

def analyze_rag_performance():
    """
    Analyze current RAG system performance and identify fine-tuning opportunities
    """
    print("=== RAG FINE-TUNING ANALYSIS ===")

    # Check if chunks file exists
    chunks_file = Path("backend/rag/ebl_chunks.json")
    if chunks_file.exists():
        print(f"Found chunks file: {chunks_file}")

        # Load and analyze chunks
        with open(chunks_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        chunks_data = data.get('chunks', [])
        print(f"Total chunks: {len(chunks_data)} (from file: {data.get('total_chunks', 'unknown')})")

        # Analyze chunk distribution
        chunk_types = {}
        audio_chunks = 0
        priority_chunks = 0
        file_distribution = {}

        for chunk in chunks_data:
            # Chunk type distribution
            chunk_type = chunk.get('chunk_type', 'unknown')
            chunk_types[chunk_type] = chunk_types.get(chunk_type, 0) + 1

            # Audio-related content
            content = chunk.get('content', '').lower()
            if any(term in content for term in ['audio', 'frequency', 'binaural', 'beat', 'hz', 'oscillator']):
                audio_chunks += 1

            # Priority content (based on file path)
            file_path = chunk.get('file_path', '')
            if any(path in file_path for path in ['hooks/', 'audio/', 'engine']):
                priority_chunks += 1

            # File distribution
            file_dir = str(Path(file_path).parent)
            file_distribution[file_dir] = file_distribution.get(file_dir, 0) + 1

        print("\nCHUNK ANALYSIS:")
        print(f"Audio-related chunks: {audio_chunks} ({audio_chunks/len(chunks_data)*100:.1f}%)")
        print(f"Priority chunks: {priority_chunks} ({priority_chunks/len(chunks_data)*100:.1f}%)")

        print("\nCHUNK TYPES:")
        for chunk_type, count in sorted(chunk_types.items(), key=lambda x: x[1], reverse=True):
            print(f"  {chunk_type}: {count}")

        print("\nFILE DISTRIBUTION (top 10):")
        for file_dir, count in sorted(file_distribution.items(), key=lambda x: x[1], reverse=True)[:10]:
            print(f"  {file_dir}: {count}")

        # Identify fine-tuning opportunities
        print("\nFINE-TUNING OPPORTUNITIES:")

        # 1. Embedding model optimization
        print("1. EMBEDDING MODEL:")
        print("   - Current: all-MiniLM-L6-v2 (384 dimensions)")
        print("   - Upgrade option: all-mpnet-base-v2 (768 dimensions, better quality)")
        print("   - Domain-specific: Consider fine-tuning on audio/binaural terminology")

        # 2. Chunk size optimization
        avg_chunk_size = sum(len(chunk.get('content', '')) for chunk in chunks_data) / len(chunks_data)
        print(f"\n2. CHUNK SIZE OPTIMIZATION:")
        print(f"   - Average chunk size: {avg_chunk_size:.0f} characters")
        print("   - Recommendation: Optimal chunk size for code is 200-500 tokens")
        print("   - Consider semantic chunking for better context preservation")

        # 3. Metadata enhancement
        print("\n3. METADATA ENHANCEMENT:")
        print("   - Add function/class complexity scores")
        print("   - Include audio-domain semantic tags")
        print("   - Add dependency/import relationship mapping")
        print("   - Include code quality metrics (cyclomatic complexity, etc.)")

        # 4. Retrieval strategy
        print("\n4. RETRIEVAL STRATEGY:")
        print("   - Current: Cosine similarity only")
        print("   - Enhancement: Hybrid search (vector + keyword)")
        print("   - Add query expansion for audio domain terms")
        print("   - Implement re-ranking based on code relationships")

        # 5. Audio domain specific improvements
        audio_ratio = audio_chunks / len(chunks_data)
        print(f"\n5. AUDIO DOMAIN OPTIMIZATION:")
        print(f"   - Audio content ratio: {audio_ratio*100:.1f}%")
        if audio_ratio < 0.3:
            print("   - WARNING LOW: Consider boosting audio-related content weights")
        print("   - Add frequency/Hz pattern recognition")
        print("   - Implement binaural beat terminology embeddings")
        print("   - Create audio processing workflow mappings")

        return {
            'total_chunks': len(chunks_data),
            'audio_chunks': audio_chunks,
            'priority_chunks': priority_chunks,
            'chunk_types': chunk_types,
            'avg_chunk_size': avg_chunk_size,
            'audio_ratio': audio_ratio
        }

    else:
        print(f"Chunks file not found: {chunks_file}")
        print("Run setup_rag.py first to generate chunks")
        return None

def recommend_fine_tuning_actions(analysis_result):
    """
    Provide specific actionable recommendations based on analysis
    """
    if not analysis_result:
        return

    print("\nRECOMMENDED ACTIONS (Priority Order):")

    # Priority 1: Audio domain enhancement
    if analysis_result['audio_ratio'] < 0.3:
        print("\n1. BOOST AUDIO CONTENT WEIGHTING")
        print("   - Increase embedding weights for audio-related chunks")
        print("   - Add audio terminology to stop words exclusion")
        print("   - Create audio-specific embedding fine-tuning dataset")

    # Priority 2: Embedding model upgrade
    print("\n2. UPGRADE EMBEDDING MODEL")
    print("   - Test all-mpnet-base-v2 vs current all-MiniLM-L6-v2")
    print("   - Benchmark retrieval accuracy on EBL-specific queries")
    print("   - Consider domain adaptation training")

    # Priority 3: Hybrid search implementation
    print("\n3. IMPLEMENT HYBRID SEARCH")
    print("   - Add BM25 keyword search alongside vector search")
    print("   - Weight vector search 70%, keyword search 30%")
    print("   - Add query expansion for technical terms")

    # Priority 4: Metadata enrichment
    print("\n4. ENRICH CHUNK METADATA")
    print("   - Add AST-based complexity metrics")
    print("   - Include import dependency graphs")
    print("   - Tag audio processing pipeline stages")

    # Priority 5: Evaluation framework
    print("\n5. BUILD EVALUATION FRAMEWORK")
    print("   - Create EBL-specific test queries and expected results")
    print("   - Implement retrieval accuracy metrics (Precision@K, Recall@K)")
    print("   - Add latency and relevance scoring")

if __name__ == "__main__":
    analysis = analyze_rag_performance()
    recommend_fine_tuning_actions(analysis)