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
