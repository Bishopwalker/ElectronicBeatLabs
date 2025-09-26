#!/bin/bash
# Context Initialization Script
# Automatically reads all mandatory context files in proper order

echo "🚀 CONTEXT INITIALIZATION STARTING..."
echo "============================================="

# Define required files in order
declare -a CONTEXT_FILES=(
    ".claude/INDEX.md:Navigation Guide"
    ".claude/CLAUDE.md:Development Standards" 
    ".claude/INITIAL.md:Technical Specifications"
    "PLANNING.md:Architecture & Workflow"
    "TASK.md:Current Sprint Work"
)

SUCCESS_COUNT=0
ERROR_COUNT=0

# Read each file in order
for i in "${!CONTEXT_FILES[@]}"; do
    FILE_INFO="${CONTEXT_FILES[$i]}"
    FILE_PATH="${FILE_INFO%:*}"
    FILE_DESC="${FILE_INFO#*:}"
    
    echo ""
    echo "📖 Reading $((i+1))/5: $FILE_DESC"
    echo "   Path: $FILE_PATH"
    
    if [ -f "$FILE_PATH" ]; then
        # Get file stats
        FILE_SIZE=$(wc -c < "$FILE_PATH")
        LINE_COUNT=$(wc -l < "$FILE_PATH")
        
        echo "   ✅ Found ($FILE_SIZE chars, $LINE_COUNT lines)"
        
        # Show first few key lines for context
        echo "   📋 Key content preview:"
        head -3 "$FILE_PATH" | sed 's/^/      /'
        
        ((SUCCESS_COUNT++))
    else
        echo "   ❌ FILE NOT FOUND: $FILE_PATH"
        ((ERROR_COUNT++))
    fi
done

echo ""
echo "============================================="
echo "📊 CONTEXT SUMMARY:"
echo "   Files loaded: $SUCCESS_COUNT/5"
echo "   Errors: $ERROR_COUNT"

if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ CONTEXT INITIALIZATION COMPLETE"
    echo "🎯 READY FOR DEVELOPMENT WORK"
else
    echo "⚠️  CONTEXT INCOMPLETE - Missing $ERROR_COUNT files"
    echo "🔧 Fix missing files before proceeding"
fi

echo ""
echo "🚀 Context loaded - proceed with tasks!"
echo "============================================="