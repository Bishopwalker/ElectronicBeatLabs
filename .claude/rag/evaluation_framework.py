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

QUERIES_FILE = Path(__file__).parent / "data" / "evaluation_queries.json"


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
        """
        Load test queries from evaluation_queries.json, falling back to hardcoded set.

        Returns:
            List of query dicts with expected_keywords, expected_file_patterns, domain, difficulty.
        """
        if QUERIES_FILE.exists():
            with open(QUERIES_FILE, "r", encoding="utf-8") as f:
                raw = json.load(f)

            # Normalize: evaluation_queries.json may use expected_file_patterns or expected_files
            normalized = []
            for entry in raw:
                normalized.append({
                    "query": entry["query"],
                    "expected_keywords": entry.get("expected_keywords", []),
                    "expected_file_patterns": entry.get(
                        "expected_file_patterns",
                        entry.get("expected_files", [])
                    ),
                    "domain": entry.get("domain", "general"),
                    "difficulty": entry.get("difficulty", "medium"),
                    "description": entry.get("description", ""),
                })
            print(f"Loaded {len(normalized)} evaluation queries from {QUERIES_FILE}")
            return normalized

        # Fallback hardcoded queries if JSON file is missing
        print(f"Warning: {QUERIES_FILE} not found — using built-in fallback queries")
        return [
            {
                "query": "audio engine frequency generation",
                "expected_keywords": ["audio", "engine", "frequency", "generator", "oscillator"],
                "expected_file_patterns": ["audio_engine", "frequency"],
                "domain": "audio_processing",
                "difficulty": "medium",
            },
            {
                "query": "useAudioEngine hook implementation",
                "expected_keywords": ["useaudioengine", "hook", "react", "audio", "state"],
                "expected_file_patterns": ["useAudioEngine", "hook", "audio"],
                "domain": "react_hooks",
                "difficulty": "easy",
            },
            {
                "query": "binaural beat calculation algorithm",
                "expected_keywords": ["binaural", "beat", "frequency", "calculation", "left", "right"],
                "expected_file_patterns": ["binaural", "beat", "frequency", "audio"],
                "domain": "audio_processing",
                "difficulty": "hard",
            },
            {
                "query": "WebSocket real-time audio streaming",
                "expected_keywords": ["websocket", "streaming", "real-time", "audio", "buffer"],
                "expected_file_patterns": ["websocket", "stream", "audio", "realtime"],
                "domain": "networking",
                "difficulty": "medium",
            },
            {
                "query": "ADHD treatment frequency protocols",
                "expected_keywords": ["adhd", "frequency", "protocol", "treatment", "pattern"],
                "expected_file_patterns": ["adhd", "protocol", "frequency", "pattern"],
                "domain": "therapeutic",
                "difficulty": "hard",
            },
        ]

    def evaluate_retrieval_system(
        self,
        retrieval_system: EnhancedRAGRetrieval,
        system_name: str = "Enhanced RAG",
    ) -> EvaluationMetrics:
        """
        Comprehensive evaluation of a retrieval system.

        Args:
            retrieval_system: The RAG system to evaluate.
            system_name: Name for reporting.

        Returns:
            EvaluationMetrics with detailed performance data.
        """
        print(f"\n{'='*60}")
        print(f"Evaluating: {system_name}")
        print(f"{'='*60}")
        print(f"{'Query':<45} {'P@1':>5} {'P@3':>5} {'Recall':>7} {'ms':>7}")
        print(f"{'-'*60}")

        query_evaluations = []
        total_latency = 0

        for i, test_case in enumerate(self.test_queries, 1):
            start_time = time.time()
            results = retrieval_system.hybrid_search(test_case["query"], n_results=5)
            latency_ms = (time.time() - start_time) * 1000
            total_latency += latency_ms

            query_eval = self._evaluate_query_results(test_case, results, latency_ms)
            query_evaluations.append(query_eval)

            truncated = test_case["query"][:43]
            print(
                f"  {truncated:<43} "
                f"{query_eval.precision_at_k[1]:>5.2f} "
                f"{query_eval.precision_at_k[3]:>5.2f} "
                f"{query_eval.recall:>7.2f} "
                f"{latency_ms:>6.1f}ms"
            )

        metrics = self._calculate_aggregate_metrics(query_evaluations, total_latency)
        self._save_evaluation_results(system_name, query_evaluations, metrics)

        print(f"\n  Aggregate — P@1:{metrics.precision_at_1:.3f}  P@3:{metrics.precision_at_3:.3f}"
              f"  P@5:{metrics.precision_at_5:.3f}  MRR:{metrics.mrr:.3f}"
              f"  Avg latency:{metrics.avg_latency_ms:.1f}ms")

        return metrics

    def _evaluate_query_results(
        self,
        test_case: Dict[str, Any],
        results: List[SearchResult],
        latency_ms: float,
    ) -> QueryEvaluation:
        """
        Evaluate a single query's results.

        Args:
            test_case: Query dict with expected_keywords and expected_file_patterns.
            results: Retrieved search results.
            latency_ms: Query latency.

        Returns:
            QueryEvaluation with precision, recall, and reciprocal rank.
        """
        query = test_case["query"]
        expected_keywords = [kw.lower() for kw in test_case["expected_keywords"]]
        expected_patterns = [p.lower() for p in test_case["expected_file_patterns"]]

        retrieved_files = [result.file_path.lower() for result in results]

        relevance_scores = [
            self._calculate_relevance_score(result, expected_keywords, expected_patterns)
            for result in results
        ]

        relevant_threshold = 0.3
        relevant_positions = [i for i, score in enumerate(relevance_scores) if score > relevant_threshold]

        precision_at_k = {}
        for k in [1, 3, 5]:
            if k <= len(results):
                relevant_in_top_k = len([i for i in relevant_positions if i < k])
                precision_at_k[k] = relevant_in_top_k / k
            else:
                precision_at_k[k] = 0.0

        total_relevant = max(1, len(expected_keywords))
        relevant_found = len(relevant_positions)
        recall = min(1.0, relevant_found / total_relevant)

        first_relevant_rank = None
        for pos in relevant_positions:
            if first_relevant_rank is None or pos < first_relevant_rank:
                first_relevant_rank = pos + 1  # 1-indexed
        reciprocal_rank = 1.0 / first_relevant_rank if first_relevant_rank else 0.0

        return QueryEvaluation(
            query=query,
            expected_files=test_case["expected_file_patterns"],
            retrieved_files=retrieved_files,
            precision_at_k=precision_at_k,
            recall=recall,
            reciprocal_rank=reciprocal_rank,
            latency_ms=latency_ms,
            relevant_found=relevant_found,
            total_relevant=total_relevant,
        )

    def _calculate_relevance_score(
        self,
        result: SearchResult,
        expected_keywords: List[str],
        expected_patterns: List[str],
    ) -> float:
        """
        Calculate relevance score for a search result.

        Args:
            result: A retrieved search result.
            expected_keywords: Keywords the result should contain.
            expected_patterns: File path patterns the result should match.

        Returns:
            Float score in [0.0, 1.0].
        """
        score = 0.0

        content_lower = result.content.lower()
        keyword_matches = sum(1 for kw in expected_keywords if kw in content_lower)
        score += (keyword_matches / len(expected_keywords)) * 0.6 if expected_keywords else 0.0

        file_path_lower = result.file_path.lower()
        pattern_matches = sum(1 for pattern in expected_patterns if pattern.lower() in file_path_lower)
        score += (pattern_matches / len(expected_patterns)) * 0.4 if expected_patterns else 0.0

        return min(1.0, score)

    def _calculate_aggregate_metrics(
        self,
        query_evaluations: List[QueryEvaluation],
        total_latency: float,
    ) -> EvaluationMetrics:
        """
        Calculate aggregate metrics across all queries.

        Args:
            query_evaluations: Per-query evaluation results.
            total_latency: Sum of all query latencies in ms.

        Returns:
            EvaluationMetrics aggregate.
        """
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
            total_queries=len(query_evaluations),
        )

    def _save_evaluation_results(
        self,
        system_name: str,
        query_evaluations: List[QueryEvaluation],
        metrics: EvaluationMetrics,
    ):
        """
        Save detailed evaluation results to JSON.

        Args:
            system_name: Name of the evaluated system.
            query_evaluations: Per-query results.
            metrics: Aggregate metrics.
        """
        results = {
            "system_name": system_name,
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "aggregate_metrics": asdict(metrics),
            "query_evaluations": [asdict(qe) for qe in query_evaluations],
        }

        output_dir = Path(__file__).parent / "evaluation_results"
        output_dir.mkdir(exist_ok=True)

        filename = f"evaluation_{system_name.lower().replace(' ', '_')}_{int(time.time())}.json"
        output_file = output_dir / filename

        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2)

        print(f"  Results saved to {output_file}")

    def compare_systems(
        self,
        systems: List[Tuple[EnhancedRAGRetrieval, str]],
    ) -> Dict[str, EvaluationMetrics]:
        """
        Compare multiple RAG systems side by side.

        Args:
            systems: List of (retrieval_system, name) tuples.

        Returns:
            Dict mapping system name to its EvaluationMetrics.
        """
        results = {}
        for system, name in systems:
            metrics = self.evaluate_retrieval_system(system, name)
            results[name] = metrics

        self._print_comparison_table(results)
        return results

    def _print_comparison_table(self, results: Dict[str, EvaluationMetrics]):
        """
        Print a side-by-side comparison table of system performance.

        Args:
            results: Dict of system name → EvaluationMetrics.
        """
        print(f"\n{'='*75}")
        print("SYSTEM COMPARISON")
        print(f"{'='*75}")
        print(
            f"{'System':<22} {'P@1':>6} {'P@3':>6} {'P@5':>6} "
            f"{'Recall':>8} {'MRR':>6} {'Latency':>10}"
        )
        print(f"{'-'*75}")

        for system_name, metrics in results.items():
            print(
                f"{system_name:<22} "
                f"{metrics.precision_at_1:<6.3f} "
                f"{metrics.precision_at_3:<6.3f} "
                f"{metrics.precision_at_5:<6.3f} "
                f"{metrics.recall_at_5:<8.3f} "
                f"{metrics.mrr:<6.3f} "
                f"{metrics.avg_latency_ms:<10.1f}ms"
            )

        if results:
            best_name, best_metrics = max(results.items(), key=lambda x: x[1].precision_at_3)
            print(f"\n  Best overall (P@3): {best_name} — {best_metrics.precision_at_3:.3f}")

            if best_metrics.precision_at_3 > 0.7:
                print("  Rating: EXCELLENT — production ready")
            elif best_metrics.precision_at_3 > 0.5:
                print("  Rating: GOOD — suitable for most queries, consider tuning chunking")
            else:
                print("  Rating: NEEDS WORK — consider re-chunking or upgrading embedding model")


