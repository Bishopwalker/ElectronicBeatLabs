"""
Enhanced RAG Retrieval with Fine-Tuning Optimizations
Implements the key improvements identified in the analysis:
1. Better embedding model
2. Hybrid search (vector + keyword)
3. Audio domain query expansion
4. Enhanced metadata scoring
"""

import os
import re
import json
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from pathlib import Path

# Enhanced imports
from sentence_transformers import SentenceTransformer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

@dataclass
class SearchResult:
    """Enhanced search result with multiple scoring methods"""
    chunk_id: str
    content: str
    file_path: str
    metadata: Dict[str, Any]
    vector_score: float
    keyword_score: float
    audio_boost: float
    final_score: float

class AudioDomainQueryExpander:
    """Expands queries with audio domain terminology"""

    def __init__(self):
        self.audio_synonyms = {
            'frequency': ['hz', 'hertz', 'freq', 'oscillation', 'cycle'],
            'audio': ['sound', 'acoustic', 'auditory', 'hearing'],
            'binaural': ['stereo', 'dual-channel', 'left-right', 'spatial'],
            'beat': ['rhythm', 'pulse', 'pattern', 'tempo'],
            'phase': ['timing', 'synchronization', 'alignment', 'shift'],
            'amplitude': ['volume', 'loudness', 'gain', 'level', 'power'],
            'oscillator': ['generator', 'synthesizer', 'source', 'waveform'],
            'filter': ['eq', 'equalizer', 'bandpass', 'lowpass', 'highpass'],
            'engine': ['processor', 'system', 'core', 'driver'],
            'stream': ['flow', 'buffer', 'channel', 'pipeline']
        }

        self.technical_patterns = {
            r'\d+\s*hz': ['frequency'],
            r'web\s*audio': ['audio', 'browser'],
            r'real[-\s]*time': ['live', 'instant', 'streaming'],
            r'use\w+': ['hook', 'react', 'component']
        }

    def expand_query(self, query: str) -> List[str]:
        """Expand query with domain-specific terms"""
        expanded_terms = [query.lower()]
        query_lower = query.lower()

        # Add synonyms for exact matches
        for base_term, synonyms in self.audio_synonyms.items():
            if base_term in query_lower:
                expanded_terms.extend(synonyms)

        # Add technical pattern matches
        for pattern, additions in self.technical_patterns.items():
            if re.search(pattern, query_lower):
                expanded_terms.extend(additions)

        # Remove duplicates while preserving order
        seen = set()
        unique_terms = []
        for term in expanded_terms:
            if term not in seen:
                seen.add(term)
                unique_terms.append(term)

        return unique_terms

