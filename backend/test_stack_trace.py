"""
Unit tests for stack trace parser

Tests Python and Node/TypeScript stack trace parsing functionality.
"""

import pytest
from utils.stack_trace import (
    parse_stack_trace,
    StackFrame,
    format_frame,
    _is_python_traceback,
    _parse_python_traceback,
    _parse_node_stack_trace,
)


class TestPythonTracebackDetection:
    """Test Python traceback detection"""

    def test_detects_python_traceback(self):
        """Should detect standard Python traceback format"""
        trace = """
Traceback (most recent call last):
  File "main.py", line 42, in run_server
    server.start()
        """
        assert _is_python_traceback(trace) is True

    def test_detects_python_file_format(self):
        """Should detect Python File format even without full traceback"""
        trace = 'File "server.py", line 15, in start'
        assert _is_python_traceback(trace) is True

    def test_rejects_non_python_traces(self):
        """Should not detect Node.js traces as Python"""
        trace = """
Error: Cannot find module
    at Function.Module._resolveFilename (loader.js:636:15)
        """
        # Missing Python-specific patterns
        result = _is_python_traceback(trace)
        # Should be False or at least not strongly Python
        # (the function checks for 'File "' which isn't in this trace)
        assert result is False


class TestPythonTracebackParsing:
    """Test Python traceback parsing"""

    def test_parses_simple_traceback(self):
        """Should parse a simple Python traceback"""
        trace = """
Traceback (most recent call last):
  File "main.py", line 42, in run_server
    server.start()
  File "server.py", line 15, in start
    raise ValueError("Port in use")
        """
        frames = _parse_python_traceback(trace)

        assert len(frames) == 2

        assert frames[0].file_path == "main.py"
        assert frames[0].line == 42
        assert frames[0].function == "run_server"
        assert frames[0].language == "python"
        assert frames[0].column is None

        assert frames[1].file_path == "server.py"
        assert frames[1].line == 15
        assert frames[1].function == "start"

    def test_parses_traceback_without_function(self):
        """Should parse traceback lines without function names"""
        trace = 'File "/home/user/script.py", line 123'
        frames = _parse_python_traceback(trace)

        assert len(frames) == 1
        assert frames[0].file_path == "/home/user/script.py"
        assert frames[0].line == 123
        assert frames[0].function is None

    def test_parses_complex_file_paths(self):
        """Should handle complex file paths with spaces and special chars"""
        trace = 'File "/home/user/My Projects/app/server.py", line 99, in main'
        frames = _parse_python_traceback(trace)

        assert len(frames) == 1
        assert frames[0].file_path == "/home/user/My Projects/app/server.py"
        assert frames[0].line == 99
        assert frames[0].function == "main"

    def test_parses_real_world_traceback(self):
        """Should parse real-world EBL traceback"""
        trace = """
Traceback (most recent call last):
  File "/home/user/ElectronicBeatLabs/backend/main.py", line 142, in startup
    initialize_rag(project_root, use_enhanced=True)
  File "/home/user/ElectronicBeatLabs/backend/routes/rag_routes.py", line 67, in initialize_rag
    chunks_path = Path(__file__).resolve().parents[1] / "rag" / "ebl_chunks.json"
  File "/usr/lib/python3.11/pathlib.py", line 1051, in resolve
    s = os.path.realpath(self, strict=strict)
FileNotFoundError: [Errno 2] No such file or directory
        """
        frames = _parse_python_traceback(trace)

        assert len(frames) == 3
        assert "backend/main.py" in frames[0].file_path
        assert frames[0].line == 142
        assert frames[0].function == "startup"

        assert "rag_routes.py" in frames[1].file_path
        assert frames[1].line == 67

        assert "pathlib.py" in frames[2].file_path


