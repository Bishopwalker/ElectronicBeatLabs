#!/bin/bash
# ElectronicBeatLabs - Cleanup Phase 3: Archive Historical Docs
# Risk Level: ZERO - Files preserved in archive

set -e

echo "📁 PHASE 3: ARCHIVE HISTORICAL DOCUMENTATION"
echo "=============================================="
echo ""

# Create archive directories
echo "Creating archive structure..."
mkdir -p docs/archive/completed-fixes
mkdir -p docs/archive/session-notes
echo "✅ Archive directories created"
echo ""

# Move fix documentation
echo "Archiving fix documentation..."
mv -v AUDIO_FIX_SUMMARY.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  AUDIO_FIX_SUMMARY.md not found"
mv -v AUDIO_FIX_SUMMARY_V2.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  AUDIO_FIX_SUMMARY_V2.md not found"
mv -v AUDIO_CONTEXT_FIX.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  AUDIO_CONTEXT_FIX.md not found"
mv -v AUDIO_ENGINE_CLEANUP_PLAN.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  AUDIO_ENGINE_CLEANUP_PLAN.md not found"
mv -v LAYOUT_FIXED.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  LAYOUT_FIXED.md not found"
mv -v SPATIAL_VISUALIZER_FIXED.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  SPATIAL_VISUALIZER_FIXED.md not found"
mv -v STOP_BUTTON_FIX_SUMMARY.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  STOP_BUTTON_FIX_SUMMARY.md not found"
mv -v VISUALIZATION_FIX_SUMMARY.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  VISUALIZATION_FIX_SUMMARY.md not found"
mv -v VISUALIZATION_REPAIR_COMPLETE.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  VISUALIZATION_REPAIR_COMPLETE.md not found"
mv -v FREQUENCY_VISUALIZER_FULLSCREEN.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  FREQUENCY_VISUALIZER_FULLSCREEN.md not found"
mv -v TIMER_UI_FIXES.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  TIMER_UI_FIXES.md not found"
mv -v TEST_AUDIO_FIX.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  TEST_AUDIO_FIX.md not found"
mv -v TEST_SPATIAL_VISUALIZER.md docs/archive/completed-fixes/ 2>/dev/null || echo "  ⚠️  TEST_SPATIAL_VISUALIZER.md not found"

echo ""
echo "Archiving session notes..."
mv -v SIMPLIFIED_AUDIO_ANALYSIS.md docs/archive/session-notes/ 2>/dev/null || echo "  ⚠️  SIMPLIFIED_AUDIO_ANALYSIS.md not found"
mv -v LOCALAUDIO_MIGRATION.md docs/archive/session-notes/ 2>/dev/null || echo "  ⚠️  LOCALAUDIO_MIGRATION.md not found"
mv -v LOCALAUDIO_REVIEW.md docs/archive/session-notes/ 2>/dev/null || echo "  ⚠️  LOCALAUDIO_REVIEW.md not found"
mv -v LOCALAUDIO_SESSION_SUMMARY.md docs/archive/session-notes/ 2>/dev/null || echo "  ⚠️  LOCALAUDIO_SESSION_SUMMARY.md not found"
mv -v EMERGENCY_DIAGNOSTIC.md docs/archive/session-notes/ 2>/dev/null || echo "  ⚠️  EMERGENCY_DIAGNOSTIC.md not found"

echo ""
echo "✅ PHASE 3 COMPLETE"
echo "Archived up to 18 historical documentation files"
echo "Files preserved in docs/archive/"
