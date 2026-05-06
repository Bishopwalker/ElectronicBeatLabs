param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    [string]$Version = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "Building Docker images..."
docker-compose build

foreach ($Service in @("backend", "frontend")) {
    $LocalImage = "ebl-$Service"
    $TargetImage = "$Username/ebl-$Service`:$Version"

    Write-Host "Tagging $LocalImage as $TargetImage..."
    docker tag "$LocalImage`:latest" $TargetImage

    Write-Host "Pushing $TargetImage to Docker Hub..."
    docker push $TargetImage

    Write-Host "Successfully pushed $TargetImage"
}

Write-Host ""
Write-Host "Done! Users can now run the full app with one command:"
Write-Host "  docker compose -f docker-compose.prod.yml up -d"
Write-Host ""
Write-Host "Then open http://localhost in a browser."
