import os
import re

path = r'd:\myproject\new\oasis-shell\src\components\panels\SystemPanel.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix for storage.length and storage.map
content = content.replace('{storage.length} volumes', '{(storage ?? []).length} volumes')
content = content.replace('{storage.length === 0 && (', '{(storage ?? []).length === 0 && (')
content = content.replace('{storage.map((disk) => {', '{(storage ?? []).map((disk) => {')

# Fix for devices.length and devices.map
content = content.replace('{devices.length} signals', '{(devices ?? []).length} signals')
content = content.replace('{devices.length === 0 && (', '{(devices ?? []).length === 0 && (')
content = content.replace('{devices.map((dev, i) => (', '{(devices ?? []).map((dev, i) => (')

# Fix for windows.length and windows.map
content = content.replace('{windows.length}', '{(windows ?? []).length}')
content = content.replace('{windows.length === 0 && (', '{(windows ?? []).length === 0 && (')
content = content.replace('{windows.map((win) => (', '{(windows ?? []).map((win) => (')

# Fix for filteredAudit.length and filteredAudit.map/slice
content = content.replace('{filteredAudit.length === 0 && (', '{((filteredAudit ?? [])).length === 0 && (')
content = content.replace('{filteredAudit', '{(filteredAudit ?? [])')

# Fix for processes.length
content = content.replace('{processes.length}', '{(processes ?? []).length}')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("SystemPanel Structural Null-Guards Applied.")
