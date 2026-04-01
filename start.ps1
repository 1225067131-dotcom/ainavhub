$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$port = 8000
$url = "http://localhost:$port/index.html"

function Test-CommandRunnable($name, $versionArgs = '--version') {
    $cmd = Get-Command $name -ErrorAction SilentlyContinue
    if (-not $cmd) { return $false }
    try {
        & $name $versionArgs *> $null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

Write-Host "Opening $url ..."
Start-Process $url

if (Test-CommandRunnable 'python') {
    Write-Host "Starting local server with Python on port $port"
    python -m http.server $port
    exit
}

if (Test-CommandRunnable 'py') {
    Write-Host "Starting local server with py on port $port"
    py -m http.server $port
    exit
}

if (Test-CommandRunnable 'npx') {
    Write-Host "Starting local server with npx serve on port $port"
    npx serve -l $port
    exit
}

Write-Host "No supported runtime found." -ForegroundColor Red
Write-Host "Install Python (from python.org) or Node.js, then run this script again."
