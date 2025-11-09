# Docker Build Code Comparison Guide

Complete guide for comparing code between Docker image builds and your current codebase.

## 🎯 Quick Start

### For Your Specific SHA

To compare the Docker build `sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b` with your current code:

**On Linux/Mac:**
```bash
./scripts/compare-docker-build.sh sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b
```

**On Windows (with Python):**
```bash
python scripts/compare-docker-build.py sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b
```

## 📋 What The Tools Do

The comparison scripts will:

1. **Extract Git Commit** - Find the git commit SHA that was used to build the Docker image
2. **Export Docker Filesystem** - Extract all files from the Docker image
3. **Generate Git Diff** - Create a complete diff between the build commit and current code
4. **Create Summary Report** - Generate a markdown summary with key changes

### Output Structure

```
docker-comparison/
├── COMPARISON_SUMMARY.md    # Overview and stats
├── code-changes.diff         # Full git diff
├── app/                      # Extracted Docker image files
│   ├── backend/              # Backend code from image
│   └── ...
└── usr/share/nginx/html/     # Frontend files (if applicable)
    └── build-info.json       # Build metadata
```

## 🔍 Method 1: Automated Comparison (Recommended)

### Prerequisites
- Docker installed and running
- Git repository with full history
- Docker image available locally or in registry

### Run Comparison

```bash
# If image is in registry, pull it first
docker pull registry.gitlab.com/bishop8-group/bbl/backend@sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b

# Run comparison script
./scripts/compare-docker-build.sh sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b
```

### View Results

```bash
# Read summary
cat docker-comparison/COMPARISON_SUMMARY.md

# View specific file changes
git diff <commit-sha>..HEAD -- backend/main.py

# Compare extracted files with current code
diff docker-comparison/app/backend/main.py backend/main.py
```

## 🔧 Method 2: Manual Comparison

If the automated script fails, use these manual steps:

### Step 1: Extract Git Commit SHA from Docker Image

```bash
# Inspect the image
docker inspect sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b

# Look for git_commit label (FUTURE BUILDS ONLY)
docker inspect sha256:f539289... | grep -i git_commit

# Check environment variables
docker inspect sha256:f539289... | grep -i GIT_COMMIT

# Or check the build-info.json in frontend images
docker run --rm sha256:f539289... cat /usr/share/nginx/html/build-info.json
```

### Step 2: Find Commit by Build Timestamp

If git commit isn't in metadata (older builds):

```bash
# Get build timestamp
BUILD_TIME=$(docker inspect sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b | jq -r '.[0].Created')

echo "Build time: $BUILD_TIME"

# Find closest commit
git log --all --before="$BUILD_TIME" --format="%H %s" -n 10

# Select the most likely commit (usually the first one)
GIT_COMMIT=$(git log --all --before="$BUILD_TIME" --format="%H" -n 1)
echo "Likely commit: $GIT_COMMIT"
```

### Step 3: Export Docker Filesystem

```bash
# Create container without running it
docker create --name temp_compare sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b

# Export filesystem
docker export temp_compare > docker-image.tar

# Extract
mkdir docker-files
tar -xf docker-image.tar -C docker-files/

# Cleanup
docker rm temp_compare
```

### Step 4: Compare Code

```bash
# Generate diff with git
git diff $GIT_COMMIT..HEAD > code-changes.diff

# View summary
git diff --stat $GIT_COMMIT..HEAD

# Compare specific directories
diff -r docker-files/app/backend backend/

# Compare specific files
diff docker-files/app/backend/main.py backend/main.py
```

## 📊 Method 3: GitLab CI/CD Pipeline Lookup

If you have access to GitLab:

1. **Go to CI/CD → Pipelines** in your GitLab project
2. **Find the pipeline** that created the image
   - Look for builds around the image creation date
   - Check the `docker-build` job
3. **View the job logs** to find:
   ```
   Building image with commit: abc1234567890
   Tagging as: registry.gitlab.com/bishop8-group/bbl:abc1234567890
   ```
4. **Compare with git:**
   ```bash
   git diff abc1234567890..HEAD
   ```

## 🎯 Method 4: Check Container Registry Tags

Your CI/CD tags images with commit SHAs. Find the tag that matches your SHA:

```bash
# Using GitLab API (requires auth token)
curl --header "PRIVATE-TOKEN: <your-token>" \
  "https://gitlab.com/api/v4/projects/<project-id>/registry/repositories/<repo-id>/tags"

# This returns all tags with their digests
# Match the digest to find the commit SHA used as tag name
```

## 🚀 Future Builds (Git Tracking Enabled)

