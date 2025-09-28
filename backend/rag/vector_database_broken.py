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
from backend.rag.chunking_strategy import CodeChunk


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


class PineconeVectorDatabase(BaseVectorDatabase):
    """Pinecone cloud implementation"""

    def __init__(self, api_key: str, environment: str = "us-east-1", **kwargs):
        super().__init__(**kwargs)
        from pinecone import Pinecone, ServerlessSpec

        self.pc = Pinecone(api_key=api_key)

        # Create index if it doesn't exist
        index_name = "ebl-code-chunks"
        if index_name not in self.pc.list_indexes().names():
            self.pc.create_index(
                name=index_name,
                dimension=384,  # all-MiniLM-L6-v2 dimension
                metric='cosine',
                spec=ServerlessSpec(
                    cloud='aws',
                    region=environment
                )
            )

        self.index = self.pc.Index(index_name)

    def add_chunks(self, chunks: List[CodeChunk], batch_size: int = 100):
        for i in range(0, len(chunks), batch_size):
            batch = chunks[i:i + batch_size]

            vectors = []
            for chunk in batch:
                vectors.append({
                    "id": chunk.id,
                    "values": self.generate_embedding(chunk.content),
                    "metadata": self._prepare_metadata(chunk)
                })

            self.index.upsert(vectors=vectors)

    def search(self, query: str, n_results: int = 5, filter_dict: Optional[Dict] = None):
        query_embedding = self.generate_embedding(query)

        results = self.index.query(
            vector=query_embedding,
            top_k=n_results,
            filter=filter_dict,
            include_metadata=True
        )

        formatted = []
        for match in results['matches']:
            formatted.append({
                'id': match['id'],
                'metadata': match['metadata'],
                'similarity_score': match['score']
            })

        return {'query': query, 'results': formatted}

    def clear_database(self):
        self.index.delete(delete_all=True)

    def get_stats(self) -> Dict[str, Any]:
        stats = self.index.describe_index_stats()
        return {
            'total_documents': stats['total_vector_count'],
            'provider': 'Pinecone (Cloud)',
            'dimensions': stats['dimension']
        }

    def _prepare_metadata(self, chunk: CodeChunk) -> Dict:
        # Pinecone metadata must be flat (no nested objects)
        metadata = {
            "file_path": chunk.file_path,
            "chunk_type": chunk.chunk_type,
            "start_line": chunk.start_line,
            "end_line": chunk.end_line,
            "language": chunk.metadata.get("language", ""),
            "priority": chunk.metadata.get("priority", 0.5),
            "has_audio_terms": chunk.metadata.get("has_audio_terms", False)
        }

        # Add specific fields based on chunk type
        if chunk.chunk_type == "class":
            metadata["class_name"] = chunk.metadata.get("class_name", "")
        elif chunk.chunk_type == "function":
            metadata["function_name"] = chunk.metadata.get("function_name", "")

        return metadata


