"""
Stack Trace Parser
Parses Python and JavaScript stack traces to extract file paths, line numbers, and function names.
"""

import re
from typing import List, Dict, Any, Optional
from dataclasses import dataclass


@dataclass
class StackFrame:
    """Represents a single frame in a stack trace"""
    file_path: str
    line_number: Optional[int] = None
    function_name: Optional[str] = None
    code_snippet: Optional[str] = None


def parse_stack_trace(stack_trace: str) -> List[StackFrame]:
    """
    Parse a stack trace string and extract file paths, line numbers, and function names.

    Supports:
    - Python stack traces (traceback format)
    - JavaScript/TypeScript stack traces (Chrome/Node format)

    Args:
        stack_trace: The raw stack trace string

    Returns:
        List of StackFrame objects with extracted information

    Examples:
        Python traceback:
        ```
        File "backend/main.py", line 42, in startup
            initialize_rag(project_root)
        File "backend/routes/rag_routes.py", line 65, in initialize_rag
            rag_system = EnhancedRAGRetrieval(chunks_file=str(chunks_path))
        ```

        JavaScript stack trace:
        ```
        Error: Failed to load
            at Object.<anonymous> (/home/user/app/src/index.ts:15:7)
            at Module._compile (internal/modules/cjs/loader.js:1063:30)
        ```
    """
    frames: List[StackFrame] = []

    if not stack_trace or not stack_trace.strip():
        return frames

    lines = stack_trace.split('\n')

    # Python traceback pattern: File "path/to/file.py", line 42, in function_name
    python_pattern = re.compile(
        r'File\s+"([^"]+)"\s*,\s*line\s+(\d+)(?:\s*,\s*in\s+(\S+))?'
    )

    # JavaScript/TypeScript pattern: at function_name (path/to/file.ts:42:7)
    js_pattern = re.compile(
        r'at\s+(?:([^\s(]+)\s+)?\(?([^):\s]+):(\d+):(\d+)\)?'
    )

    # Alternative Python pattern without quotes: in file.py:42
    alt_python_pattern = re.compile(
        r'(?:in\s+)?([^\s]+\.py):(\d+)'
    )

    i = 0
    while i < len(lines):
        line = lines[i].strip()

        # Try Python pattern first
        python_match = python_pattern.search(line)
        if python_match:
            file_path = python_match.group(1)
            line_number = int(python_match.group(2))
            function_name = python_match.group(3) if python_match.group(3) else None

            # Next line might contain code snippet
            code_snippet = None
            if i + 1 < len(lines):
                next_line = lines[i + 1].strip()
                if next_line and not next_line.startswith('File'):
                    code_snippet = next_line
                    i += 1  # Skip the code snippet line

            frames.append(StackFrame(
                file_path=file_path,
                line_number=line_number,
                function_name=function_name,
                code_snippet=code_snippet
            ))
            i += 1
            continue

        # Try JavaScript pattern
        js_match = js_pattern.search(line)
        if js_match:
            function_name = js_match.group(1)
            file_path = js_match.group(2)
            line_number = int(js_match.group(3))

            frames.append(StackFrame(
                file_path=file_path,
                line_number=line_number,
                function_name=function_name
            ))
            i += 1
            continue

        # Try alternative Python pattern
        alt_match = alt_python_pattern.search(line)
        if alt_match:
            file_path = alt_match.group(1)
            line_number = int(alt_match.group(2))

            frames.append(StackFrame(
                file_path=file_path,
                line_number=line_number
            ))
            i += 1
            continue

        i += 1

    return frames


def parse_stack_trace_to_dict(stack_trace: str) -> List[Dict[str, Any]]:
    """
    Parse stack trace and return as list of dictionaries.

    Args:
        stack_trace: The raw stack trace string

    Returns:
        List of dictionaries with frame information
    """
    frames = parse_stack_trace(stack_trace)
    return [
        {
            'file_path': frame.file_path,
            'line_number': frame.line_number,
            'function_name': frame.function_name,
            'code_snippet': frame.code_snippet
        }
        for frame in frames
    ]


def extract_file_paths(stack_trace: str) -> List[str]:
    """
    Extract just the file paths from a stack trace.

    Args:
        stack_trace: The raw stack trace string

    Returns:
        List of file paths mentioned in the stack trace
    """
    frames = parse_stack_trace(stack_trace)
    return [frame.file_path for frame in frames if frame.file_path]


# Backwards compatibility aliases
def get_stack_trace_files(stack_trace: str) -> List[str]:
    """Alias for extract_file_paths for backwards compatibility"""
    return extract_file_paths(stack_trace)
