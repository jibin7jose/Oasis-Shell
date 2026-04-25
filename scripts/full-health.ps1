param()

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

function Invoke-Step {
    param(
        [string]$Name,
        [scriptblock]$Action
    )

    Write-Host ""
    Write-Host "== $Name ==" -ForegroundColor Cyan
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    & $Action
    $sw.Stop()
    if ($LASTEXITCODE -ne 0) {
        throw "$Name failed with exit code $LASTEXITCODE"
    }
    Write-Host "$Name completed in $([math]::Round($sw.Elapsed.TotalSeconds, 1))s" -ForegroundColor Green
}

function Get-TauriProcess {
    Get-Process | Where-Object { $_.ProcessName -eq "oasis-shell" } | Select-Object -First 1
}

function Wait-ForTauriProcess {
    param([int]$TimeoutSeconds = 45)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $proc = Get-TauriProcess
        if ($proc) { return $proc }
        Start-Sleep -Seconds 2
    }

    return $null
}

function Wait-ForFrontend {
    param([int]$TimeoutSeconds = 60)

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:1420" -TimeoutSec 5
            if ($response.StatusCode -eq 200) { return $true }
        } catch {
        }
        Start-Sleep -Seconds 2
    }

    return $false
}

function Start-DevSession {
    if (Get-TauriProcess) {
        return
    }

    Start-Process -FilePath "cmd.exe" -ArgumentList @('/c', 'npm run dev:clean') -WorkingDirectory $root -WindowStyle Hidden | Out-Null

    if (-not (Wait-ForTauriProcess)) {
        throw "oasis-shell process did not start"
    }

    if (-not (Wait-ForFrontend)) {
        throw "frontend did not become ready on http://localhost:1420"
    }
}

function Invoke-NpmScript {
    param([string]$Script)

    cmd /c "npm run $Script"
    if ($LASTEXITCODE -ne 0) {
        throw "npm run $Script failed with exit code $LASTEXITCODE"
    }
}

Set-Location $root

Invoke-Step "Frontend Build" {
    Invoke-NpmScript "build"
}

Invoke-Step "Rust Test" {
    Push-Location (Join-Path $root "src-tauri")
    try {
        cargo test
        if ($LASTEXITCODE -ne 0) {
            throw "cargo test failed with exit code $LASTEXITCODE"
        }
    } finally {
        Pop-Location
    }
}

Start-DevSession

Invoke-Step "Smoke Diagnostics" {
    Invoke-NpmScript "smoke:collect"
}

Invoke-Step "UI Smoke" {
    powershell -ExecutionPolicy Bypass -File ./scripts/run-ui-smoke.ps1
    if ($LASTEXITCODE -ne 0) {
        throw "UI smoke failed with exit code $LASTEXITCODE"
    }
}

Write-Host ""
Write-Host "Full health run completed successfully." -ForegroundColor Green
