"""
EBL Project RAG Chunking Strategy
Optimized for code retrieval and context understanding
"""

import os
import ast
import json
from pathlib import Path
from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import hashlib

@dataclass
class CodeChunk:
    """Represents a chunk of code with metadata"""
    id: str
    file_path: str
    content: str
    chunk_type: str  # 'class', 'function', 'component', 'import', 'module'
    start_line: int
    end_line: int
    metadata: Dict[str, Any]
    
    def to_dict(self) -> Dict:
        return {
            'id': self.id,
            'file_path': self.file_path,
            'content': self.content,
            'chunk_type': self.chunk_type,
            'start_line': self.start_line,
            'end_line': self.end_line,
            'metadata': self.metadata
        }

class EBLChunkingStrategy:
    """Smart chunking strategy for the EBL project"""
    
    def __init__(self, project_root: str):
        self.project_root = Path(project_root)
        self.chunks: List[CodeChunk] = []
        
        # EBL-specific important paths
        self.priority_paths = [
            'src/hooks/',
            'src/components/audio/',
            'backend/services/',
            'backend/routes/',
            'src/types/',
            'backend/models/',
        ]
        
        # Domain-specific entities for your audio project
        self.audio_entities = {
            'frequency_terms': ['Hz', 'binaural', 'carrier', 'beat', 'phase', 'amplitude'],
            'components': ['AudioEngine', 'BinauralTest', 'PatternSelector', 'FrequencyTab'],
            'hooks': ['useAudioEngine', 'useWebSocket', 'useAuth', 'useBackendAPI'],
            'api_routes': ['/api/audio', '/api/patterns', '/api/auth', '/api/timer'],
        }
    
    def chunk_python_file(self, file_path: Path) -> List[CodeChunk]:
        """Chunk a Python file using AST parsing"""
        chunks = []

        try:
            # Try UTF-8 first, fallback to latin-1 if needed
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    content = f.read()
            except Exception:
                print(f"Skipping file due to encoding issues: {file_path}")
                return []

        lines = content.splitlines()
        
        try:
            tree = ast.parse(content)
            
            # Extract imports as a chunk
            imports = []
            for node in ast.walk(tree):
                if isinstance(node, (ast.Import, ast.ImportFrom)):
                    imports.append(ast.get_source_segment(content, node))
            
            if imports:
                chunk_id = self._generate_chunk_id(str(file_path), 'imports')
                chunks.append(CodeChunk(
                    id=chunk_id,
                    file_path=str(file_path.relative_to(self.project_root)),
                    content='\n'.join(imports),
                    chunk_type='import',
                    start_line=1,
                    end_line=len(imports),
                    metadata={
                        'language': 'python',
                        'imports': self._extract_import_names(tree),
                        'priority': self._calculate_priority(file_path)
                    }
                ))
            
            # Extract classes with their methods
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    class_content = ast.get_source_segment(content, node)
                    chunk_id = self._generate_chunk_id(str(file_path), f'class_{node.name}')
                    
                    # Extract method names
                    methods = [n.name for n in ast.walk(node) if isinstance(n, ast.FunctionDef)]
                    
                    chunks.append(CodeChunk(
                        id=chunk_id,
                        file_path=str(file_path.relative_to(self.project_root)),
                        content=class_content,
                        chunk_type='class',
                        start_line=node.lineno,
                        end_line=node.end_lineno,
                        metadata={
                            'language': 'python',
                            'class_name': node.name,
                            'methods': methods,
                            'has_audio_terms': self._has_audio_terms(class_content),
                            'priority': self._calculate_priority(file_path)
                        }
                    ))
            
            # Extract standalone functions
            for node in tree.body:
                if isinstance(node, ast.FunctionDef):
                    func_content = ast.get_source_segment(content, node)
                    chunk_id = self._generate_chunk_id(str(file_path), f'func_{node.name}')
                    
                    chunks.append(CodeChunk(
                        id=chunk_id,
                        file_path=str(file_path.relative_to(self.project_root)),
                        content=func_content,
                        chunk_type='function',
                        start_line=node.lineno,
                        end_line=node.end_lineno,
                        metadata={
                            'language': 'python',
                            'function_name': node.name,
                            'docstring': ast.get_docstring(node),
                            'has_audio_terms': self._has_audio_terms(func_content),
                            'priority': self._calculate_priority(file_path)
                        }
                    ))
        
        except SyntaxError:
            # If AST parsing fails, fall back to line-based chunking
            chunks.append(self._fallback_chunk(file_path, content))
        
        return chunks
    
    def chunk_typescript_file(self, file_path: Path) -> List[CodeChunk]:
        """Chunk TypeScript/TSX files using pattern matching"""
        chunks = []

        try:
            # Try UTF-8 first, fallback to latin-1 if needed
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except UnicodeDecodeError:
            try:
                with open(file_path, 'r', encoding='latin-1') as f:
                    content = f.read()
            except Exception:
                print(f"Skipping file due to encoding issues: {file_path}")
                return []

        lines = content.splitlines()
        
        # Extract imports
        import_lines = []
        for i, line in enumerate(lines):
            if line.strip().startswith('import'):
                import_lines.append(line)
        
        if import_lines:
            chunk_id = self._generate_chunk_id(str(file_path), 'imports')
            chunks.append(CodeChunk(
                id=chunk_id,
                file_path=str(file_path.relative_to(self.project_root)),
                content='\n'.join(import_lines),
                chunk_type='import',
                start_line=1,
                end_line=len(import_lines),
                metadata={
                    'language': 'typescript',
                    'is_react': file_path.suffix == '.tsx',
                    'priority': self._calculate_priority(file_path)
                }
            ))
        
        # Extract React components (simple pattern matching)
        component_pattern = r'(export\s+)?(default\s+)?(const|function)\s+(\w+).*?{[\s\S]*?^}'
        
        # Extract interfaces
        interface_lines = []
        in_interface = False
        interface_start = 0
        
        for i, line in enumerate(lines):
            if 'interface' in line or 'type' in line and '=' in line:
                in_interface = True
                interface_start = i
                interface_lines = [line]
            elif in_interface:
                interface_lines.append(line)
                if line.strip().endswith('}') or line.strip().endswith(';'):
                    # Create interface chunk
                    chunk_id = self._generate_chunk_id(str(file_path), f'interface_{interface_start}')
                    chunks.append(CodeChunk(
                        id=chunk_id,
                        file_path=str(file_path.relative_to(self.project_root)),
                        content='\n'.join(interface_lines),
                        chunk_type='interface',
                        start_line=interface_start,
                        end_line=i,
                        metadata={
                            'language': 'typescript',
                            'has_audio_terms': self._has_audio_terms('\n'.join(interface_lines)),
                            'priority': self._calculate_priority(file_path)
                        }
                    ))
                    in_interface = False
        
        # If we can't parse it well, use the whole file
        if len(chunks) <= 1:
            chunks.append(self._fallback_chunk(file_path, content))
        
        return chunks
    
    def _generate_chunk_id(self, file_path: str, chunk_identifier: str) -> str:
        """Generate a unique ID for a chunk"""
        content = f"{file_path}_{chunk_identifier}"
        return hashlib.md5(content.encode()).hexdigest()[:12]
    
    def _extract_import_names(self, tree: ast.AST) -> List[str]:
        """Extract all import names from an AST"""
        imports = []
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.append(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.append(node.module)
        return imports
    
    def _has_audio_terms(self, content: str) -> bool:
        """Check if content contains audio-related terms"""
        content_lower = content.lower()
        for term_list in self.audio_entities.values():
            for term in term_list:
                if term.lower() in content_lower:
                    return True
        return False
    
    def _calculate_priority(self, file_path: Path) -> float:
        """Calculate priority score for a file based on its path"""
        path_str = str(file_path.relative_to(self.project_root))
        
        # Check if it's in a priority path
        for priority_path in self.priority_paths:
            if priority_path in path_str:
                return 1.0
        
        # Lower priority for test files
        if 'test' in path_str.lower():
            return 0.3
        
        # Medium priority for everything else
        return 0.5
    
    def _fallback_chunk(self, file_path: Path, content: str) -> CodeChunk:
        """Create a fallback chunk when parsing fails"""
        chunk_id = self._generate_chunk_id(str(file_path), 'full')
        return CodeChunk(
            id=chunk_id,
            file_path=str(file_path.relative_to(self.project_root)),
            content=content[:5000],  # Limit size
            chunk_type='module',
            start_line=1,
            end_line=len(content.splitlines()),
            metadata={
                'language': self._detect_language(file_path),
                'fallback': True,
                'has_audio_terms': self._has_audio_terms(content),
                'priority': self._calculate_priority(file_path)
            }
        )
    
    def _detect_language(self, file_path: Path) -> str:
        """Detect language from file extension"""
        suffix_map = {
            '.py': 'python',
            '.ts': 'typescript', 
            '.tsx': 'typescript_react',
            '.js': 'javascript',
            '.jsx': 'javascript_react',
        }
        return suffix_map.get(file_path.suffix, 'unknown')
    
    def chunk_project(self) -> List[CodeChunk]:
        """Chunk the entire EBL project"""
        all_chunks = []
        
        # Python files in backend
        backend_path = self.project_root / 'backend'
        if backend_path.exists():
            for py_file in backend_path.rglob('*.py'):
                if '.venv' not in str(py_file):
                    chunks = self.chunk_python_file(py_file)
                    all_chunks.extend(chunks)
        
        # TypeScript/React files in src
        src_path = self.project_root / 'src'
        if src_path.exists():
            for ts_file in src_path.rglob('*.ts'):
                chunks = self.chunk_typescript_file(ts_file)
                all_chunks.extend(chunks)
            
            for tsx_file in src_path.rglob('*.tsx'):
                chunks = self.chunk_typescript_file(tsx_file)
                all_chunks.extend(chunks)
        
        self.chunks = all_chunks
        return all_chunks
    
    def create_dependency_graph(self) -> Dict[str, List[str]]:
        """Create a dependency graph from imports"""
        graph = {}
        
        for chunk in self.chunks:
            if chunk.chunk_type == 'import':
                file_path = chunk.file_path
                imports = chunk.metadata.get('imports', [])
                graph[file_path] = imports
        
        return graph
    
    def save_chunks(self, output_path: str):
        """Save chunks to JSON file"""
        chunks_data = [chunk.to_dict() for chunk in self.chunks]
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump({
                'total_chunks': len(chunks_data),
                'project_root': str(self.project_root),
                'chunks': chunks_data,
                'dependency_graph': self.create_dependency_graph()
            }, f, indent=2)
    
    def get_relevant_chunks(self, query: str, top_k: int = 5) -> List[CodeChunk]:
        """Simple relevance scoring (you'd replace this with vector search)"""
        scored_chunks = []
        query_lower = query.lower()
        
        for chunk in self.chunks:
            score = 0
            
            # Check content match
            if query_lower in chunk.content.lower():
                score += 2
            
            # Check metadata matches
            if chunk.metadata.get('class_name') and query_lower in chunk.metadata['class_name'].lower():
                score += 3
            
            if chunk.metadata.get('function_name') and query_lower in chunk.metadata['function_name'].lower():
                score += 3
            
            # Boost audio-related chunks for audio queries
            if 'audio' in query_lower and chunk.metadata.get('has_audio_terms'):
                score += 2
            
            # Apply priority multiplier
            score *= chunk.metadata.get('priority', 0.5)
            
            if score > 0:
                scored_chunks.append((score, chunk))
        
        # Sort by score and return top K
        scored_chunks.sort(key=lambda x: x[0], reverse=True)
        return [chunk for _, chunk in scored_chunks[:top_k]]


# Example usage
if __name__ == "__main__":
    # Initialize the chunking strategy
    chunker = EBLChunkingStrategy(project_root="C:/Users/bisho/ideaprojects/ebl")
    
    # Chunk the entire project
    print("Chunking EBL project...")
    chunks = chunker.chunk_project()
    print(f"Created {len(chunks)} chunks")
    
    # Save chunks to file
    chunker.save_chunks("ebl_chunks.json")
    print("Chunks saved to ebl_chunks.json")
    
    # Example: Find relevant chunks for a query
    query = "audio engine frequency"
    relevant = chunker.get_relevant_chunks(query, top_k=5)
    
    print(f"\nTop {len(relevant)} chunks for query '{query}':")
    for chunk in relevant:
        print(f"  - {chunk.file_path} ({chunk.chunk_type}): {chunk.metadata}")
