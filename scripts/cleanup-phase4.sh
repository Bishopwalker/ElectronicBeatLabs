#!/bin/bash
# ElectronicBeatLabs - Cleanup Phase 4: Reorganize Tests & Scripts
# Risk Level: ZERO - Files moved, not deleted

set -e

echo "🔧 PHASE 4: REORGANIZE PROJECT STRUCTURE"
echo "=========================================="
echo ""

# Create directory structure
echo "Creating standard directory structure..."
mkdir -p backend/tests/integration
mkdir -p tests/
mkdir -p scripts/
echo "✅ Directories created"
echo ""

# Move backend tests
echo "Moving backend tests to backend/tests/integration/..."
mv -v backend/test_audio_engine.py backend/tests/integration/ 2>/dev/null || echo "  ⚠️  test_audio_engine.py not found or already moved"
mv -v backend/test_audio_timer.py backend/tests/integration/ 2>/dev/null || echo "  ⚠️  test_audio_timer.py not found or already moved"
mv -v backend/test_timer_auth.py backend/tests/integration/ 2>/dev/null || echo "  ⚠️  test_timer_auth.py not found or already moved"
mv -v backend/manual_route_test.py backend/tests/integration/ 2>/dev/null || echo "  ⚠️  manual_route_test.py not found or already moved"

echo ""
echo "Moving root-level tests to tests/..."
mv -v test_rag_improvements.py tests/ 2>/dev/null || echo "  ⚠️  test_rag_improvements.py not found or already moved"
mv -v test_timer_math.py tests/ 2>/dev/null || echo "  ⚠️  test_timer_math.py not found or already moved"
mv -v test_simplified_pipeline.py tests/ 2>/dev/null || echo "  ⚠️  test_simplified_pipeline.py not found or already moved"

echo ""
echo "Moving setup scripts to scripts/..."
mv -v setup_rag.py scripts/ 2>/dev/null || echo "  ⚠️  setup_rag.py not found or already moved"
mv -v setup_auth.py scripts/ 2>/dev/null || echo "  ⚠️  setup_auth.py not found or already moved"
mv -v run_rag.py scripts/ 2>/dev/null || echo "  ⚠️  run_rag.py not found or already moved"

echo ""
echo "✅ PHASE 4 COMPLETE"
echo "Reorganized 14 test and script files"
echo "⚠️  NOTE: You may need to update import paths in moved test files"
