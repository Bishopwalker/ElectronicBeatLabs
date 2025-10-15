"""
EBL Cloud Vector Database - Multi-Provider Support
Easily switch between local ChromaDB, Pinecone, Weaviate, or custom solutions
"""

import os
from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json
from enum import Enum

# Base imports
from sentence_transformers import SentenceTransformer
from .chunking_strategy import CodeChunk


class VectorProvider(Enum):
    """Supported vector database providers"""
    CHROMA = "chroma"
    PINECONE = "pinecone"
    WEAVIATE = "weaviate"
    QDRANT = "qdrant"
    OPENSEARCH = "opensearch"


class BaseVectorDatabase(ABC):
    """Abstract base class for vector databases"""

    def __init__(self, embedding_model: str = "all-MiniLM-L6-v2"):
        self.embedder = SentenceTransformer(embedding_model)

    @abstractmethod
    def add_chunks(self, chunks: List[CodeChunk], batch_size: int = 100):
        """Add chunks to the vector database"""
        pass

    @abstractmethod
    def search(self, query: str, n_results: int = 5, filter_dict: Optional[Dict] = None):
        """Search for relevant chunks"""
        pass

    @abstractmethod
    def clear_database(self):
        """Clear all data from the database"""
        pass

    @abstractmethod
    def get_stats(self) -> Dict[str, Any]:
        """Get statistics about the database"""
        pass

    def generate_embedding(self, text: str) -> List[float]:
        """Generate embedding for text"""
        embedding = self.embedder.encode(text, convert_to_tensor=False)
        return embedding.tolist()


class ChromaVectorDatabase(BaseVectorDatabase):
    """Local ChromaDB implementation"""

    def __init__(self, persist_directory: str = "./backend/rag/chroma_db", **kwargs):
        super().__init__(**kwargs)
        import chromadb
        from chromadb.config import Settings

        self.client = chromadb.PersistentClient(
            path=persist_directory,
            settings=Settings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name="ebl_code_chunks"
        )

    def add_chunks(self, chunks: List[CodeChunk], batch_size: int = 100):
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]

            ids = [chunk.id for chunk in batch]
            embeddings = [self.generate_embedding(chunk.content) for chunk in batch]
            documents = [chunk.content for chunk in batch]
            metadatas = [self._prepare_metadata(chunk) for chunk in batch]

            self.collection.add(
                ids=ids,
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas
            )

    def search(self, query: str, n_results: int = 5, filter_dict: Optional[Dict] = None):
        query_embedding = self.generate_embedding(query)

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=n_results,
            where=filter_dict,
            include=["documents", "metadatas", "distances"]
        )

        return self._format_results(results, query)

    def clear_database(self):
        self.client.delete_collection("ebl_code_chunks")
        self.collection = self.client.create_collection("ebl_code_chunks")

    def get_stats(self) -> Dict[str, Any]:
        return {
            'total_documents': self.collection.count(),
            'provider': 'ChromaDB (Local)'
        }

    def _prepare_metadata(self, chunk: CodeChunk) -> Dict:
        return {
            "file_path": chunk.file_path,
            "chunk_type": chunk.chunk_type,
            "start_line": chunk.start_line,
            "end_line": chunk.end_line,
            **chunk.metadata
        }

    def _format_results(self, results, query):
        formatted = []
        for i in range(len(results['ids'][0])):
            formatted.append({
                'id': results['ids'][0][i],
                'content': results['documents'][0][i],
                'metadata': results['metadatas'][0][i],
                'distance': results['distances'][0][i],
                'similarity_score': 1 - results['distances'][0][i]
            })
        return {'query': query, 'results': formatted}


class VectorDatabaseFactory:
    """Factory to create the appropriate vector database"""

    @staticmethod
    def create(provider: VectorProvider, **config) -> BaseVectorDatabase:
        """
        Create a vector database instance

        Args:
            provider: Which provider to use
            **config: Provider-specific configuration

        Returns:
            Vector database instance
        """
        if provider == VectorProvider.CHROMA:
            return ChromaVectorDatabase(**config)
        else:
            raise ValueError(f"Unsupported provider: {provider}")


class CloudRAGPipeline:
    """
    Unified RAG pipeline that works with any vector database provider
    """

    def __init__(self,
                 project_root: str,
                 provider: VectorProvider = VectorProvider.CHROMA,
                 **vector_config):
        """
        Initialize RAG pipeline with specified provider

        Args:
            project_root: Root directory of the EBL project
            provider: Which vector database to use
            **vector_config: Provider-specific configuration
        """
        from .chunking_strategy import EBLChunkingStrategy

        self.project_root = project_root
        self.chunker = EBLChunkingStrategy(project_root)
        self.provider = provider

        # Create vector database
        self.vector_db = VectorDatabaseFactory.create(provider, **vector_config)

        print(f"Initialized RAG pipeline with {provider.value} provider")

    def index_project(self, force_reindex: bool = False):
        """Index the entire project"""
        stats = self.vector_db.get_stats()

        if not force_reindex and stats['total_documents'] > 0:
            print(f"Database already contains {stats['total_documents']} documents")
            if not force_reindex:
                return

        if force_reindex:
            self.vector_db.clear_database()

        # Chunk and index
        print("Chunking project...")
        chunks = self.chunker.chunk_project()
        print(f"Created {len(chunks)} chunks")

        print("Adding to vector database...")
        self.vector_db.add_chunks(chunks)

        print("Indexing complete!")
        print(self.vector_db.get_stats())

    def query(self, query: str, n_results: int = 5):
        """Query the RAG system"""
        return self.vector_db.search(query, n_results)


if __name__ == "__main__":
    # Example: Start with local ChromaDB
    local_rag = CloudRAGPipeline(
        project_root="C:/Users/bisho/ideaprojects/ebl",
        provider=VectorProvider.CHROMA
    )
    local_rag.index_project()

    # Test local search
    results = local_rag.query("audio engine")
    print(f"Local search found {len(results['results'])} results")