param(
  [int[]]$Ports = @(5173, 5174, 8000, 8001),
  [switch]$Aggressive,
  [switch]$AdminHint
)

Write-Host "Stopping EBL Development Environment" -ForegroundColor Yellow
if ($AdminHint) { Write-Host "Tip: Run PowerShell as Administrator for best results" -ForegroundColor DarkYellow }

function Get-ListeningPids([int]$Port) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction Stop
    return ($conns | Select-Object -ExpandProperty OwningProcess -Unique)
  } catch {
    # Fallback to netstat parsing if Get-NetTCPConnection is unavailable
    $patternV4 = ":$Port\s"
    $patternV6 = "]:$Port\s"
    $lines = netstat -ano -p tcp 2>$null | Select-String -Pattern $patternV4, $patternV6
    $pids = @()
    foreach ($line in $lines) {
      $parts = ($line -replace "\s+", " ").Trim().Split(' ')
      if ($parts.Length -ge 5 -and $parts[-2] -eq 'LISTENING') {
        $pids += [int]$parts[-1]
      }
    }
    return ($pids | Select-Object -Unique)
  }
}

function Stop-ProcessTree([int]$Pid) {
  try {
    # Recurse into children first
    $children = Get-CimInstance Win32_Process -Filter "ParentProcessId=$Pid" -ErrorAction SilentlyContinue
    foreach ($c in $children) { Stop-ProcessTree -Pid $c.ProcessId }
    if (Get-Process -Id $Pid -ErrorAction SilentlyContinue) {
      Write-Host "Killing PID $Pid" -ForegroundColor Cyan
      Stop-Process -Id $Pid -Force -ErrorAction SilentlyContinue
    }
  } catch {}
}

function Get-AncestorRoot([int]$Pid, [string]$Root, [string[]]$Keywords) {
  $seen = New-Object System.Collections.Generic.HashSet[int]
  $current = $Pid
  $candidate = $Pid
  while ($current -and $seen.Add($current)) {
    try {
      $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$current" -ErrorAction SilentlyContinue
      if (-not $proc) { break }
      $cmd = ($proc.CommandLine) -as [string]
      if (-not [string]::IsNullOrWhiteSpace($cmd)) {
        if ($cmd -match [Regex]::Escape($Root)) { $candidate = $proc.ProcessId }
        foreach ($k in $Keywords) { if ($cmd -match $k) { $candidate = $proc.ProcessId; break } }
      }
      $current = $proc.ParentProcessId
      if (-not $current -or $current -eq 0) { break }
    } catch { break }
  }
  return $candidate
}

function Get-ProjectPids([string]$Root) {
  $pids = @()
  try {
    $procs = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue
    foreach ($p in $procs) {
      $cmd = ($p.CommandLine) -as [string]
      if ([string]::IsNullOrWhiteSpace($cmd)) { continue }
      if ($cmd -match [Regex]::Escape($Root)) {
        if ($cmd -match 'vite' -or $cmd -match 'uvicorn' -or $cmd -match 'fastapi' -or $cmd -match 'concurrently' -or $cmd -match 'webpack' -or $cmd -match 'esbuild') {
          $pids += [int]$p.ProcessId
        }
      }
    }
  } catch {}
  return ($pids | Select-Object -Unique)
}

# Collect by ports
$allPids = @()
foreach ($p in $Ports) {
  Write-Host "Stopping listeners on port $p..." -ForegroundColor Green
  $pids = Get-ListeningPids -Port $p
  if (-not $pids -or $pids.Count -eq 0) {
    Write-Host "No listeners found on $p" -ForegroundColor DarkGray
  } else {
    $allPids += $pids
  }
}

# Aggressive mode: also catch processes started under this repo root that look like dev servers
try {
  $root = (Resolve-Path -LiteralPath "$PSScriptRoot").Path
} catch {
  $root = (Get-Location).Path
}
$keywords = @('vite','uvicorn','fastapi','concurrently','webpack','esbuild','ts-node','npm','node')
if ($Aggressive -or -not $allPids) {
  Write-Host "Scanning for project dev processes under $root..." -ForegroundColor Green
  $projPids = Get-ProjectPids -Root $root
  $allPids += $projPids
}

$roots = New-Object System.Collections.Generic.HashSet[int]
foreach ($pid in ($allPids | Select-Object -Unique)) {
  $rootPid = Get-AncestorRoot -Pid $pid -Root $root -Keywords $keywords
  [void]$roots.Add($rootPid)
}

$unique = $roots.ToArray()
if (-not $unique -or $unique.Count -eq 0) {
  Write-Host "Nothing to stop." -ForegroundColor DarkYellow
} else {
  foreach ($pid in $unique) { Stop-ProcessTree -Pid $pid }
}

Write-Host "Attempted to stop all dev servers." -ForegroundColor Yellow
