"""
Audio Domain Training Data Generator for RAG Fine-Tuning
Creates training pairs for domain-specific embedding optimization
"""

import json
import random
from typing import List, Tuple, Dict
from pathlib import Path


class AudioDomainTrainingGenerator:
    """Generate training data for audio domain embedding fine-tuning"""

    def __init__(self, chunks_file: str = "backend/rag/ebl_chunks.json"):
        self.chunks_file = Path(chunks_file)
        self._load_chunks()
        self._build_audio_vocabulary()

    def _load_chunks(self):
        """Load preprocessed chunks"""
        with open(self.chunks_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        self.chunks = data.get('chunks', [])

    def _build_audio_vocabulary(self):
        """Build comprehensive audio domain vocabulary"""
        self.audio_concepts = {
            'frequency_generation': [
                'frequency', 'hz', 'hertz', 'oscillator', 'sine wave', 'carrier frequency',
                'modulation', 'synthesis', 'tone generation', 'pitch', 'fundamental frequency'
            ],
            'binaural_processing': [
                'binaural', 'stereo', 'left channel', 'right channel', 'spatial audio',
                'panning', 'phase difference', 'interaural', 'beat frequency', '3d audio'
            ],
            'audio_engine': [
                'audio context', 'web audio api', 'audio worklet', 'audio node',
                'gain node', 'buffer', 'sample rate', 'audio graph', 'real-time',
                'audio processing', 'dsp', 'audio pipeline'
            ],
            'signal_processing': [
                'filter', 'low pass', 'high pass', 'bandpass', 'envelope', 'adsr',
                'compression', 'reverb', 'delay', 'echo', 'distortion', 'eq'
            ],
            'streaming_protocols': [
                'websocket', 'real-time', 'streaming', 'latency', 'buffer underrun',
                'audio streaming', 'live audio', 'webrtc', 'peer connection'
            ],
            'therapeutic_applications': [
                'adhd', 'focus', 'meditation', 'brainwave entrainment', 'neurofeedback',
                'cognitive enhancement', 'attention training', 'relaxation', 'sleep aid'
            ],
            'technical_implementation': [
                'react hooks', 'useaudioengine', 'audio controls', 'volume control',
                'frequency slider', 'pattern selector', 'preset management', 'ui components'
            ]
        }

        # EBL-specific terminology
        self.ebl_specific = [
            'electromagnetic field', 'em field simulation', 'toroidal field',
            'vortex pattern', 'field visualization', 'spherical harmonics',
            'electromagnetic beat lab', 'field synchronization', 'pattern generation'
        ]

    def generate_positive_pairs(self) -> List[Tuple[str, str]]:
        """Generate positive training pairs (similar content)"""
        positive_pairs = []

        # 1. Concept synonyms within same domain
        for concept_group, terms in self.audio_concepts.items():
            for i, term1 in enumerate(terms):
                for term2 in terms[i+1:]:
                    positive_pairs.append((term1, term2))

        # 2. Query-to-code mappings from actual chunks
        audio_chunks = [
            chunk for chunk in self.chunks
            if any(term in chunk['content'].lower()
                  for term_list in self.audio_concepts.values()
                  for term in term_list)
        ]

        # Generate natural language queries for code chunks
        for chunk in audio_chunks[:50]:  # Limit for training efficiency
            content = chunk['content'][:200]  # First 200 chars
            file_path = chunk['file_path']

            # Generate queries based on content
            queries = self._generate_queries_for_chunk(chunk)
            for query in queries:
                positive_pairs.append((query, content))

        return positive_pairs

    def generate_negative_pairs(self) -> List[Tuple[str, str]]:
        """Generate negative training pairs (dissimilar content)"""
        negative_pairs = []

        # Audio vs non-audio chunks
        audio_terms = [term for terms in self.audio_concepts.values() for term in terms]

        audio_chunks = [
            chunk for chunk in self.chunks
            if any(term in chunk['content'].lower() for term in audio_terms)
        ]

        non_audio_chunks = [
            chunk for chunk in self.chunks
            if not any(term in chunk['content'].lower() for term in audio_terms)
            and 'database' in chunk['content'].lower() or 'auth' in chunk['content'].lower()
        ]

        # Pair audio queries with non-audio content
        for audio_chunk in audio_chunks[:25]:
            audio_content = audio_chunk['content'][:200]
            for non_audio_chunk in random.sample(non_audio_chunks, min(3, len(non_audio_chunks))):
                non_audio_content = non_audio_chunk['content'][:200]
                negative_pairs.append((audio_content, non_audio_content))

        return negative_pairs

    def _generate_queries_for_chunk(self, chunk: Dict) -> List[str]:
        """Generate natural language queries for a code chunk"""
        queries = []
        content = chunk['content'].lower()
        file_path = chunk['file_path'].lower()
        chunk_type = chunk['chunk_type']

        # Base query templates
        templates = {
            'function': [
                "how to {function_name}",
                "implement {function_name}",
                "{function_name} example code",
                "function for {purpose}"
            ],
            'class': [
                "define {class_name} class",
                "{class_name} implementation",
                "create {class_name} object",
                "class that handles {purpose}"
            ],
            'component': [
                "React component for {purpose}",
                "{component_name} component",
                "UI component that {purpose}",
                "how to build {component_name}"
            ],
            'hook': [
                "React hook for {purpose}",
                "{hook_name} usage",
                "custom hook that {purpose}",
                "how to use {hook_name}"
            ]
        }

        # Extract key information
        purpose_keywords = []
        if 'audio' in content:
            purpose_keywords.extend(['audio processing', 'sound generation', 'audio control'])
        if 'frequency' in content:
            purpose_keywords.extend(['frequency generation', 'frequency control', 'Hz calculation'])
        if 'binaural' in content:
            purpose_keywords.extend(['binaural beats', 'stereo audio', 'spatial sound'])
        if 'websocket' in content:
            purpose_keywords.extend(['real-time communication', 'streaming', 'live updates'])

        # Function/class name extraction
        name = chunk.get('metadata', {}).get('function_name') or chunk.get('metadata', {}).get('class_name')

        # Generate queries based on chunk type
        if chunk_type in templates:
            for template in templates[chunk_type]:
                if name and '{function_name}' in template or '{class_name}' in template or '{hook_name}' in template or '{component_name}' in template:
                    query = template.format(
                        function_name=name,
                        class_name=name,
                        hook_name=name,
                        component_name=name
                    )
                    queries.append(query)

                if purpose_keywords and '{purpose}' in template:
                    for purpose in purpose_keywords[:2]:  # Limit to 2 purposes
                        query = template.format(purpose=purpose)
                        queries.append(query)

        return queries[:3]  # Limit queries per chunk

    def generate_training_dataset(self, output_file: str = "backend/rag/audio_training_data.jsonl"):
        """Generate complete training dataset in JSONL format"""
        positive_pairs = self.generate_positive_pairs()
        negative_pairs = self.generate_negative_pairs()

        print(f"Generated {len(positive_pairs)} positive pairs")
        print(f"Generated {len(negative_pairs)} negative pairs")

        # Format for sentence-transformers training
        training_data = []

        # Add positive pairs (label = 1)
        for text1, text2 in positive_pairs:
            training_data.append({
                "sentence1": text1,
                "sentence2": text2,
                "label": 1
            })

        # Add negative pairs (label = 0)
        for text1, text2 in negative_pairs:
            training_data.append({
                "sentence1": text1,
                "sentence2": text2,
                "label": 0
            })

        # Shuffle the data
        random.shuffle(training_data)

        # Save as JSONL
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            for item in training_data:
                f.write(json.dumps(item) + '\n')

        print(f"Saved {len(training_data)} training examples to {output_path}")

        # Generate evaluation queries
        self._generate_evaluation_queries(output_path.parent / "evaluation_queries.json")

        return output_path

    def _generate_evaluation_queries(self, output_file: Path):
        """Generate evaluation queries with expected results"""
        eval_queries = [
            {
                "query": "audio engine frequency generation",
                "expected_files": ["useAudioEngine", "AudioEngine", "frequency"],
                "description": "Should find audio processing and frequency generation code"
            },
            {
                "query": "binaural beat calculator",
                "expected_files": ["binaural", "beat", "frequency"],
                "description": "Should find binaural beat generation algorithms"
            },
            {
                "query": "React hook for audio control",
                "expected_files": ["useAudioEngine", "hook", "audio"],
                "description": "Should find React hooks for audio functionality"
            },
            {
                "query": "WebSocket real-time streaming",
                "expected_files": ["websocket", "stream", "real-time"],
                "description": "Should find WebSocket and streaming implementations"
            },
            {
                "query": "ADHD frequency protocols",
                "expected_files": ["adhd", "protocol", "frequency", "pattern"],
                "description": "Should find ADHD treatment frequency patterns"
            }
        ]

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(eval_queries, f, indent=2)

        print(f"Saved evaluation queries to {output_file}")


class EmbeddingFineTuner:
    """Fine-tune embeddings on audio domain data"""

    def __init__(self, base_model: str = "all-MiniLM-L6-v2"):
        self.base_model = base_model

    def fine_tune(self,
                  training_file: str,
                  output_model_path: str = "backend/rag/models/ebl-audio-embeddings",
                  epochs: int = 4,
                  batch_size: int = 16):
        """
        Fine-tune embedding model on audio domain data

        Note: This requires sentence-transformers training setup
        """
        try:
            from sentence_transformers import SentenceTransformer, InputExample, losses
            from sentence_transformers.evaluation import EmbeddingSimilarityEvaluator
            from torch.utils.data import DataLoader
            import torch

            print(f"Fine-tuning {self.base_model} on audio domain data...")

            # Load base model
            model = SentenceTransformer(self.base_model)

            # Load training data
            train_examples = []
            with open(training_file, 'r', encoding='utf-8') as f:
                for line in f:
                    data = json.loads(line)
                    score = float(data['label'])  # Convert 0/1 to similarity score
                    train_examples.append(InputExample(
                        texts=[data['sentence1'], data['sentence2']],
                        label=score
                    ))

            print(f"Loaded {len(train_examples)} training examples")

            # Create DataLoader
            train_dataloader = DataLoader(train_examples, shuffle=True, batch_size=batch_size)

            # Define loss function
            train_loss = losses.CosineSimilarityLoss(model)

            # Fine-tune
            model.fit(
                train_objectives=[(train_dataloader, train_loss)],
                epochs=epochs,
                warmup_steps=int(len(train_dataloader) * 0.1),
                output_path=output_model_path
            )

            print(f"Fine-tuned model saved to {output_model_path}")
            return output_model_path

        except ImportError:
            print("Fine-tuning requires: pip install sentence-transformers torch")
            print("Skipping fine-tuning for now...")
            return None


if __name__ == "__main__":
    # Generate training data
    generator = AudioDomainTrainingGenerator()
    training_file = generator.generate_training_dataset()

    print("\nTraining dataset generated successfully!")
    print("To fine-tune embeddings, run:")
    print("python -c \"from backend.rag.audio_domain_training import EmbeddingFineTuner; ft = EmbeddingFineTuner(); ft.fine_tune('backend/rag/audio_training_data.jsonl')\"")

    # Note: Actual fine-tuning would require additional setup
    # For now, we focus on the enhanced retrieval with better base models