class TestNodeStackTraceParsing:
    """Test Node.js/TypeScript stack trace parsing"""

    def test_parses_node_with_function(self):
        """Should parse Node.js trace with function names"""
        trace = """
Error: Cannot find module 'express'
    at Function.Module._resolveFilename (loader.js:636:15)
    at Object.<anonymous> (/home/user/app/server.js:5:17)
        """
        frames = _parse_node_stack_trace(trace)

        # Should have 1 frame (loader.js is internal and skipped)
        assert len(frames) == 1

        assert frames[0].file_path == "/home/user/app/server.js"
        assert frames[0].line == 5
        assert frames[0].column == 17
        assert frames[0].function == "Object.<anonymous>"
        assert frames[0].language == "node"

    def test_parses_typescript_trace(self):
        """Should parse TypeScript stack traces"""
        trace = """
TypeError: Cannot read property 'frequency' of undefined
    at AudioEngine.generateBinauralBeat (/home/user/src/hooks/useAudioEngine.ts:234:15)
    at AudioEngine.start (/home/user/src/hooks/useAudioEngine.ts:187:9)
        """
        frames = _parse_node_stack_trace(trace)

        assert len(frames) == 2

        assert frames[0].file_path == "/home/user/src/hooks/useAudioEngine.ts"
        assert frames[0].line == 234
        assert frames[0].column == 15
        assert frames[0].function == "AudioEngine.generateBinauralBeat"
        assert frames[0].language == "typescript"

        assert frames[1].line == 187
        assert frames[1].language == "typescript"

    def test_parses_tsx_files(self):
        """Should detect .tsx files as TypeScript"""
        trace = "    at handleStart (/home/user/src/components/ControlPanel.tsx:56:12)"
        frames = _parse_node_stack_trace(trace)

        assert len(frames) == 1
        assert frames[0].file_path == "/home/user/src/components/ControlPanel.tsx"
        assert frames[0].language == "typescript"

    def test_parses_anonymous_functions(self):
        """Should handle traces without explicit function names"""
        trace = "    at /home/user/app/index.js:42:10"
        frames = _parse_node_stack_trace(trace)

        assert len(frames) == 1
        assert frames[0].file_path == "/home/user/app/index.js"
        assert frames[0].line == 42
        assert frames[0].column == 10
        assert frames[0].function is None

    def test_skips_internal_node_modules(self):
        """Should skip internal Node.js modules"""
        trace = """
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    at processTicksAndRejections (internal/process/task_queues.js:93:5)
    at /home/user/app/server.js:10:5
        """
        frames = _parse_node_stack_trace(trace)

        # Should only have the user file, not internal modules
        assert len(frames) == 1
        assert frames[0].file_path == "/home/user/app/server.js"


class TestUnifiedStackTraceParsing:
    """Test the main parse_stack_trace function"""

    def test_auto_detects_python(self):
        """Should automatically detect and parse Python tracebacks"""
        trace = """
Traceback (most recent call last):
  File "main.py", line 10, in <module>
    do_something()
        """
        frames = parse_stack_trace(trace)

        assert len(frames) == 1
        assert frames[0].file_path == "main.py"
        assert frames[0].language == "python"

    def test_auto_detects_node(self):
        """Should automatically detect and parse Node.js traces"""
        trace = """
Error: Something went wrong
    at main (/home/user/app.js:42:10)
        """
        frames = parse_stack_trace(trace)

        assert len(frames) == 1
        assert frames[0].file_path == "/home/user/app.js"
        assert frames[0].language == "node"

    def test_handles_empty_trace(self):
        """Should handle empty stack traces gracefully"""
        frames = parse_stack_trace("")
        assert frames == []

    def test_handles_invalid_trace(self):
        """Should handle invalid/unrecognized traces"""
        frames = parse_stack_trace("This is just random text\nNot a stack trace\n")
        # Should return empty list or handle gracefully
        assert isinstance(frames, list)


class TestFrameFormatting:
    """Test StackFrame formatting"""

    def test_formats_complete_frame(self):
        """Should format a complete frame with all fields"""
        frame = StackFrame(
            file_path="src/server.ts",
            line=42,
            column=15,
            function="handleRequest",
            language="typescript"
        )
        formatted = format_frame(frame)

        assert "src/server.ts" in formatted
        assert "line 42" in formatted
        assert "col 15" in formatted
        assert "in handleRequest" in formatted
        assert "(typescript)" in formatted

    def test_formats_minimal_frame(self):
        """Should format frame with minimal fields"""
        frame = StackFrame(
            file_path="main.py",
            line=10,
            language="python"
        )
        formatted = format_frame(frame)

        assert "main.py" in formatted
        assert "line 10" in formatted
        assert "(python)" in formatted
        assert "col" not in formatted  # No column
        assert "in" not in formatted  # No function

    def test_formats_frame_without_column(self):
        """Should format Python-style frame without column"""
        frame = StackFrame(
            file_path="backend/routes.py",
            line=123,
            function="get_data",
            language="python"
        )
        formatted = format_frame(frame)

        assert "backend/routes.py" in formatted
        assert "line 123" in formatted
        assert "in get_data" in formatted
        assert "col" not in formatted


