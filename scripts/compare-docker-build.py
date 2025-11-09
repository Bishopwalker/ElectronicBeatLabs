#!/usr/bin/env python3
"""
Docker Build Code Comparison Tool
Compares code from a Docker image with current codebase
"""

import json
import subprocess
import sys
import os
from datetime import datetime
from pathlib import Path
import shutil

def run_command(cmd, capture=True):
    """Run shell command and return output"""
    try:
        if capture:
            result = subprocess.run(cmd, shell=True, capture_output=True, text=True, check=True)
            return result.stdout.strip()
        else:
            subprocess.run(cmd, shell=True, check=True)
            return None
    except subprocess.CalledProcessError as e:
        print(f"❌ Command failed: {cmd}")
        print(f"Error: {e.stderr}")
        return None

def main():
    if len(sys.argv) < 2:
        print("❌ Usage: python compare-docker-build.py <docker-image-sha>")
        print("")
        print("Example:")
        print("  python compare-docker-build.py sha256:f539289c906de6d7acfd4dd90777f16d3c5467486e2e2a37e3ca95795e3ba40b")
        sys.exit(1)

    docker_sha = sys.argv[1]
    output_dir = Path("docker-comparison")

    print("🔍 Docker Build Code Comparison Tool")
    print("=" * 50)
    print()

    # Step 1: Inspect Docker image
    print("📦 Step 1: Inspecting Docker image...")
    inspect_output = run_command(f'docker inspect {docker_sha}')

    if not inspect_output:
        print("❌ Failed to inspect Docker image. Is Docker running? Is the image available?")
        sys.exit(1)

    inspect_data = json.loads(inspect_output)[0]

    # Try to find git commit from labels or env vars
    git_commit = None

    # Check labels
    labels = inspect_data.get('Config', {}).get('Labels', {})
    git_commit = labels.get('git_commit') or labels.get('GIT_COMMIT')

    # Check environment variables
    if not git_commit:
        env_vars = inspect_data.get('Config', {}).get('Env', [])
        for env in env_vars:
            if 'GIT_COMMIT=' in env:
                git_commit = env.split('=')[1]
                break

    # Fallback: use build timestamp
    if not git_commit:
        print("⚠️  Warning: Git commit SHA not found in image metadata")
        build_time = inspect_data.get('Created', '')
        print(f"   Build time: {build_time}")
        print()
        print("Attempting to find commit from build timestamp...")
        git_commit = run_command(f'git log --all --before="{build_time}" --format="%H" -n 1')
        if git_commit:
            print(f"   Closest commit: {git_commit}")
            print("   ⚠️  This is an APPROXIMATION - may not be exact")

    if not git_commit:
        print("❌ Could not determine git commit. See manual extraction methods in README.")
        sys.exit(1)

    print(f"✅ Found git commit: {git_commit}")
    print()

    # Step 2: Create output directory
    print("📁 Step 2: Creating comparison directory...")
    output_dir.mkdir(exist_ok=True)
    print(f"✅ Created: {output_dir}")
    print()

    # Step 3: Extract Docker image filesystem
    print("📂 Step 3: Extracting Docker image filesystem...")

    # Create temporary container
    run_command(f'docker create --name docker_compare_temp {docker_sha}', capture=False)

    # Export filesystem
    tar_file = output_dir / "docker-image.tar"
    run_command(f'docker export docker_compare_temp > {tar_file}', capture=False)

    # Extract tar (cross-platform)
    print("   Extracting archive...")
    shutil.unpack_archive(tar_file, output_dir, 'tar')

    # Cleanup
    run_command('docker rm docker_compare_temp', capture=False)
    tar_file.unlink()

    print(f"✅ Filesystem extracted to: {output_dir}")
    print()

    # Step 4: Create git diff
    print("📊 Step 4: Creating git diff...")
    diff_file = output_dir / "code-changes.diff"
    run_command(f'git diff {git_commit}..HEAD > {diff_file}', capture=False)
    print(f"✅ Diff saved to: {diff_file}")
    print()

    # Step 5: Generate comparison summary
    print("📋 Step 5: Generating comparison summary...")

    # Get stats
    diff_stat = run_command(f'git diff --stat {git_commit}..HEAD') or "No changes"
    commit_log = run_command(f'git log --oneline {git_commit}..HEAD') or "No commits"
    backend_stat = run_command(f'git diff {git_commit}..HEAD --stat -- backend/') or "No changes"
    frontend_stat = run_command(f'git diff {git_commit}..HEAD --stat -- src/') or "No changes"
    docker_stat = run_command(f'git diff {git_commit}..HEAD --stat -- Dockerfile* docker-compose*') or "No changes"

    summary = f"""# Docker Build Code Comparison

**Docker Image SHA:** `{docker_sha}`
**Git Commit:** `{git_commit}`
**Comparison Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## Files Changed Since Docker Build

```
{diff_stat}
```

## Commit History Since Build

```
{commit_log}
```

## Key Differences

### Backend Changes
```
{backend_stat}
```

### Frontend Changes
```
{frontend_stat}
```

### Docker Configuration Changes
```
{docker_stat}
```

## Full Diff Location
See `code-changes.diff` for complete code differences.

## Docker Image Contents
Extracted to: `{output_dir}/`

### Key Directories
- Backend: `/app/`
- Frontend (if multi-stage): `/usr/share/nginx/html/`
- Python packages: `/home/ebl/.local/` or `/usr/local/lib/python3.11/`

## Next Steps

1. Review the diff file for detailed code changes
2. Compare specific files between extracted image and current code
3. Test current code to ensure changes don't break functionality

### Example Comparisons

```bash
# Compare specific file (Windows)
fc "{output_dir}\\app\\backend\\main.py" ".\\backend\\main.py"

# Compare specific file (Linux/Mac)
diff "{output_dir}/app/backend/main.py" "./backend/main.py"
```
"""

    summary_file = output_dir / "COMPARISON_SUMMARY.md"
    summary_file.write_text(summary)
    print(f"✅ Summary saved to: {summary_file}")
    print()

    print("🎉 Comparison Complete!")
    print()
    print(f"📂 Results in: {output_dir}/")
    print("   - COMPARISON_SUMMARY.md  (Overview)")
    print("   - code-changes.diff      (Full git diff)")
    print("   - app/                   (Extracted Docker filesystem)")
    print()
    print("👀 View summary:")
    print(summary)

if __name__ == "__main__":
    main()
