"""
Stack Trace Parser - Parse Python and Node/TypeScript stack traces

Supports:
- Python traceback format
- Node.js/TypeScript stack traces
- Extracting file paths, line numbers, column numbers, and function names
"""

import re
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class StackFrame:
    """Represents a single frame in a stack trace"""
    file_path: str
    line: int
    column: Optional[int] = None
    function: Optional[str] = None
    language: str = "unknown"  # "python", "node", "typescript", or "unknown"


def parse_stack_trace(stack_trace: str) -> List[StackFrame]:
    """
    Parse a stack trace string and extract frame information.

    Supports Python and Node.js/TypeScript stack traces.

    Args:
        stack_trace: Raw stack trace text

    Returns:
        List of StackFrame objects

    Examples:
        Python traceback:
            Traceback (most recent call last):
              File "main.py", line 42, in run_server
                server.start()
              File "server.py", line 15, in start
                raise ValueError("Port already in use")

        Node.js stack trace:
            Error: Cannot find module 'express'
                at Function.Module._resolveFilename (internal/modules/cjs/loader.js:636:15)
                at processTicksAndRejections (internal/process/task_queues.js:93:5)
                at /home/user/app/server.ts:42:10
    """
    frames: List[StackFrame] = []

    # Detect stack trace type
    is_python = _is_python_traceback(stack_trace)

    if is_python:
        frames = _parse_python_traceback(stack_trace)
    else:
        # Try Node/TypeScript format
        frames = _parse_node_stack_trace(stack_trace)

    return frames


def _is_python_traceback(text: str) -> bool:
    """Check if the stack trace looks like a Python traceback"""
    python_indicators = [
        "Traceback (most recent call last)",
        'File "',
        ", line ",
        "raise ",
        "Error:",
        "Exception:",
    ]
    return any(indicator in text for indicator in python_indicators[:3])


def _parse_python_traceback(text: str) -> List[StackFrame]:
    """
    Parse Python traceback format.

    Pattern:
      File "path/to/file.py", line 123, in function_name
        code_context
    """
    frames: List[StackFrame] = []

    # Match: File "path", line 123, in func_name
    # Group 1: file path
    # Group 2: line number
    # Group 3: function name (optional)
    pattern = re.compile(
        r'File "([^"]+)", line (\d+)(?:, in (\S+))?',
        re.MULTILINE
    )

    for match in pattern.finditer(text):
        file_path = match.group(1)
        line = int(match.group(2))
        function = match.group(3) if match.group(3) else None

        frames.append(StackFrame(
            file_path=file_path,
            line=line,
            column=None,  # Python doesn't include column in standard tracebacks
            function=function,
            language="python"
        ))

    return frames


def _parse_node_stack_trace(text: str) -> List[StackFrame]:
    """
    Parse Node.js/TypeScript stack trace format.

    Patterns:
      at functionName (/path/to/file.js:123:45)
      at /path/to/file.ts:42:10
      at Object.<anonymous> (/path/to/file.js:5:1)
      at Module._compile (internal/modules/cjs/loader.js:999:30)
    """
    frames: List[StackFrame] = []

    # Pattern 1: at [functionName] (path:line:col)
    # Pattern 2: at path:line:col
    # Group 1: optional function name
    # Group 2: file path
    # Group 3: line number
    # Group 4: column number
    pattern = re.compile(
        r'at (?:([^\(]+) )?\(?([^\:\(\)]+):(\d+):(\d+)\)?',
        re.MULTILINE
    )

    for match in pattern.finditer(text):
        function_raw = match.group(1)
        file_path = match.group(2).strip()
        line = int(match.group(3))
        column = int(match.group(4))

        # Clean up function name
        function = None
        if function_raw:
            function = function_raw.strip()
            # Remove internal Node.js modules unless they're useful
            if function.startswith("internal/") or function.startswith("node:"):
                continue

        # Skip internal Node.js files
        if file_path.startswith("internal/") or file_path.startswith("node:"):
            continue

        # Detect language from file extension
        language = "node"
        if file_path.endswith(".ts") or file_path.endswith(".tsx"):
            language = "typescript"
        elif file_path.endswith(".js") or file_path.endswith(".jsx"):
            language = "node"

        frames.append(StackFrame(
            file_path=file_path,
            line=line,
            column=column,
            function=function,
            language=language
        ))

    return frames


def format_frame(frame: StackFrame) -> str:
    """
    Format a StackFrame as a human-readable string.

    Args:
        frame: StackFrame to format

    Returns:
        Formatted string representation
    """
    parts = [frame.file_path]

    if frame.line:
        parts.append(f"line {frame.line}")

    if frame.column:
        parts.append(f"col {frame.column}")

    if frame.function:
        parts.append(f"in {frame.function}")

    return " ".join(parts) + f" ({frame.language})"


# Example usage and testing
if __name__ == "__main__":
    # Test Python traceback
    python_trace = """
Traceback (most recent call last):
  File "/home/user/ElectronicBeatLabs/backend/main.py", line 142, in startup
    initialize_rag(project_root, use_enhanced=True)
  File "/home/user/ElectronicBeatLabs/backend/routes/rag_routes.py", line 67, in initialize_rag
    chunks_path = Path(__file__).resolve().parents[1] / "rag" / "ebl_chunks.json"
  File "/usr/lib/python3.11/pathlib.py", line 1051, in resolve
    s = os.path.realpath(self, strict=strict)
FileNotFoundError: [Errno 2] No such file or directory: 'ebl_chunks.json'
    """

    print("=== Python Traceback ===")
    py_frames = parse_stack_trace(python_trace)
    for frame in py_frames:
        print(f"  {format_frame(frame)}")

    # Test Node.js stack trace
    node_trace = """
Error: Cannot find module 'express'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:636:15)
    at Function.Module._load (internal/modules/cjs/loader.js:562:25)
    at Module.require (internal/modules/cjs/helpers.js:12:17)
    at require (internal/modules/cjs/helpers.js:74:18)
    at Object.<anonymous> (/home/user/ElectronicBeatLabs/src/server.ts:5:17)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
    at /home/user/ElectronicBeatLabs/src/components/AudioEngine.tsx:142:23
    """

    print("\n=== Node.js/TypeScript Stack Trace ===")
    node_frames = parse_stack_trace(node_trace)
    for frame in node_frames:
        print(f"  {format_frame(frame)}")

    # Test TypeScript stack trace
    ts_trace = """
TypeError: Cannot read property 'frequency' of undefined
    at AudioEngine.generateBinauralBeat (/home/user/ElectronicBeatLabs/src/hooks/useAudioEngine.ts:234:15)
    at AudioEngine.start (/home/user/ElectronicBeatLabs/src/hooks/useAudioEngine.ts:187:9)
    at handleStart (/home/user/ElectronicBeatLabs/src/components/ControlPanel.tsx:56:12)
    """

    print("\n=== TypeScript Stack Trace ===")
    ts_frames = parse_stack_trace(ts_trace)
    for frame in ts_frames:
        print(f"  {format_frame(frame)}")