class TestEdgeCases:
    """Test edge cases and error conditions"""

    def test_handles_multiline_error_messages(self):
        """Should parse traces with multiline error messages"""
        trace = """
Traceback (most recent call last):
  File "app.py", line 10, in main
    process_data(data)
  File "processor.py", line 55, in process_data
    validate(data)
ValueError: Invalid data format:
  Expected dict, got list
  Check the input schema
        """
        frames = parse_stack_trace(trace)

        assert len(frames) == 2
        assert frames[0].file_path == "app.py"
        assert frames[1].file_path == "processor.py"

    def test_handles_windows_paths(self):
        """Should parse Windows-style paths"""
        trace = r'File "C:\Users\user\app\main.py", line 42, in run'
        frames = parse_stack_trace(trace)

        assert len(frames) == 1
        assert frames[0].file_path == r"C:\Users\user\app\main.py"

    def test_handles_relative_paths(self):
        """Should parse relative paths"""
        trace = """
    at ./src/components/AudioEngine.tsx:142:23
    at ../utils/helpers.ts:56:10
        """
        frames = parse_stack_trace(trace)

        assert len(frames) == 2
        assert "./src/components/AudioEngine.tsx" in frames[0].file_path
        assert "../utils/helpers.ts" in frames[1].file_path

    def test_handles_mixed_trace_formats(self):
        """Should handle traces with mixed content"""
        # This shouldn't happen in real life, but test robustness
        trace = """
Some random log output
Traceback (most recent call last):
  File "test.py", line 5, in main
    raise Exception()
More random output
        """
        frames = parse_stack_trace(trace)

        # Should still find the Python frame
        assert len(frames) >= 1
        assert any(f.file_path == "test.py" for f in frames)


class TestIntegrationWithRAGEndpoint:
    """Test integration scenarios with the RAG error-context endpoint"""

    def test_provides_expected_attributes(self):
        """Should provide all attributes expected by rag_routes.py"""
        trace = """
Traceback (most recent call last):
  File "/home/user/ElectronicBeatLabs/backend/main.py", line 142, in startup
    initialize_rag()
        """
        frames = parse_stack_trace(trace)

        # rag_routes.py expects these attributes
        for frame in frames:
            assert hasattr(frame, 'file_path')
            assert hasattr(frame, 'line')
            assert hasattr(frame, 'column')  # Can be None
            assert hasattr(frame, 'function')  # Can be None
            assert hasattr(frame, 'language')

            assert isinstance(frame.file_path, str)
            assert isinstance(frame.line, int)
            assert isinstance(frame.language, str)

    def test_ebl_backend_trace(self):
        """Should parse typical EBL backend error trace"""
        trace = """
Traceback (most recent call last):
  File "/home/user/ElectronicBeatLabs/backend/routes/rag_routes.py", line 67, in initialize_rag
    chunks_path = Path(__file__).resolve().parents[1] / "rag" / "ebl_chunks.json"
  File "/home/user/ElectronicBeatLabs/backend/rag/enhanced_retrieval.py", line 89, in __init__
    self.load_chunks()
FileNotFoundError: ebl_chunks.json not found
        """
        frames = parse_stack_trace(trace)

        assert len(frames) == 2
        assert all(f.language == "python" for f in frames)
        assert "rag_routes.py" in frames[0].file_path
        assert "enhanced_retrieval.py" in frames[1].file_path

    def test_ebl_frontend_trace(self):
        """Should parse typical EBL frontend error trace"""
        trace = """
TypeError: Cannot read property 'start' of undefined
    at AudioEngine.initialize (/home/user/ElectronicBeatLabs/src/hooks/useAudioEngine.ts:187:9)
    at useBackendAudioEngine (/home/user/ElectronicBeatLabs/src/hooks/useBackendAudioEngine.ts:123:15)
    at ControlPanel (/home/user/ElectronicBeatLabs/src/components/ControlPanel.tsx:56:12)
        """
        frames = parse_stack_trace(trace)

        assert len(frames) == 3
        assert all(f.language == "typescript" for f in frames)
        assert all(f.column is not None for f in frames)

        # Verify paths are from EBL project
        assert any("useAudioEngine.ts" in f.file_path for f in frames)
        assert any("ControlPanel.tsx" in f.file_path for f in frames)


# Run tests if executed directly
if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