class WeaviateVectorDatabase(BaseVectorDatabase):
    """Weaviate cloud implementation"""

    def __init__(self, url: str, api_key: str, **kwargs):
        super().__init__(**kwargs)
        import weaviate
        from weaviate.auth import AuthApiKey

        self.client = weaviate.Client(
            url=url,
            auth_client_secret=AuthApiKey(api_key)
        )

        # Setup schema
        self._setup_schema()

    def _setup_schema(self):
        """Create Weaviate schema for code chunks"""
        schema = {
            "class": "CodeChunk",
            "description": "EBL project code chunks",
            "properties": [
                {
                    "name": "content",
                    "dataType": ["text"],
                    "description": "The actual code content"
                },
                {
                    "name": "file_path",
                    "dataType": ["string"],
                    "description": "Path to the source file"
                },
                {
                    "name": "chunk_type",
                    "dataType": ["string"],
                    "description": "Type of code chunk"
                },
                {
                    "name": "start_line",
                    "dataType": ["int"],
                    "description": "Starting line number"
                },
                {
                    "name": "end_line",
                    "dataType": ["int"],
                    "description": "Ending line number"
                },
                {
                    "name": "metadata",
                    "dataType": ["text"],
                    "description": "Additional metadata as JSON"
                }
            ]
        }

        # Check if class exists
        existing = self.client.schema.get()
        class_names = [c['class'] for c in existing.get('classes', [])]

        if "CodeChunk" not in class_names:
            self.client.schema.create_class(schema)

    def add_chunks(self, chunks: List[CodeChunk], batch_size: int = 100):
        with self.client.batch as batch:
            for chunk in chunks:
                properties = {
                    "content": chunk.content,
                    "file_path": chunk.file_path,
                    "chunk_type": chunk.chunk_type,
                    "start_line": chunk.start_line,
                    "end_line": chunk.end_line,
                    "metadata": json.dumps(chunk.metadata)
                }

                batch.add_data_object(
                    data_object=properties,
                    class_name="CodeChunk",
                    uuid=chunk.id
                )

                if batch.num_objects() >= batch_size:
                    batch.flush()

    def search(self, query: str, n_results: int = 5, filter_dict: Optional[Dict] = None):
        # Generate query embedding
        query_vector = self.generate_embedding(query)

        # Build the query
        near_vector = {"vector": query_vector}

        result = (
            self.client.query
            .get("CodeChunk", ["content", "file_path", "chunk_type", "metadata"])
            .with_near_vector(near_vector)
            .with_limit(n_results)
            .with_additional(["distance"])
            .do()
        )

        formatted = []
        for item in result['data']['Get']['CodeChunk']:
            formatted.append({
                'content': item['content'],
                'metadata': {
                    'file_path': item['file_path'],
                    'chunk_type': item['chunk_type'],
                    **json.loads(item.get('metadata', '{}'))
                },
                'distance': item['_additional']['distance'],
                'similarity_score': 1 - item['_additional']['distance']
            })

        return {'query': query, 'results': formatted}

    def clear_database(self):
        self.client.schema.delete_class("CodeChunk")
        self._setup_schema()

    def get_stats(self) -> Dict[str, Any]:
        result = self.client.query.aggregate("CodeChunk").with_meta_count().do()
        count = result['data']['Aggregate']['CodeChunk'][0]['meta']['count']

        return {
            'total_documents': count,
            'provider': 'Weaviate (Cloud)'
        }


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

        elif provider == VectorProvider.PINECONE:
            if 'api_key' not in config:
                raise ValueError("Pinecone requires 'api_key' in config")
            return PineconeVectorDatabase(**config)

        elif provider == VectorProvider.WEAVIATE:
            if 'url' not in config or 'api_key' not in config:
                raise ValueError("Weaviate requires 'url' and 'api_key' in config")
            return WeaviateVectorDatabase(**config)

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
        from backend.rag.chunking_strategy import EBLChunkingStrategy

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
            response = input("Reindex? (y/n): ")
            if response.lower() != 'y':
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

    def migrate_to_cloud(self,
                         new_provider: VectorProvider,
                         **new_config) -> 'CloudRAGPipeline':
        """
        Migrate from one provider to another
        
        Args:
            new_provider: Target provider
            **new_config: Configuration for new provider
            
        Returns:
            New RAG pipeline with migrated data
        """
        print(f"Migrating from {self.provider.value} to {new_provider.value}...")

        # Get all chunks from current chunker
        chunks = self.chunker.chunks
        if not chunks:
            print("Re-chunking project for migration...")
            chunks = self.chunker.chunk_project()

        # Create new pipeline
        new_pipeline = CloudRAGPipeline(
            project_root=self.project_root,
            provider=new_provider,
            **new_config
        )

        # Add chunks to new database
        print(f"Migrating {len(chunks)} chunks...")
        new_pipeline.vector_db.add_chunks(chunks)

        print("Migration complete!")
        return new_pipeline


# Configuration templates for easy setup
CLOUD_CONFIGS = {
    "local": {
        "provider": VectorProvider.CHROMA,
        "config": {
            "persist_directory": "./backend/rag/chroma_db"
        }
    },
    "pinecone": {
        "provider": VectorProvider.PINECONE,
        "config": {
            "api_key": os.environ.get("PINECONE_API_KEY"),
            "environment": "us-east-1"
        }
    },
    "weaviate": {
        "provider": VectorProvider.WEAVIATE,
        "config": {
            "url": os.environ.get("WEAVIATE_URL"),
            "api_key": os.environ.get("WEAVIATE_API_KEY")
        }
    }
}


if __name__ == "__main__":
    # Example: Start with local, migrate to cloud

    # 1. Start with local ChromaDB
    local_rag = CloudRAGPipeline(
        project_root="C:/Users/bisho/ideaprojects/ebl",
        provider=VectorProvider.CHROMA
    )
    local_rag.index_project()

    # 2. Test local search
    results = local_rag.query("audio engine")
    print(f"Local search found {len(results['results'])} results")

    # 3. Migrate to Pinecone (when ready for production)
    if os.environ.get("PINECONE_API_KEY"):
        cloud_rag = local_rag.migrate_to_cloud(
            new_provider=VectorProvider.PINECONE,
            api_key=os.environ.get("PINECONE_API_KEY")
        )

        # 4. Test cloud search
        results = cloud_rag.query("audio engine")
        print(f"Cloud search found {len(results['results'])} results")