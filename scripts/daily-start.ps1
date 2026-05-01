$ErrorActionPreference = "Stop"

Write-Host "[daily-start] Launching desktop dev stack in background..."
$devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev:clean" -WorkingDirectory (Get-Location) -PassThru -WindowStyle Hidden

Write-Host "[daily-start] Waiting for initial boot..."
Start-Sleep -Seconds 12

if ($devProcess.HasExited) {
  throw "[daily-start] Dev process exited early. Check tauri-dev.log for details."
}

Write-Host "[daily-start] Running full health check..."
npm run health:full

Write-Host "[daily-start] Complete. Dev PID: $($devProcess.Id)"