def run_comprehensive_evaluation():
    """Run comprehensive evaluation of all configured RAG systems."""
    print("EBL RAG Evaluation Framework")
    print(f"{'='*60}")

    evaluator = RAGEvaluator()
    systems_to_test = []

    try:
        system1 = EnhancedRAGRetrieval(embedding_model="all-MiniLM-L6-v2")
        systems_to_test.append((system1, "MiniLM-L6-v2"))
        print("Loaded system: MiniLM-L6-v2")
    except Exception as e:
        print(f"Warning: Could not load MiniLM-L6-v2 system: {e}")

    try:
        system2 = EnhancedRAGRetrieval(embedding_model="all-mpnet-base-v2")
        systems_to_test.append((system2, "MPNet-Base-v2"))
        print("Loaded system: MPNet-Base-v2")
    except Exception as e:
        print(f"Warning: Could not load MPNet-Base-v2 system: {e}")

    if systems_to_test:
        comparison_results = evaluator.compare_systems(systems_to_test)
        best_precision = max(comparison_results.items(), key=lambda x: x[1].precision_at_3)
        best_speed = min(comparison_results.items(), key=lambda x: x[1].avg_latency_ms)

        print(f"\nRecommendation:")
        print(f"  Best accuracy: {best_precision[0]} (P@3={best_precision[1].precision_at_3:.3f})")
        print(f"  Fastest:       {best_speed[0]} ({best_speed[1].avg_latency_ms:.1f}ms avg)")

        if best_precision[1].precision_at_3 > 0.7:
            print("  → Deploy the accuracy-optimized model for best user experience")
        elif best_precision[1].precision_at_3 > 0.5:
            print("  → Either model is viable; prefer speed in production")
        else:
            print("  → Re-index with improved chunking before deployment")
    else:
        print("No RAG systems could be loaded. Check dependencies:")
        print("  pip install -r .claude/rag/rag_requirements.txt")
        print("  Then run: python .claude/rag/scripts/setup_rag.py")


if __name__ == "__main__":
    run_comprehensive_evaluation()
