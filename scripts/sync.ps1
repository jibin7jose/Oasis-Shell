Param(
    [string]$message = ""
)

# Oasis Shell - Neural Sync (Oasis Pulse)
# This script stages ALL changes including newly created Docs & Code.

Write-Host ">>> Triggering Oasis Pulse: Neural Sync for GitHub <<<" -ForegroundColor Cyan

# Stage all files
git add .

# Use provided message or generate a generic timestamped one
if ($message -eq "") {
    $commitMessage = "Oasis Sync: Feature Update & Documentation Refresh - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
} else {
    $commitMessage = "Oasis Pulse: $message"
}

git commit -m "$commitMessage"

# Push to the remote branch
# Assumes 'main' branch and remote 'origin'
# If origin is not set, this will fail gracefully or skip the push.
if ((git remote) -ne $null) {
    Write-Host ">>> Synchronizing with GitHub Remote..." -ForegroundColor Yellow
    git push origin master
} else {
    Write-Host ">>> No GitHub Remote set! Link your repository to enable Auto-Push." -ForegroundColor Red
    Write-Host ">>> Run: git remote add origin <GITHUB_URL>"
}

Write-Host ">>> Sync Complete! Your Project is backed up. <<<" -ForegroundColor Green
