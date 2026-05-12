#!/usr/bin/env python3
"""
EBL RAG CLI — Auto-indexing and query tool

Commands:
  index     Index the project into ChromaDB (skip if already indexed)
  reindex   Force full re-index, clearing existing data
  status    Show index stats and last-indexed info
  search    Run a semantic search query
  evaluate  Run the full evaluation suite

Usage:
  python .claude/rag/rag_cli.py index
  python .claude/rag/rag_cli.py reindex
  python .claude/rag/rag_cli.py status
  python .claude/rag/rag_cli.py search "binaural beat calculator"
  python .claude/rag/rag_cli.py evaluate
"""

import sys
import os
import json
import time
import argparse
from pathlib import Path

# Force UTF-8 stdout on Windows so check marks / em dashes don't crash cp1252 consoles
if sys.stdout.encoding and sys.stdout.encoding.lower() not in ("utf-8", "utf8"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except (AttributeError, OSError):
        pass

# Ensure the rag package is importable regardless of working directory
_RAG_DIR = Path(__file__).resolve().parent
_PROJECT_ROOT = _RAG_DIR.parent.parent
sys.path.insert(0, str(_RAG_DIR))
sys.path.insert(0, str(_PROJECT_ROOT))

CHROMA_DB_DIR = _RAG_DIR / "chroma_db"
CHUNKS_FILE = _RAG_DIR / "data" / "ebl_chunks.json"
INDEX_META_FILE = _RAG_DIR / "data" / "index_meta.json"


def _load_index_meta() -> dict:
    """Load indexing metadata (last indexed time, chunk count)."""
    if INDEX_META_FILE.exists():
        with open(INDEX_META_FILE, "r") as f:
            return json.load(f)
    return {}


def _save_index_meta(meta: dict):
    """Persist indexing metadata."""
    INDEX_META_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(INDEX_META_FILE, "w") as f:
        json.dump(meta, f, indent=2)


def _get_pipeline():
    """
    Instantiate the CloudRAGPipeline with local ChromaDB.

    Returns:
        CloudRAGPipeline configured for the EBL project root.
    """
    from vector_database import CloudRAGPipeline, VectorProvider
    return CloudRAGPipeline(
        project_root=str(_PROJECT_ROOT),
        provider=VectorProvider.CHROMA,
        persist_directory=str(CHROMA_DB_DIR),
    )


def cmd_status():
    """Print current index status without loading the embedding model."""
    print("EBL RAG Index Status")
    print("=" * 50)

    meta = _load_index_meta()

    if meta:
        print(f"  Last indexed : {meta.get('timestamp', 'unknown')}")
        print(f"  Chunks stored: {meta.get('chunk_count', 'unknown')}")
        print(f"  Embedding    : {meta.get('embedding_model', 'all-MiniLM-L6-v2')}")
        print(f"  Provider     : {meta.get('provider', 'ChromaDB (local)')}")
    else:
        print("  Not yet indexed — run:  python .claude/rag/rag_cli.py index")

    print()
    print(f"  Chunks JSON  : {CHUNKS_FILE} ({'[OK] exists' if CHUNKS_FILE.exists() else '[--] missing'})")
    print(f"  ChromaDB dir : {CHROMA_DB_DIR} ({'[OK] exists' if CHROMA_DB_DIR.exists() else '[--] missing'})")

    # Check dependencies
    deps = {"chromadb": False, "sentence_transformers": False}
    for pkg in deps:
        try:
            __import__(pkg)
            deps[pkg] = True
        except ImportError:
            pass

    print()
    print("  Dependencies:")
    for pkg, ok in deps.items():
        status = "[OK] installed" if ok else "[--] missing  (pip install -r .claude/rag/rag_requirements.txt)"
        print(f"    {pkg:<25} {status}")


def cmd_index(force: bool = False):
    """
    Index the project into ChromaDB.

    Args:
        force: If True, clears the existing index before re-indexing.
    """
    action = "Re-indexing" if force else "Indexing"
    print(f"{action} EBL project into ChromaDB...")
    print(f"  Project root : {_PROJECT_ROOT}")
    print(f"  ChromaDB dir : {CHROMA_DB_DIR}")
    print()

    start = time.time()
    try:
        pipeline = _get_pipeline()
    except ImportError as e:
        print(f"Error: Missing dependency — {e}")
        print("Install with: pip install -r .claude/rag/rag_requirements.txt")
        sys.exit(1)

    pipeline.index_project(force_reindex=force)

    elapsed = time.time() - start
    stats = pipeline.vector_db.get_stats()
    chunk_count = stats.get("total_documents", 0)

    meta = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "chunk_count": chunk_count,
        "embedding_model": "all-MiniLM-L6-v2",
        "provider": stats.get("provider", "ChromaDB (local)"),
        "elapsed_seconds": round(elapsed, 2),
    }
    _save_index_meta(meta)

    print(f"Done in {elapsed:.1f}s — {chunk_count} chunks indexed.")
    print(f"Run searches with: python .claude/rag/rag_cli.py search \"your query\"")


