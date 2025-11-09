#!/bin/bash
# ==========================================
# Docker Build Code Comparison Tool
# ==========================================
# This script helps you compare code from a Docker image with your current codebase

set -e

DOCKER_IMAGE_SHA="${1:-}"
OUTPUT_DIR="./docker-comparison"

if [ -z "$DOCKER_IMAGE_SHA" ]; then
    echo "❌ Usage: $0 <docker-image-sha>"
    echo ""
    echo "Example:"
    echo "  $0 sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b"
    exit 1
fi

echo "🔍 Docker Build Code Comparison Tool"
echo "===================================="
echo ""

# Step 1: Extract git commit SHA from Docker image
echo "📦 Step 1: Inspecting Docker image..."
GIT_COMMIT=$(docker inspect "$DOCKER_IMAGE_SHA" 2>/dev/null | jq -r '.[0].Config.Labels.git_commit // .[0].Config.Env[] | select(contains("GIT_COMMIT")) | split("=")[1] // empty' | head -1)

if [ -z "$GIT_COMMIT" ]; then
    echo "⚠️  Warning: Git commit SHA not found in image metadata"
    echo ""
    echo "Attempting to find commit from build timestamp..."
    BUILD_TIME=$(docker inspect "$DOCKER_IMAGE_SHA" 2>/dev/null | jq -r '.[0].Created')
    echo "   Build time: $BUILD_TIME"
    echo ""

    # Find closest commit by timestamp
    GIT_COMMIT=$(git log --all --before="$BUILD_TIME" --format="%H" -n 1)
    echo "   Closest commit: $GIT_COMMIT"
    echo "   ⚠️  This is an APPROXIMATION - may not be exact"
fi

if [ -z "$GIT_COMMIT" ]; then
    echo "❌ Could not determine git commit. Manual extraction required."
    echo ""
    echo "Try these methods:"
    echo "1. Extract filesystem from Docker image and check for git info:"
    echo "   docker create --name temp $DOCKER_IMAGE_SHA"
    echo "   docker export temp > image.tar"
    echo "   tar -xf image.tar"
    echo "   docker rm temp"
    echo ""
    echo "2. Check CI/CD pipeline logs for the build"
    echo "3. Look for version info in the running container"
    exit 1
fi

echo "✅ Found git commit: $GIT_COMMIT"
echo ""

# Step 2: Create comparison directory
echo "📁 Step 2: Creating comparison directory..."
mkdir -p "$OUTPUT_DIR"
cd "$OUTPUT_DIR"

# Step 3: Export Docker image filesystem
echo "📂 Step 3: Extracting Docker image filesystem..."
docker create --name docker_compare_temp "$DOCKER_IMAGE_SHA" 2>/dev/null || true
docker export docker_compare_temp > docker-image.tar
tar -xf docker-image.tar -C .
docker rm docker_compare_temp 2>/dev/null || true
echo "✅ Filesystem extracted to: $OUTPUT_DIR"
echo ""

# Step 4: Create git diff
echo "📊 Step 4: Creating git diff..."
cd ..
git diff "$GIT_COMMIT"..HEAD > "$OUTPUT_DIR/code-changes.diff"
echo "✅ Diff saved to: $OUTPUT_DIR/code-changes.diff"
echo ""

# Step 5: Generate comparison summary
echo "📋 Step 5: Generating comparison summary..."
cat > "$OUTPUT_DIR/COMPARISON_SUMMARY.md" << EOF
# Docker Build Code Comparison

**Docker Image SHA:** \`$DOCKER_IMAGE_SHA\`
**Git Commit:** \`$GIT_COMMIT\`
**Comparison Date:** $(date)

## Files Changed Since Docker Build

\`\`\`bash
$(git diff --stat "$GIT_COMMIT"..HEAD)
\`\`\`

## Commit History Since Build

\`\`\`
$(git log --oneline "$GIT_COMMIT"..HEAD)
\`\`\`

## Key Differences

### Backend Changes
\`\`\`bash
$(git diff "$GIT_COMMIT"..HEAD --stat -- backend/)
\`\`\`

### Frontend Changes
\`\`\`bash
$(git diff "$GIT_COMMIT"..HEAD --stat -- src/)
\`\`\`

### Docker Configuration Changes
\`\`\`bash
$(git diff "$GIT_COMMIT"..HEAD --stat -- Dockerfile* docker-compose*)
\`\`\`

## Full Diff Location
See \`code-changes.diff\` for complete code differences.

## Docker Image Contents
Extracted to: \`$OUTPUT_DIR/\`

### Key Directories
- Backend: \`/app/\`
- Frontend (if multi-stage): \`/usr/share/nginx/html/\`
- Python packages: \`/home/ebl/.local/\` or \`/usr/local/lib/python3.11/\`

## Next Steps

1. Review the diff file for detailed code changes
2. Compare specific files between extracted image and current code
3. Test current code to ensure changes don't break functionality

\`\`\`bash
# Compare specific file
diff "$OUTPUT_DIR/app/backend/main.py" "./backend/main.py"

# Compare directories
diff -r "$OUTPUT_DIR/app/backend" "./backend"
\`\`\`
EOF

echo "✅ Summary saved to: $OUTPUT_DIR/COMPARISON_SUMMARY.md"
echo ""
echo "🎉 Comparison Complete!"
echo ""
echo "📂 Results in: $OUTPUT_DIR/"
echo "   - COMPARISON_SUMMARY.md  (Overview)"
echo "   - code-changes.diff      (Full git diff)"
echo "   - app/                   (Extracted Docker filesystem)"
echo ""
echo "👀 Quick View:"
cat "$OUTPUT_DIR/COMPARISON_SUMMARY.md"
