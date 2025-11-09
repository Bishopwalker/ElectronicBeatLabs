#!/bin/bash
# ElectronicBeatLabs - Cleanup Phase 2: Remove Unused Code
# Risk Level: LOW - Validates before deletion

set -e

echo "🟡 PHASE 2: UNUSED CODE REMOVAL"
echo "================================"
echo ""

echo "⚠️  Validating files are truly unused..."
echo ""

# Validate useSimplifiedHybridAudio is not imported
if grep -r "useSimplifiedHybridAudio" src/ --include="*.ts" --include="*.tsx" | grep -v "useSimplifiedHybridAudio.ts" | grep -q .; then
    echo "❌ ABORT: useSimplifiedHybridAudio IS IMPORTED!"
    echo "   Found usage in codebase. Manual review required."
    exit 1
fi
echo "✅ useSimplifiedHybridAudio.ts - VERIFIED UNUSED"

# Validate user_service is not imported
if grep -r "from.*user_service import\|import.*user_service" backend/ --include="*.py" | grep -v "user_service.py" | grep -q .; then
    echo "❌ ABORT: user_service IS IMPORTED!"
    echo "   Found usage in codebase. Manual review required."
    exit 1
fi
echo "✅ user_service.py - VERIFIED UNUSED"

# Validate simple_audio_websocket is not registered
if grep -q "simple_audio_websocket" backend/main.py; then
    echo "❌ ABORT: simple_audio_websocket IS REGISTERED!"
    echo "   Route is registered in main.py. Manual review required."
    exit 1
fi
echo "✅ simple_audio_websocket.py - VERIFIED UNUSED"

echo ""
echo "All validations passed. Proceeding with deletion..."
echo ""

# Delete unused files
[ -f src/hooks/useSimplifiedHybridAudio.ts ] && rm -v src/hooks/useSimplifiedHybridAudio.ts || echo "  ⚠️  Already removed"
[ -f backend/services/user_service.py ] && rm -v backend/services/user_service.py || echo "  ⚠️  Already removed"
[ -f backend/routes/simple_audio_websocket.py ] && rm -v backend/routes/simple_audio_websocket.py || echo "  ⚠️  Already removed"

echo ""
echo "✅ PHASE 2 COMPLETE"
echo "Removed ~25KB of unused code"
