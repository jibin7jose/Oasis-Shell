param()

$ErrorActionPreference = "Continue"

$root = Split-Path -Parent $PSScriptRoot
$reportDir = Join-Path $root "smoke-assets"
$reportPath = Join-Path $reportDir "smoke-diagnostics.txt"
$tauriLogPath = Join-Path $root "tauri-dev.log"
$envPath = Join-Path $root ".env"

if (-not (Test-Path $reportDir)) {
    New-Item -ItemType Directory -Path $reportDir | Out-Null
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

function Stop-StaleSmokeProcesses {
    $listenerPids = @()
    $netstat = netstat -ano | Select-String ':1420\s+.*LISTENING\s+(\d+)$'
    foreach ($line in $netstat) {
        if ($line.Line -match '\s(\d+)$') {
            $listenerPids += [int]$Matches[1]
        }
    }

    $listenerPids = $listenerPids | Sort-Object -Unique

    foreach ($pid in $listenerPids) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
        } catch {
        }
    }
}

function Wait-ForPortFree {
    param(
        [int]$Port,
        [int]$TimeoutSeconds = 30
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $listener = netstat -ano | Select-String ":$Port\s+.*LISTENING\s+"
        if (-not $listener) {
            return $true
        }
        Start-Sleep -Seconds 1
    }

    return $false
}

function Start-TauriDevIfNeeded {
    if (Get-TauriProcess) {
        return
    }

    Stop-StaleSmokeProcesses
    if (-not (Wait-ForPortFree -Port 1420 -TimeoutSeconds 30)) {
        throw "port 1420 is still in use after cleanup"
    }
    Write-Host "Launching Tauri dev for smoke diagnostics..." -ForegroundColor Cyan
    Start-Process -FilePath "cmd.exe" -ArgumentList @('/c', 'npm run dev:clean') -WorkingDirectory $root -WindowStyle Hidden | Out-Null

    $proc = Wait-ForTauriProcess
    if (-not $proc) {
        throw "oasis-shell process did not start"
    }

    if (-not (Wait-ForFrontend)) {
        throw "frontend did not become ready on http://localhost:1420"
    }
}

Start-TauriDevIfNeeded

$lines = New-Object System.Collections.Generic.List[string]
$lines.Add("Oasis Shell Smoke Diagnostics")
$lines.Add("Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')")
$lines.Add("")

$lines.Add("== Smoke Check ==")
try {
    $smokeOutput = cmd /c "cd /d $root && npm run smoke" 2>&1
    $smokeOutput | ForEach-Object { $lines.Add($_.ToString()) }
} catch {
    $lines.Add("Smoke command failed: $($_.Exception.Message)")
}
$lines.Add("")

$lines.Add("== Environment ==")
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^OASIS_FOUNDER_SECRET=') {
            $lines.Add('OASIS_FOUNDER_SECRET=[configured]')
        } else {
            $lines.Add($_)
        }
    }
} else {
    $lines.Add(".env not found")
}
$lines.Add("")

$lines.Add("== Processes ==")
try {
    $procs = Get-Process | Where-Object { $_.ProcessName -match 'node|cargo|rustc|oasis-shell' } | Select-Object ProcessName, Id
    ($procs | Format-Table -AutoSize | Out-String).TrimEnd().Split("`n") | ForEach-Object { $lines.Add($_.TrimEnd()) }
} catch {
    $lines.Add("Process collection failed: $($_.Exception.Message)")
}
$lines.Add("")

$lines.Add("== Recent Tauri Log ==")
if (Test-Path $tauriLogPath) {
    Get-Content $tauriLogPath -Tail 80 | ForEach-Object { $lines.Add($_) }
} else {
    $lines.Add("tauri-dev.log not found")
}

Set-Content -Path $reportPath -Value $lines
Write-Host ""
Write-Host "Diagnostics saved to:" -ForegroundColor Cyan
Write-Host $reportPath
Write-Host ""
