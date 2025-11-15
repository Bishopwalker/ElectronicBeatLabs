"""
RAG Evaluation Framework for EBL Project
Measures retrieval accuracy, relevance, and latency for different configurations
"""

import time
import json
import statistics
from typing import List, Dict, Any, Tuple
from pathlib import Path
from dataclasses import dataclass, asdict

from enhanced_retrieval import EnhancedRAGRetrieval, SearchResult

@dataclass
class EvaluationMetrics:
    """Container for evaluation metrics"""
    precision_at_1: float
    precision_at_3: float
    precision_at_5: float
    recall_at_5: float
    mrr: float  # Mean Reciprocal Rank
    avg_latency_ms: float
    total_queries: int

@dataclass
class QueryEvaluation:
    """Single query evaluation result"""
    query: str
    expected_files: List[str]
    retrieved_files: List[str]
    precision_at_k: Dict[int, float]
    recall: float
    reciprocal_rank: float
    latency_ms: float
    relevant_found: int
    total_relevant: int

class RAGEvaluator:
    """Comprehensive RAG evaluation system"""

    def __init__(self):
        self.test_queries = self._load_test_queries()
        self.evaluation_results = []

    def _load_test_queries(self) -> List[Dict[str, Any]]:
        """Load or generate comprehensive test queries"""
        test_queries = [
            {
                "query": "audio engine frequency generation",
                "expected_keywords": ["audio", "engine", "frequency", "generator", "oscillator"],
                "expected_file_patterns": ["audio", "engine", "frequency", "use"],
                "domain": "audio_processing",
                "difficulty": "medium"
            },
            {
                "query": "useAudioEngine hook implementation",
                "expected_keywords": ["useaudioengine", "hook", "react", "audio", "state"],
                "expected_file_patterns": ["useAudioEngine", "hook", "audio"],
                "domain": "react_hooks",
                "difficulty": "easy"
            },
            {
                "query": "binaural beat calculation algorithm",
                "expected_keywords": ["binaural", "beat", "frequency", "calculation", "left", "right"],
                "expected_file_patterns": ["binaural", "beat", "frequency", "audio"],
                "domain": "audio_processing",
                "difficulty": "hard"
            },
            {
                "query": "WebSocket real-time audio streaming",
                "expected_keywords": ["websocket", "streaming", "real-time", "audio", "buffer"],
                "expected_file_patterns": ["websocket", "stream", "audio", "realtime"],
                "domain": "networking",
                "difficulty": "medium"
            },
            {
                "query": "React component for frequency controls",
                "expected_keywords": ["react", "component", "frequency", "control", "slider"],
                "expected_file_patterns": ["component", "frequency", "control", "react"],
                "domain": "ui_components",
                "difficulty": "medium"
            },
            {
                "query": "ADHD treatment frequency protocols",
                "expected_keywords": ["adhd", "frequency", "protocol", "treatment", "pattern"],
                "expected_file_patterns": ["adhd", "protocol", "frequency", "pattern"],
                "domain": "therapeutic",
                "difficulty": "hard"
            },
            {
                "query": "spatial audio 8D processing",
                "expected_keywords": ["spatial", "audio", "8d", "processing", "panning"],
                "expected_file_patterns": ["spatial", "audio", "3d", "panning"],
                "domain": "audio_processing",
                "difficulty": "hard"
            },
            {
                "query": "FastAPI websocket route handler",
                "expected_keywords": ["fastapi", "websocket", "route", "handler", "endpoint"],
                "expected_file_patterns": ["fastapi", "websocket", "route", "backend"],
                "domain": "backend_api",
                "difficulty": "easy"
            },
            {
                "query": "electromagnetic field visualization",
                "expected_keywords": ["electromagnetic", "field", "visualization", "pattern", "display"],
                "expected_file_patterns": ["electromagnetic", "field", "visual", "pattern"],
                "domain": "visualization",
                "difficulty": "medium"
            },
            {
                "query": "timer preset configuration data",
                "expected_keywords": ["timer", "preset", "configuration", "data", "pattern"],
                "expected_file_patterns": ["timer", "preset", "config", "data"],
                "domain": "data_management",
                "difficulty": "easy"
            }
        ]

        return test_queries

    def evaluate_retrieval_system(self,
                                retrieval_system: EnhancedRAGRetrieval,
                                system_name: str = "Enhanced RAG") -> EvaluationMetrics:
        """
        Comprehensive evaluation of a retrieval system

        Args:
            retrieval_system: The RAG system to evaluate
            system_name: Name for reporting

        Returns:
            EvaluationMetrics with detailed performance data
        """

        query_evaluations = []
        total_latency = 0

        for i, test_case in enumerate(self.test_queries, 1):

            # Measure retrieval latency
            start_time = time.time()
            results = retrieval_system.hybrid_search(
                test_case['query'],
                n_results=5
            )
            latency_ms = (time.time() - start_time) * 1000
            total_latency += latency_ms

            # Evaluate relevance
            query_eval = self._evaluate_query_results(test_case, results, latency_ms)
            query_evaluations.append(query_eval)

            # Print brief results
            print(f"  P@1: {query_eval.precision_at_k[1]:.2f}, "
                  f"P@3: {query_eval.precision_at_k[3]:.2f}, "
                  f"Recall: {query_eval.recall:.2f}, "
                  f"Latency: {latency_ms:.1f}ms")

        # Calculate aggregate metrics
        metrics = self._calculate_aggregate_metrics(query_evaluations, total_latency)

        # Save detailed results
        self._save_evaluation_results(system_name, query_evaluations, metrics)

        return metrics

    def _evaluate_query_results(self,
                               test_case: Dict[str, Any],
                               results: List[SearchResult],
                               latency_ms: float) -> QueryEvaluation:
        """Evaluate a single query's results"""
        query = test_case['query']
        expected_keywords = [kw.lower() for kw in test_case['expected_keywords']]
        expected_patterns = [p.lower() for p in test_case['expected_file_patterns']]

        # Extract retrieved file paths and content
        retrieved_files = [result.file_path.lower() for result in results]
        retrieved_content = [result.content.lower() for result in results]

        # Calculate relevance scores for each result
        relevance_scores = []
        for i, result in enumerate(results):
            score = self._calculate_relevance_score(
                result, expected_keywords, expected_patterns
            )
            relevance_scores.append(score)

        # Consider relevant if score > 0.3
        relevant_threshold = 0.3
        relevant_positions = [i for i, score in enumerate(relevance_scores) if score > relevant_threshold]

        # Calculate precision at K
        precision_at_k = {}
        for k in [1, 3, 5]:
            if k <= len(results):
                relevant_in_top_k = len([i for i in relevant_positions if i < k])
                precision_at_k[k] = relevant_in_top_k / k
            else:
                precision_at_k[k] = 0.0

        # Calculate recall (assume all queries have at least some relevant docs)
        total_relevant = max(1, len(expected_keywords))  # Estimate
        relevant_found = len(relevant_positions)
        recall = min(1.0, relevant_found / total_relevant)

        # Calculate reciprocal rank
        first_relevant_rank = None
        for pos in relevant_positions:
            if first_relevant_rank is None or pos < first_relevant_rank:
                first_relevant_rank = pos + 1  # 1-indexed

        reciprocal_rank = 1.0 / first_relevant_rank if first_relevant_rank else 0.0

        return QueryEvaluation(
            query=query,
            expected_files=test_case['expected_file_patterns'],
            retrieved_files=retrieved_files,
            precision_at_k=precision_at_k,
            recall=recall,
            reciprocal_rank=reciprocal_rank,
            latency_ms=latency_ms,
            relevant_found=relevant_found,
            total_relevant=total_relevant
        )

    def _calculate_relevance_score(self,
                                 result: SearchResult,
                                 expected_keywords: List[str],
                                 expected_patterns: List[str]) -> float:
        """Calculate relevance score for a search result"""
        score = 0.0

        # Check content for keywords
        content_lower = result.content.lower()
        keyword_matches = sum(1 for kw in expected_keywords if kw in content_lower)
        score += (keyword_matches / len(expected_keywords)) * 0.6

        # Check file path for patterns
        file_path_lower = result.file_path.lower()
        pattern_matches = sum(1 for pattern in expected_patterns if pattern in file_path_lower)
        score += (pattern_matches / len(expected_patterns)) * 0.4

        return min(1.0, score)

    def _calculate_aggregate_metrics(self,
                                   query_evaluations: List[QueryEvaluation],
                                   total_latency: float) -> EvaluationMetrics:
        """Calculate aggregate metrics across all queries"""
        precision_at_1 = statistics.mean([qe.precision_at_k[1] for qe in query_evaluations])
        precision_at_3 = statistics.mean([qe.precision_at_k[3] for qe in query_evaluations])
        precision_at_5 = statistics.mean([qe.precision_at_k[5] for qe in query_evaluations])
        recall_at_5 = statistics.mean([qe.recall for qe in query_evaluations])
        mrr = statistics.mean([qe.reciprocal_rank for qe in query_evaluations])
        avg_latency_ms = total_latency / len(query_evaluations)

        return EvaluationMetrics(
            precision_at_1=precision_at_1,
            precision_at_3=precision_at_3,
            precision_at_5=precision_at_5,
            recall_at_5=recall_at_5,
            mrr=mrr,
            avg_latency_ms=avg_latency_ms,
            total_queries=len(query_evaluations)
        )

    def _save_evaluation_results(self,
                               system_name: str,
                               query_evaluations: List[QueryEvaluation],
                               metrics: EvaluationMetrics):
        """Save detailed evaluation results"""
        results = {
            "system_name": system_name,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "aggregate_metrics": asdict(metrics),
            "query_evaluations": [asdict(qe) for qe in query_evaluations]
        }

        output_dir = Path(".claude/rag/evaluation_results")
        output_dir.mkdir(exist_ok=True)

        filename = f"evaluation_{system_name.lower().replace(' ', '_')}_{int(time.time())}.json"
        output_file = output_dir / filename

        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2)

    def compare_systems(self, systems: List[Tuple[EnhancedRAGRetrieval, str]]) -> Dict[str, EvaluationMetrics]:
        """Compare multiple RAG systems"""
        results = {}

        for system, name in systems:
            metrics = self.evaluate_retrieval_system(system, name)
            results[name] = metrics

        # Print comparison table
        self._print_comparison_table(results)

        return results

    def _print_comparison_table(self, results: Dict[str, EvaluationMetrics]):
        """Print a comparison table of system performance"""

        # Header

        # Results
        for system_name, metrics in results.items():
            print(f"{system_name:<20} "
                  f"{metrics.precision_at_1:<8.3f} "
                  f"{metrics.precision_at_3:<8.3f} "
                  f"{metrics.precision_at_5:<8.3f} "
                  f"{metrics.recall_at_5:<8.3f} "
                  f"{metrics.mrr:<8.3f} "
                  f"{metrics.avg_latency_ms:<10.1f}ms")

        # Find best performer
        best_system = max(results.items(), key=lambda x: x[1].precision_at_3)

def run_comprehensive_evaluation():
    """Run comprehensive evaluation of RAG systems"""
    evaluator = RAGEvaluator()

    # Test different configurations
    systems_to_test = []

    try:
        # Standard embedding model
        system1 = EnhancedRAGRetrieval(embedding_model="all-MiniLM-L6-v2")
        systems_to_test.append((system1, "MiniLM-L6-v2"))
    except Exception as e:

    try:
        # Better embedding model
        system2 = EnhancedRAGRetrieval(embedding_model="all-mpnet-base-v2")
        systems_to_test.append((system2, "MPNet-Base-v2"))
    except Exception as e:

    if systems_to_test:
        # Run comparison
        comparison_results = evaluator.compare_systems(systems_to_test)

        # Generate recommendations

        best_precision = max(comparison_results.items(), key=lambda x: x[1].precision_at_3)
        best_speed = min(comparison_results.items(), key=lambda x: x[1].avg_latency_ms)

        if best_precision[1].precision_at_3 > 0.7:
        elif best_precision[1].precision_at_3 > 0.5:
        else:

    else:

if __name__ == "__main__":
    run_comprehensive_evaluation()