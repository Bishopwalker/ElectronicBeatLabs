// RAG Console — Browser-side introspection for the EBL RAG pipeline.
//
// Auto-runs at startup (prints a styled banner to the browser console),
// polls the backend every 30s to detect re-indexing, and exposes two
// global helpers on `window`:
//
//   window.ragStatus()        — reprint the current status to the console
//   window.showRAGPipeline()  — open the live pipeline diagram in a new tab

interface RAGStatus {
  indexed: boolean;
  chunk_count: number;
  embedding_model: string;
  provider: string;
  last_indexed: string | null;
  age_seconds: number | null;
  elapsed_index_seconds: number | null;
  dependencies: Record<string, boolean>;
  all_deps_ok: boolean;
  chunks_summary: {
    total_chunks: number;
    chunk_types: Record<string, number>;
    unique_files: number;
    audio_term_chunks: number;
  };
  chroma_dir_exists: boolean;
  chunks_file_exists: boolean;
}

const STATUS_ENDPOINT = "/api/rag/status";
const DIAGRAM_ENDPOINT = "/api/rag/pipeline-diagram";
const POLL_INTERVAL_MS = 30_000;

let _lastSnapshot: RAGStatus | null = null;
let _pollHandle: number | null = null;

function _formatAge(seconds: number | null): string {
  if (seconds == null) return "never";
  if (seconds < 60) return `${Math.round(seconds)}s ago`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)}h ago`;
  return `${Math.round(seconds / 86400)}d ago`;
}

async function _fetchStatus(): Promise<RAGStatus | null> {
  try {
    const res = await fetch(STATUS_ENDPOINT);
    if (!res.ok) return null;
    return (await res.json()) as RAGStatus;
  } catch {
    return null;
  }
}

function _printStatus(status: RAGStatus | null, header: string = "EBL RAG Status"): void {
  if (!status) {
    console.log(
      `%c⚠ ${header}\n%cBackend unreachable or RAG status endpoint not yet available.`,
      "color:#f0883e;font-size:14px;font-weight:bold",
      "color:#6e7681;font-size:11px",
    );
    return;
  }

  const indexedColor = status.indexed ? "#3fb950" : "#f85149";
  const indexedIcon = status.indexed ? "✓" : "✗";
  const depsColor = status.all_deps_ok ? "#3fb950" : "#e3b341";
  const ageLabel = _formatAge(status.age_seconds);

  console.groupCollapsed(
    `%c⚡ ${header} %c${indexedIcon} ${status.indexed ? "INDEXED" : "NOT INDEXED"} %c· ${status.chunk_count} chunks · ${ageLabel}`,
    "color:#58a6ff;font-size:14px;font-weight:bold",
    `color:${indexedColor};font-size:12px;font-weight:bold`,
    "color:#6e7681;font-size:11px",
  );

  console.log("%cIndex", "color:#bc8cff;font-weight:bold");
  console.table({
    "Chunks indexed":   status.chunk_count,
    "Unique files":     status.chunks_summary.unique_files,
    "Audio-term chunks": status.chunks_summary.audio_term_chunks,
    "Embedding model":  status.embedding_model,
    "Provider":         status.provider,
    "Last indexed":     status.last_indexed ?? "never",
    "Age":              ageLabel,
    "Index time (s)":   status.elapsed_index_seconds ?? "—",
  });

  if (Object.keys(status.chunks_summary.chunk_types).length > 0) {
    console.log("%cChunk types", "color:#bc8cff;font-weight:bold");
    console.table(status.chunks_summary.chunk_types);
  }

  console.log(
    `%cDependencies %c${status.all_deps_ok ? "all OK" : "missing some"}`,
    "color:#bc8cff;font-weight:bold",
    `color:${depsColor}`,
  );
  console.table(status.dependencies);

  console.log(
    "%cCommands\n" +
      "  %cwindow.ragStatus()%c        Reprint this report\n" +
      "  %cwindow.showRAGPipeline()%c  Open the live pipeline diagram",
    "color:#bc8cff;font-weight:bold",
    "color:#58a6ff;font-family:monospace",
    "color:#c9d1d9",
    "color:#58a6ff;font-family:monospace",
    "color:#c9d1d9",
  );

  console.groupEnd();
}

async function ragStatus(): Promise<void> {
  const status = await _fetchStatus();
  _printStatus(status, "EBL RAG Status (refresh)");
}

function showRAGPipeline(): void {
  window.open(DIAGRAM_ENDPOINT, "_blank", "noopener,noreferrer");
}

async function _pollForChanges(): Promise<void> {
  const current = await _fetchStatus();
  if (!current || !_lastSnapshot) {
    _lastSnapshot = current;
    return;
  }

  const reindexed =
    current.last_indexed !== _lastSnapshot.last_indexed ||
    current.chunk_count !== _lastSnapshot.chunk_count;

  if (reindexed) {
    console.log(
      "%c🔄 RAG index changed — re-printing status",
      "color:#e3b341;font-weight:bold;font-size:12px",
    );
    _printStatus(current, "EBL RAG Status (auto-update)");
  }
  _lastSnapshot = current;
}

/**
 * Attach the RAG console — auto-prints status, polls for changes,
 * and exposes window.ragStatus() / window.showRAGPipeline().
 */
export async function attachRAGConsole(): Promise<void> {
  // Expose globals first so the user can call them even if the initial fetch fails
  (window as unknown as { ragStatus: typeof ragStatus }).ragStatus = ragStatus;
  (window as unknown as { showRAGPipeline: typeof showRAGPipeline }).showRAGPipeline = showRAGPipeline;

  const status = await _fetchStatus();
  _lastSnapshot = status;
  _printStatus(status);

  if (_pollHandle != null) window.clearInterval(_pollHandle);
  _pollHandle = window.setInterval(_pollForChanges, POLL_INTERVAL_MS);
}
