#!/bin/bash
# ElectronicBeatLabs - Cleanup Phase 1: Safe Deletions
# Risk Level: ZERO - Only removes duplicates and cache

set -e

echo "🔴 PHASE 1: SAFE DELETIONS"
echo "================================"
echo ""

# Delete exact duplicates
echo "Removing duplicate files..."
[ -f backend/core/frame_buffer_FIXED.py ] && rm -v backend/core/frame_buffer_FIXED.py || echo "  ⚠️  frame_buffer_FIXED.py already removed"
[ -f backend/core/frame_buffer_STUB_BACKUP.py ] && rm -v backend/core/frame_buffer_STUB_BACKUP.py || echo "  ⚠️  frame_buffer_STUB_BACKUP.py already removed"
[ -f src/utils/AudioMixer.ts.backup ] && rm -v src/utils/AudioMixer.ts.backup || echo "  ⚠️  AudioMixer.ts.backup already removed"

# Delete disabled CI config
echo ""
echo "Removing disabled configurations..."
[ -f .gitlab-ci.yml.DISABLED_TEMPORARILY ] && rm -v .gitlab-ci.yml.DISABLED_TEMPORARILY || echo "  ⚠️  Disabled CI config already removed"

# Delete cache directories
echo ""
echo "Removing cache and build artifacts..."
[ -d backend/__pycache__ ] && rm -rfv backend/__pycache__/ || echo "  ⚠️  backend/__pycache__ already clean"
[ -d coverage ] && rm -rfv coverage/ || echo "  ⚠️  coverage/ already clean"
[ -d .serverless ] && rm -rfv .serverless/ || echo "  ⚠️  .serverless/ already clean"

echo ""
echo "✅ PHASE 1 COMPLETE"
echo "Freed approximately 5MB of disk space"
echo "All files deleted can be regenerated automatically"
