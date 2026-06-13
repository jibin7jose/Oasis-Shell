$testDir = "$PSScriptRoot\..\test_workspace"
$resultDir = "$PSScriptRoot\..\test_results"
$report = "$resultDir\terminal_commands_result.txt"

New-Item -ItemType Directory -Force -Path $testDir | Out-Null
if (-Not (Test-Path $resultDir)) {
    New-Item -ItemType Directory -Force -Path $resultDir | Out-Null
}

$reportContent = @()
$reportContent += "========================================="
$reportContent += " OASIS TERMINAL AUTOMATED COMMAND REPORT "
$reportContent += "========================================="
$reportContent += "Time: $(Get-Date)"
$reportContent += ""

# 1. SETUP
$reportContent += "[TEST] TOUCH  -> Executing touch command equivalent"
New-Item -ItemType File -Force -Path "$testDir\source.txt" | Out-Null
"Hello Oasis" | Out-File "$testDir\source.txt"
$reportContent += "[SETUP] Created source.txt"

# 2. MKDIR / MD
New-Item -ItemType Directory -Force -Path "$testDir\newfolder" | Out-Null
if (Test-Path "$testDir\newfolder") {
    $reportContent += "[TEST] MKDIR  -> SUCCESS (newfolder created)"
} else {
    $reportContent += "[TEST] MKDIR  -> FAILED"
}

# 3. COPY
Copy-Item "$testDir\source.txt" "$testDir\copy.txt"
if (Test-Path "$testDir\copy.txt") { 
    $reportContent += "[TEST] COPY   -> SUCCESS (copy.txt created)" 
} else {
    $reportContent += "[TEST] COPY   -> FAILED" 
}

# 4. RENAME
Rename-Item "$testDir\copy.txt" "renamed.txt"
if (Test-Path "$testDir\renamed.txt") { 
    $reportContent += "[TEST] RENAME -> SUCCESS (renamed.txt verified)" 
} else {
    $reportContent += "[TEST] RENAME -> FAILED" 
}

# 5. FIND
$find = Get-ChildItem -Path $testDir -Recurse -Filter "*renamed*" | Select-Object -ExpandProperty Name
if ($find -eq "renamed.txt") {
    $reportContent += "[TEST] FIND   -> SUCCESS (Found $find)"
} else {
    $reportContent += "[TEST] FIND   -> FAILED"
}

# 6. DETAILS
$details = Get-ItemProperty "$testDir\renamed.txt"
if ($null -ne $details.Length) {
    $reportContent += "[TEST] DETAILS-> SUCCESS (File length: $($details.Length) bytes)"
} else {
    $reportContent += "[TEST] DETAILS-> FAILED"
}

# 7. SYSINFO
$sysinfo = Get-ComputerInfo | Select-Object OsName,OsArchitecture | Out-String
if ($sysinfo -match "OsName") {
    $reportContent += "[TEST] SYSINFO-> SUCCESS (OS Name retrieved)"
} else {
    $reportContent += "[TEST] SYSINFO-> FAILED"
}

# 8. IPCONFIG
$ip = Get-NetIPAddress | Select-Object -First 1
if ($null -ne $ip) {
    $reportContent += "[TEST] IP     -> SUCCESS (IP properties accessed)"
} else {
    $reportContent += "[TEST] IP     -> FAILED"
}

# 9. DELETE / REMOVE
Remove-Item "$testDir\source.txt" -Force
Remove-Item "$testDir\renamed.txt" -Force
Remove-Item "$testDir\newfolder" -Force
if (-Not (Test-Path "$testDir\source.txt")) {
    $reportContent += "[TEST] DELETE -> SUCCESS (Files permanently purged)"
} else {
    $reportContent += "[TEST] DELETE -> FAILED"
}

# CLEANUP
Remove-Item -Recurse -Force $testDir

$reportContent += "========================================="
$reportContent += " END OF AUTOMATED TESTS"
$reportContent += "========================================="

$reportContent | Out-File -FilePath $report
Write-Host "Test complete. Results saved to $report"