class EnhancedRAGRetrieval:
    """
    Enhanced RAG retrieval with multiple fine-tuning optimizations
    """

    def __init__(self,
                 chunks_file: str = "backend/rag/ebl_chunks.json",
                 embedding_model: str = "all-mpnet-base-v2"):
        """
        Initialize enhanced retrieval system

        Args:
            chunks_file: Path to preprocessed chunks
            embedding_model: Better embedding model (768-dim vs 384-dim)
        """
        self.chunks_file = Path(chunks_file)
        self.embedding_model_name = embedding_model

        # Load chunks and build indices
        self._load_chunks()
        self._build_embedder()
        self._build_keyword_index()
        self._build_audio_scorer()

        # Initialize query expander
        self.query_expander = AudioDomainQueryExpander()

    def _load_chunks(self):
        """Load and process chunks"""
        if not self.chunks_file.exists():
            raise FileNotFoundError(f"Chunks file not found: {self.chunks_file}")

        with open(self.chunks_file, 'r', encoding='utf-8') as f:
            data = json.load(f)

        self.chunks = data.get('chunks', [])
        self.chunk_texts = [chunk['content'] for chunk in self.chunks]

    def _build_embedder(self):
        """Initialize the enhanced embedding model"""
        self.embedder = SentenceTransformer(self.embedding_model_name)

        # Generate embeddings for all chunks (this might take a while)
        self.chunk_embeddings = self.embedder.encode(
            self.chunk_texts,
            convert_to_tensor=False,
            show_progress_bar=True
        )

    def _build_keyword_index(self):
        """Build TF-IDF index for keyword search"""

        # Custom tokenization for code
        def code_tokenizer(text):
            # Split on common code delimiters
            tokens = re.split(r'[^\w]+', text.lower())
            # Filter out very short tokens
            tokens = [t for t in tokens if len(t) > 1]
            return tokens

        self.tfidf_vectorizer = TfidfVectorizer(
            tokenizer=code_tokenizer,
            max_features=10000,
            ngram_range=(1, 2),  # Include bigrams
            stop_words=None  # Don't remove stops for code
        )

        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.chunk_texts)

    def _build_audio_scorer(self):
        """Build audio domain scoring system"""
        self.audio_terms = [
            'audio', 'sound', 'frequency', 'hz', 'hertz', 'binaural', 'beat',
            'oscillator', 'wave', 'sine', 'amplitude', 'phase', 'stereo',
            'channel', 'sample', 'buffer', 'stream', 'real-time', 'latency',
            'webrtc', 'webaudio', 'worklet', 'context', 'node', 'gain',
            'filter', 'resonance', 'cutoff', 'envelope', 'lfo', 'modulation'
        ]

        # Pre-calculate audio scores for all chunks
        self.audio_scores = []
        for chunk in self.chunks:
            content_lower = chunk['content'].lower()
            file_path_lower = chunk['file_path'].lower()

            # Count audio term matches
            content_matches = sum(1 for term in self.audio_terms if term in content_lower)
            path_matches = sum(1 for term in ['audio', 'sound', 'frequency'] if term in file_path_lower)

            # Boost for audio-related files
            audio_boost = 0.0
            if any(path in file_path_lower for path in ['audio', 'sound', 'engine']):
                audio_boost += 0.5
            if chunk.get('metadata', {}).get('has_audio_terms', False):
                audio_boost += 0.3

            # Calculate final audio score
            audio_score = (content_matches * 0.1) + (path_matches * 0.2) + audio_boost
            self.audio_scores.append(min(audio_score, 1.0))  # Cap at 1.0

    def hybrid_search(self,
                     query: str,
                     n_results: int = 5,
                     vector_weight: float = 0.7,
                     keyword_weight: float = 0.3,
                     audio_boost_weight: float = 0.2) -> List[SearchResult]:
        """
        Perform hybrid search combining vector similarity and keyword matching

        Args:
            query: Search query
            n_results: Number of results to return
            vector_weight: Weight for vector similarity (0.0-1.0)
            keyword_weight: Weight for keyword matching (0.0-1.0)
            audio_boost_weight: Additional weight for audio-related content

        Returns:
            List of SearchResult objects sorted by final score
        """
        # Expand query with domain terms
        expanded_terms = self.query_expander.expand_query(query)
        expanded_query = ' '.join(expanded_terms)

        # Vector similarity search
        query_embedding = self.embedder.encode([expanded_query])
        vector_similarities = cosine_similarity(query_embedding, self.chunk_embeddings)[0]

        # Keyword search
        query_tfidf = self.tfidf_vectorizer.transform([expanded_query])
        keyword_similarities = cosine_similarity(query_tfidf, self.tfidf_matrix)[0]

        # Combine scores
        results = []
        for i, chunk in enumerate(self.chunks):
            vector_score = vector_similarities[i]
            keyword_score = keyword_similarities[i]
            audio_boost = self.audio_scores[i]

            # Calculate weighted final score
            final_score = (
                vector_score * vector_weight +
                keyword_score * keyword_weight +
                audio_boost * audio_boost_weight
            )

            results.append(SearchResult(
                chunk_id=chunk['id'],
                content=chunk['content'],
                file_path=chunk['file_path'],
                metadata=chunk.get('metadata', {}),
                vector_score=vector_score,
                keyword_score=keyword_score,
                audio_boost=audio_boost,
                final_score=final_score
            ))

        # Sort by final score and return top results
        results.sort(key=lambda x: x.final_score, reverse=True)
        return results[:n_results]

    def explain_search(self, query: str, results: List[SearchResult]) -> str:
        """Generate explanation of search results"""
        expanded_terms = self.query_expander.expand_query(query)

        explanation = f"Search for: '{query}'\n"
        explanation += f"Expanded terms: {', '.join(expanded_terms)}\n\n"

        explanation += "Top Results:\n"
        for i, result in enumerate(results, 1):
            explanation += f"{i}. {result.file_path}\n"
            explanation += f"   Vector: {result.vector_score:.3f} | "
            explanation += f"Keyword: {result.keyword_score:.3f} | "
            explanation += f"Audio: {result.audio_boost:.3f} | "
            explanation += f"Final: {result.final_score:.3f}\n"

            # Show snippet
            snippet = result.content[:100].replace('\n', ' ')
            explanation += f"   Snippet: {snippet}...\n\n"

        return explanation

def benchmark_models():
    """Compare embedding models on EBL-specific queries"""
    test_queries = [
        "audio engine frequency generation",
        "useAudioEngine hook implementation",
        "WebSocket real-time streaming",
        "binaural beat calculation",
        "React component audio controls",
        "FastAPI route websocket",
        "frequency modulation algorithms",
        "spatial audio processing"
    ]

    models_to_test = [
        "all-MiniLM-L6-v2",  # Current (384-dim, fast)
        "all-mpnet-base-v2"   # Better (768-dim, slower but higher quality)
    ]

    for model_name in models_to_test:

        try:
            retrieval = EnhancedRAGRetrieval(embedding_model=model_name)

            for query in test_queries:
                results = retrieval.hybrid_search(query, n_results=3)

                # Show top result score
                if results:
                    pass  # Placeholder for result processing

        except Exception as e:
            pass  # Placeholder for error handling

if __name__ == "__main__":
    # Test the enhanced retrieval system
    try:

        # Initialize with better model
        retrieval = EnhancedRAGRetrieval(embedding_model="all-mpnet-base-v2")

        # Test queries
        test_queries = [
            "audio engine frequency",
            "useAudioEngine hook",
            "websocket connection streaming",
            "binaural beat generator"
        ]

        for query in test_queries:
            results = retrieval.hybrid_search(query, n_results=3)
            explanation = retrieval.explain_search(query, results)

    except Exception as e:
        pass  # Placeholder for error handling