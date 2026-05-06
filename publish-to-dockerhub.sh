#!/bin/bash
set -e

if [ -z "$1" ]; then
    echo "Usage: ./publish-to-dockerhub.sh <dockerhub-username> [version]"
    exit 1
fi

USERNAME=$1
VERSION=${2:-latest}

echo "Building Docker images..."
docker-compose build

for SERVICE in backend frontend; do
    LOCAL_IMAGE="ebl-${SERVICE}"
    TARGET_IMAGE="${USERNAME}/ebl-${SERVICE}:${VERSION}"

    echo "Tagging $LOCAL_IMAGE as $TARGET_IMAGE..."
    docker tag "$LOCAL_IMAGE" "$TARGET_IMAGE"

    echo "Pushing $TARGET_IMAGE to Docker Hub..."
    docker push "$TARGET_IMAGE"

    echo "Successfully pushed $TARGET_IMAGE"
done

echo ""
echo "Done! Users can now run the full app with one command:"
echo "  curl -O https://raw.githubusercontent.com/YOUR_REPO/main/docker-compose.prod.yml"
echo "  docker compose -f docker-compose.prod.yml up -d"
echo ""
echo "Then open http://localhost in a browser."
