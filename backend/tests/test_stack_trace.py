"""
Unit tests for stack_trace parser
Tests Python and JavaScript stack trace parsing
"""

import pytest
from backend.utils.stack_trace import (
    parse_stack_trace,
    parse_stack_trace_to_dict,
    extract_file_paths,
    StackFrame
)


class TestPythonStackTraceParser:
    """Test parsing of Python stack traces"""

    def test_parse_standard_python_traceback(self):
        """Test parsing a standard Python traceback with quotes"""
        stack_trace = '''
        Traceback (most recent call last):
          File "backend/main.py", line 42, in startup
            initialize_rag(project_root)
          File "backend/routes/rag_routes.py", line 65, in initialize_rag
            rag_system = EnhancedRAGRetrieval(chunks_file=str(chunks_path))
        '''
        frames = parse_stack_trace(stack_trace)

        assert len(frames) == 2
        assert frames[0].file_path == "backend/main.py"
        assert frames[0].line_number == 42
        assert frames[0].function_name == "startup"

        assert frames[1].file_path == "backend/routes/rag_routes.py"
        assert frames[1].line_number == 65
        assert frames[1].function_name == "initialize_rag"

    def test_parse_python_with_code_snippets(self):
        """Test parsing Python traceback with code snippets on next line"""
        stack_trace = '''
          File "src/audio_engine.py", line 128, in process_audio
            result = self.apply_binaural_beat(carrier_freq, beat_freq)
          File "src/audio_engine.py", line 256, in apply_binaural_beat
            raise ValueError("Frequency out of range")
        '''
        frames = parse_stack_trace(stack_trace)

        assert len(frames) == 2
        assert frames[0].code_snippet == "result = self.apply_binaural_beat(carrier_freq, beat_freq)"
        assert frames[1].code_snippet == 'raise ValueError("Frequency out of range")'

    def test_parse_alternative_python_format(self):
        """Test parsing alternative Python format without quotes"""
        stack_trace = '''
        Error in audio_engine.py:128
        Error in frequency_generator.py:45
        '''
        frames = parse_stack_trace(stack_trace)

        assert len(frames) == 2
        assert frames[0].file_path == "audio_engine.py"
        assert frames[0].line_number == 128
        assert frames[1].file_path == "frequency_generator.py"
        assert frames[1].line_number == 45

    def test_parse_empty_stack_trace(self):
        """Test parsing empty or whitespace-only stack trace"""
        assert parse_stack_trace("") == []
        assert parse_stack_trace("   ") == []
        assert parse_stack_trace("\n\n") == []


class TestJavaScriptStackTraceParser:
    """Test parsing of JavaScript/TypeScript stack traces"""

    def test_parse_chrome_stack_trace(self):
        """Test parsing Chrome/V8 style stack trace"""
        stack_trace = '''
        Error: Failed to initialize audio
            at AudioEngine.init (/home/user/app/src/audio/engine.ts:42:15)
            at Object.<anonymous> (/home/user/app/src/index.ts:15:7)
            at Module._compile (internal/modules/cjs/loader.js:1063:30)
        '''
        frames = parse_stack_trace(stack_trace)

        assert len(frames) == 3
        assert frames[0].file_path == "/home/user/app/src/audio/engine.ts"
        assert frames[0].line_number == 42
        assert frames[0].function_name == "AudioEngine.init"

        assert frames[1].file_path == "/home/user/app/src/index.ts"
        assert frames[1].line_number == 15
        assert frames[1].function_name == "Object.<anonymous>"

    def test_parse_node_stack_trace_without_function(self):
        """Test parsing Node.js stack trace without function names"""
        stack_trace = '''
        Error: Module not found
            at (/home/user/project/build/main.js:1024:5)
        '''
        frames = parse_stack_trace(stack_trace)

        assert len(frames) == 1
        assert frames[0].file_path == "/home/user/project/build/main.js"
        assert frames[0].line_number == 1024


class TestEdgeCases:
    """Test edge cases and error handling"""

    def test_mixed_python_and_js_stack_trace(self):
        """Test parsing a mixed stack trace (unlikely but possible)"""
        stack_trace = '''
          File "backend/api.py", line 100, in handler
            call_js_function()
            at jsFunction (/app/script.js:50:10)
        '''
        frames = parse_stack_trace(stack_trace)

        # Should capture both formats
        assert len(frames) >= 2
        file_paths = [f.file_path for f in frames]
        assert "backend/api.py" in file_paths
        assert "/app/script.js" in file_paths

    def test_invalid_line_numbers_ignored(self):
        """Test that frames with invalid data are handled gracefully"""
        stack_trace = '''
        Some random text
          File "valid.py", line 42, in test_func
            some code here
        More random text
        '''
        frames = parse_stack_trace(stack_trace)

        # Should only capture the valid frame
        assert len(frames) == 1
        assert frames[0].file_path == "valid.py"

    def test_windows_file_paths(self):
        """Test parsing Windows-style file paths"""
        stack_trace = r'''
          File "C:\Users\bisho\project\backend\main.py", line 50, in main
            start_server()
        '''
        frames = parse_stack_trace(stack_trace)

        assert len(frames) == 1
        assert frames[0].file_path == r"C:\Users\bisho\project\backend\main.py"
        assert frames[0].line_number == 50


class TestHelperFunctions:
    """Test helper functions"""

    def test_parse_stack_trace_to_dict(self):
        """Test conversion to dictionary format"""
        stack_trace = '''
          File "app.py", line 10, in main
            run()
        '''
        result = parse_stack_trace_to_dict(stack_trace)

        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]['file_path'] == "app.py"
        assert result[0]['line_number'] == 10
        assert result[0]['function_name'] == "main"
        assert result[0]['code_snippet'] == "run()"

    def test_extract_file_paths(self):
        """Test extracting only file paths"""
        stack_trace = '''
          File "backend/main.py", line 42, in startup
            initialize_rag(project_root)
          File "backend/routes/rag_routes.py", line 65, in initialize_rag
            rag_system = EnhancedRAGRetrieval()
        '''
        paths = extract_file_paths(stack_trace)

        assert len(paths) == 2
        assert "backend/main.py" in paths
        assert "backend/routes/rag_routes.py" in paths

    def test_extract_file_paths_from_empty_trace(self):
        """Test extracting file paths from empty stack trace"""
        assert extract_file_paths("") == []
        assert extract_file_paths("No stack trace here") == []


class TestStackFrameDataclass:
    """Test StackFrame dataclass"""

    def test_stack_frame_creation(self):
        """Test creating a StackFrame object"""
        frame = StackFrame(
            file_path="test.py",
            line_number=100,
            function_name="test_function",
            code_snippet="assert True"
        )

        assert frame.file_path == "test.py"
        assert frame.line_number == 100
        assert frame.function_name == "test_function"
        assert frame.code_snippet == "assert True"

    def test_stack_frame_optional_fields(self):
        """Test StackFrame with only required field"""
        frame = StackFrame(file_path="minimal.py")

        assert frame.file_path == "minimal.py"
        assert frame.line_number is None
        assert frame.function_name is None
        assert frame.code_snippet is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
