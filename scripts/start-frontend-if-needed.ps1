param()

$ErrorActionPreference = "Stop"

function Test-FrontendPort {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        try {
            $client.Connect("127.0.0.1", 1420)
            return $true
        } catch {
            return $false
        } finally {
            $client.Close()
        }
    } catch {
        return $false
    }
}

if (Test-FrontendPort) {
    Write-Host "Frontend already listening on http://localhost:1420"
    exit 0
}

Write-Host "Starting frontend on http://localhost:1420..."
Set-Location $PSScriptRoot/..
npm run frontend
