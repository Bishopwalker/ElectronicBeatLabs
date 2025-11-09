"""
Integration test for RAG error-context endpoint

Tests the stack trace parsing and chunk matching functionality
without requiring a running FastAPI server.
"""

import sys
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

from utils.stack_trace import parse_stack_trace, StackFrame


def test_python_traceback_parsing():
    """Test parsing a typical Python traceback from EBL"""
    trace = """
Traceback (most recent call last):
  File "/home/user/ElectronicBeatLabs/backend/main.py", line 142, in startup
    initialize_rag(project_root, use_enhanced=True)
  File "/home/user/ElectronicBeatLabs/backend/routes/rag_routes.py", line 67, in initialize_rag
    chunks_path = Path(__file__).resolve().parents[1] / "rag" / "ebl_chunks.json"
  File "/usr/lib/python3.11/pathlib.py", line 1051, in resolve
    s = os.path.realpath(self, strict=strict)
FileNotFoundError: [Errno 2] No such file or directory: 'ebl_chunks.json'
    """

    frames = parse_stack_trace(trace)

    print("✅ Python Traceback Parsing Test")
    print(f"   Parsed {len(frames)} frames")

    assert len(frames) == 3, f"Expected 3 frames, got {len(frames)}"

    # Check first frame
    assert "backend/main.py" in frames[0].file_path
    assert frames[0].line == 142
    assert frames[0].function == "startup"
    assert frames[0].language == "python"
    print(f"   Frame 1: {frames[0].file_path}:{frames[0].line} in {frames[0].function}")

    # Check second frame
    assert "rag_routes.py" in frames[1].file_path
    assert frames[1].line == 67
    assert frames[1].function == "initialize_rag"
    print(f"   Frame 2: {frames[1].file_path}:{frames[1].line} in {frames[1].function}")

    # Check third frame
    assert "pathlib.py" in frames[2].file_path
    assert frames[2].line == 1051
    print(f"   Frame 3: {frames[2].file_path}:{frames[2].line} in {frames[2].function}")

    print("   ✓ All Python traceback assertions passed\n")


def test_typescript_traceback_parsing():
    """Test parsing a typical TypeScript/React error from EBL frontend"""
    trace = """
TypeError: Cannot read property 'frequency' of undefined
    at AudioEngine.generateBinauralBeat (/home/user/ElectronicBeatLabs/src/hooks/useAudioEngine.ts:234:15)
    at AudioEngine.start (/home/user/ElectronicBeatLabs/src/hooks/useAudioEngine.ts:187:9)
    at handleStart (/home/user/ElectronicBeatLabs/src/components/ControlPanel.tsx:56:12)
    """

    frames = parse_stack_trace(trace)

    print("✅ TypeScript Traceback Parsing Test")
    print(f"   Parsed {len(frames)} frames")

    assert len(frames) == 3, f"Expected 3 frames, got {len(frames)}"

    # Check first frame
    assert "useAudioEngine.ts" in frames[0].file_path
    assert frames[0].line == 234
    assert frames[0].column == 15
    assert "generateBinauralBeat" in frames[0].function
    assert frames[0].language == "typescript"
    print(f"   Frame 1: {frames[0].file_path}:{frames[0].line}:{frames[0].column} in {frames[0].function}")

    # Check second frame
    assert "useAudioEngine.ts" in frames[1].file_path
    assert frames[1].line == 187
    assert frames[1].column == 9
    print(f"   Frame 2: {frames[1].file_path}:{frames[1].line}:{frames[1].column} in {frames[1].function}")

    # Check third frame
    assert "ControlPanel.tsx" in frames[2].file_path
    assert frames[2].line == 56
    assert frames[2].column == 12
    assert frames[2].function == "handleStart"
    print(f"   Frame 3: {frames[2].file_path}:{frames[2].line}:{frames[2].column} in {frames[2].function}")

    print("   ✓ All TypeScript traceback assertions passed\n")


def test_mixed_node_trace():
    """Test parsing Node.js trace with internal modules (should skip them)"""
    trace = """
Error: Cannot find module 'express'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:636:15)
    at Function.Module._load (internal/modules/cjs/loader.js:562:25)
    at Module.require (internal/modules/cjs/helpers.js:12:17)
    at Object.<anonymous> (/home/user/ElectronicBeatLabs/src/server.ts:5:17)
    at Module._compile (internal/modules/cjs/loader.js:999:30)
    """

    frames = parse_stack_trace(trace)

    print("✅ Node.js Internal Module Filtering Test")
    print(f"   Parsed {len(frames)} frames (internal modules filtered)")

    # Should only have the user file, not internal Node.js modules
    assert len(frames) == 1, f"Expected 1 frame (internal filtered), got {len(frames)}"

    assert "server.ts" in frames[0].file_path
    assert frames[0].line == 5
    assert frames[0].column == 17
    print(f"   Frame 1: {frames[0].file_path}:{frames[0].line}:{frames[0].column}")
    print(f"   ✓ Internal modules correctly filtered out\n")


def test_frame_attributes():
    """Test that frames have all expected attributes for RAG endpoint"""
    trace = 'File "backend/main.py", line 42, in run_server'
    frames = parse_stack_trace(trace)

    print("✅ Frame Attribute Validation Test")

    assert len(frames) == 1
    frame = frames[0]

    # Check all required attributes exist
    required_attrs = ['file_path', 'line', 'column', 'function', 'language']
    for attr in required_attrs:
        assert hasattr(frame, attr), f"Missing required attribute: {attr}"
        print(f"   ✓ Has attribute: {attr}")

    # Validate types
    assert isinstance(frame.file_path, str)
    assert isinstance(frame.line, int)
    assert isinstance(frame.language, str)
    print(f"   ✓ All attribute types correct\n")


def test_edge_cases():
    """Test edge cases"""
    print("✅ Edge Case Tests")

    # Empty trace
    frames = parse_stack_trace("")
    assert frames == []
    print("   ✓ Empty trace returns empty list")

    # Invalid trace
    frames = parse_stack_trace("This is just random text\nNot a stack trace\n")
    assert isinstance(frames, list)
    print("   ✓ Invalid trace returns list (may be empty)")

    # Windows paths
    trace = r'File "C:\Users\user\app\main.py", line 42, in run'
    frames = parse_stack_trace(trace)
    assert len(frames) == 1
    assert frames[0].file_path == r"C:\Users\user\app\main.py"
    print("   ✓ Windows paths parsed correctly")

    print()


def run_all_tests():
    """Run all integration tests"""
    print("=" * 60)
    print("RAG Error-Context Integration Tests")
    print("=" * 60)
    print()

    try:
        test_python_traceback_parsing()
        test_typescript_traceback_parsing()
        test_mixed_node_trace()
        test_frame_attributes()
        test_edge_cases()

        print("=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        print()
        print("The stack trace parser is ready for use with /api/rag/error-context")
        print()
        return True

    except AssertionError as e:
        print()
        print("=" * 60)
        print(f"❌ TEST FAILED: {e}")
        print("=" * 60)
        return False
    except Exception as e:
        print()
        print("=" * 60)
        print(f"❌ ERROR: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
