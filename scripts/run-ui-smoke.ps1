param()

$ErrorActionPreference = "Stop"

Set-Location $PSScriptRoot/..
node ./scripts/ui-smoke.cjs
