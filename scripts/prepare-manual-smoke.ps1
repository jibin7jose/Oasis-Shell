param()

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$assetPath = Join-Path $root "smoke-assets\founder-directive.txt"
$envPath = Join-Path $root ".env"

if (-not (Test-Path $assetPath)) {
    throw "Smoke asset not found: $assetPath"
}

$founderSecret = $null
if (Test-Path $envPath) {
    $secretLine = Get-Content -Path $envPath | Where-Object { $_ -match '^OASIS_FOUNDER_SECRET=' } | Select-Object -First 1
    if ($secretLine) {
        $founderSecret = ($secretLine -split "=", 2)[1].Trim()
    }
}

Write-Host ""
Write-Host "Oasis Shell Manual Smoke Prep" -ForegroundColor Cyan
Write-Host "--------------------------------" -ForegroundColor DarkCyan
Write-Host "Founder secret : $founderSecret"
Write-Host "Vault test file : $assetPath"
Write-Host ""
Write-Host "Suggested desktop checks:" -ForegroundColor Cyan
Write-Host "1. Boardroom -> SUMMON LOCAL ORACLE"
Write-Host "2. Sentinel Vault -> login with the founder secret above"
Write-Host "3. Sentinel Vault -> seal the file path above"
Write-Host "4. Sentinel Vault -> unseal it and confirm restore"
Write-Host "5. Terminal -> status"
Write-Host "6. Terminal -> audit"
Write-Host "7. Terminal -> ls --strategic"
Write-Host "8. Workforce -> open panel and confirm no runtime error"
Write-Host ""