**All builds after this update** will automatically include git commit info!

### Building Images with Git Info

```bash
# Get current git commit
GIT_COMMIT=$(git rev-parse HEAD)
BUILD_DATE=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Build backend with metadata
docker build \
  --build-arg GIT_COMMIT=$GIT_COMMIT \
  --build-arg BUILD_DATE=$BUILD_DATE \
  -f Dockerfile.backend \
  -t ebl-backend:latest \
  .

# Build frontend with metadata
docker build \
  --build-arg GIT_COMMIT=$GIT_COMMIT \
  --build-arg BUILD_DATE=$BUILD_DATE \
  -f Dockerfile.frontend \
  -t ebl-frontend:latest \
  .
```

### Viewing Build Info

```bash
# Check labels
docker inspect ebl-backend:latest | jq '.[0].Config.Labels'

# Expected output:
# {
#   "git_commit": "abc1234567890",
#   "build_date": "2025-11-09T12:00:00Z",
#   ...
# }

# For frontend, also check build-info.json
docker run --rm ebl-frontend:latest cat /usr/share/nginx/html/build-info.json
```

## 🧰 Useful Commands

### Compare Specific Changes

```bash
# Backend changes only
git diff $COMMIT..HEAD -- backend/

# Frontend changes only
git diff $COMMIT..HEAD -- src/

# Docker config changes
git diff $COMMIT..HEAD -- Dockerfile* docker-compose*

# Dependencies changes
git diff $COMMIT..HEAD -- package.json backend/requirements.txt
```

### File-by-File Comparison

```bash
# Using diff (Linux/Mac)
diff docker-files/app/backend/main.py backend/main.py

# Using fc (Windows)
fc docker-files\app\backend\main.py backend\main.py

# Using VS Code
code --diff docker-files/app/backend/main.py backend/main.py

# Using git difftool
git difftool $COMMIT:backend/main.py HEAD:backend/main.py
```

### Search for Specific Changes

```bash
# Find changes to specific function
git log -p $COMMIT..HEAD --all -- '**/audio_engine.py' | grep -A 10 'def generate_audio'

# Find when a bug was introduced
git bisect start HEAD $COMMIT
git bisect run pytest tests/test_audio.py

# Find commits that changed a specific file
git log --oneline $COMMIT..HEAD -- backend/audio_engine.py
```

## 📝 Tips & Best Practices

### 1. Always Pull Latest Before Comparing
```bash
git fetch --all
git pull origin main
```

### 2. Use Specific Commits, Not Tags
Tags can move, commit SHAs are immutable.

### 3. Check Multiple Sources
- Docker labels
- Build environment variables
- Frontend build-info.json file
- CI/CD pipeline logs
- Container registry metadata

### 4. Verify Critical Changes
After comparison, always test:
```bash
# Run tests
npm test
pytest

# Check linting
npm run lint

# Verify builds work
npm run build
docker build -f Dockerfile.backend -t test-backend .
```

## 🐛 Troubleshooting

### "Image not found"
```bash
# List local images
docker images

# Pull from registry
docker pull <registry>/<image>@sha256:f539289c...

# Or use image ID instead of SHA
docker images --no-trunc | grep f539289c
```

### "Git commit not found in image"
This is expected for older builds. Use Method 2 (build timestamp approach).

### "Permission denied" when extracting
```bash
# Run with sudo (Linux)
sudo docker export temp_compare > docker-image.tar

# Or change ownership after
sudo chown $USER:$USER docker-image.tar
```

### "Diff too large"
```bash
# Compare specific directories only
git diff $COMMIT..HEAD --stat -- backend/

# Use git log for overview
git log --oneline $COMMIT..HEAD

# Focus on specific file types
git diff $COMMIT..HEAD --stat -- '*.py' '*.ts' '*.tsx'
```

## 📚 Additional Resources

- **Docker Documentation**: https://docs.docker.com/engine/reference/commandline/inspect/
- **Git Diff Guide**: https://git-scm.com/docs/git-diff
- **GitLab CI/CD**: https://docs.gitlab.com/ee/ci/
- **Project Docker Guide**: [DOCKER.md](../DOCKER.md)

## 🎯 Your Specific Case

For SHA `sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b`:

1. This is an older build WITHOUT git tracking metadata
2. Use Method 2 (build timestamp) or Method 3 (GitLab pipeline lookup)
3. Once you find the commit, run the comparison script
4. Future builds will have automatic git tracking!

```bash
# Try automated script first (will attempt timestamp approach)
python scripts/compare-docker-build.py sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b

# If that fails, check GitLab pipeline logs or extract manually
```
