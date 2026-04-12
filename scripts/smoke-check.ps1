param()

$ErrorActionPreference = "Stop"

function Test-Endpoint {
    param(
        [string]$Name,
        [scriptblock]$Probe
    )

    try {
        $result = & $Probe
        [PSCustomObject]@{
            Name = $Name
            Status = "OK"
            Detail = $result
        }
    } catch {
        [PSCustomObject]@{
            Name = $Name
            Status = "FAIL"
            Detail = $_.Exception.Message
        }
    }
}

$root = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $root ".env"
$tauriLogPath = Join-Path $root "tauri-dev.log"

$checks = @()

$checks += Test-Endpoint "Frontend" {
    (Invoke-WebRequest -UseBasicParsing -Uri "http://localhost:1420").StatusCode
}

$checks += Test-Endpoint "Ollama API" {
    $tags = Invoke-RestMethod -Method Get -Uri "http://localhost:11434/api/tags"
    ($tags.models | Select-Object -ExpandProperty name) -join ", "
}

$checks += Test-Endpoint "Ollama Generate" {
    $body = @{
        model  = "gemma3:4b"
        prompt = "Reply in one short line: local oracle smoke check."
        stream = $false
    } | ConvertTo-Json

    $res = Invoke-RestMethod -Method Post -Uri "http://localhost:11434/api/generate" -ContentType "application/json" -Body $body
    $text = ($res.response | Out-String).Trim()
    if ([string]::IsNullOrWhiteSpace($text)) {
        throw "Empty response from Ollama generate endpoint"
    }

    $text
}

$checks += Test-Endpoint "Founder Secret" {
    if (-not (Test-Path $envPath)) {
        throw ".env not found"
    }

    $content = Get-Content -Path $envPath
    $secretLine = $content | Where-Object { $_ -match '^OASIS_FOUNDER_SECRET=' } | Select-Object -First 1
    if (-not $secretLine) {
        throw "OASIS_FOUNDER_SECRET missing from .env"
    }

    $value = ($secretLine -split "=", 2)[1].Trim()
    if ([string]::IsNullOrWhiteSpace($value)) {
        throw "OASIS_FOUNDER_SECRET is empty"
    }

    "Configured"
}

$checks += Test-Endpoint "Tauri Process" {
    $proc = Get-Process | Where-Object { $_.ProcessName -eq "oasis-shell" } | Select-Object -First 1
    if (-not $proc) {
        throw "oasis-shell process not running"
    }

    "PID $($proc.Id)"
}

$checks += Test-Endpoint "Tauri Log" {
    if (-not (Test-Path $tauriLogPath)) {
        throw "tauri-dev.log not found"
    }

    $tail = Get-Content -Path $tauriLogPath -Tail 20
    $tailText = $tail -join "`n"
    if ($tailText -match 'Running `target\\debug\\oasis-shell.exe`' -or $tailText -match 'Running target\\debug\\oasis-shell.exe') {
        "Desktop app launched"
    } else {
        ($tail | Select-Object -Last 5) -join " | "
    }
}

$checks | Format-Table -AutoSize

$failed = $checks | Where-Object { $_.Status -eq "FAIL" }
if ($failed.Count -gt 0) {
    exit 1
}