def cmd_search(query: str, n: int = 5):
    """
    Run a semantic search against the index.

    Args:
        query: Natural language search query.
        n: Number of results to return.
    """
    meta = _load_index_meta()
    if not meta:
        print("Index is empty. Run:  python .claude/rag/rag_cli.py index")
        sys.exit(1)

    print(f"Searching: \"{query}\"")
    print(f"{'='*60}")

    try:
        pipeline = _get_pipeline()
    except ImportError as e:
        print(f"Error: Missing dependency — {e}")
        sys.exit(1)

    start = time.time()
    results = pipeline.query(query, n_results=n)
    elapsed = (time.time() - start) * 1000

    hits = results.get("results", [])
    if not hits:
        print("No results found.")
        return

    for i, hit in enumerate(hits, 1):
        file_path = hit.get("metadata", {}).get("file_path", "unknown")
        score = hit.get("similarity_score", 0)
        chunk_type = hit.get("metadata", {}).get("chunk_type", "")
        start_line = hit.get("metadata", {}).get("start_line", "")
        content_preview = hit.get("content", "")[:120].replace("\n", " ")

        print(f"\n[{i}] {file_path}:{start_line}  ({chunk_type})  score={score:.3f}")
        print(f"    {content_preview}...")

    print(f"\n  {len(hits)} results in {elapsed:.1f}ms")


def cmd_evaluate():
    """Run the full RAG evaluation suite against indexed data."""
    meta = _load_index_meta()
    if not meta:
        print("Index is empty. Run:  python .claude/rag/rag_cli.py index")
        sys.exit(1)

    try:
        from evaluation_framework import run_comprehensive_evaluation
    except ImportError as e:
        print(f"Error loading evaluation framework: {e}")
        sys.exit(1)

    run_comprehensive_evaluation()


def _check_and_auto_index():
    """
    Auto-index if ChromaDB is empty or missing.
    Called on every CLI invocation so the index is always ready.
    """
    if not CHROMA_DB_DIR.exists() or not _load_index_meta():
        print("ChromaDB index not found — running auto-index...")
        cmd_index(force=False)


def main():
    """Entry point for the EBL RAG CLI."""
    parser = argparse.ArgumentParser(
        description="EBL RAG CLI — semantic code search and index management",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    subparsers.add_parser("index", help="Index project (skip if already done)")
    subparsers.add_parser("reindex", help="Force full re-index")
    subparsers.add_parser("status", help="Show index status and dependency check")
    subparsers.add_parser("evaluate", help="Run evaluation suite")

    search_parser = subparsers.add_parser("search", help="Semantic search query")
    search_parser.add_argument("query", help="Search query string")
    search_parser.add_argument("-n", type=int, default=5, help="Number of results (default: 5)")

    args = parser.parse_args()

    if args.command == "status":
        cmd_status()
    elif args.command == "index":
        _check_and_auto_index()
    elif args.command == "reindex":
        cmd_index(force=True)
    elif args.command == "search":
        _check_and_auto_index()
        cmd_search(args.query, n=args.n)
    elif args.command == "evaluate":
        _check_and_auto_index()
        cmd_evaluate()


if __name__ == "__main__":
    main()
