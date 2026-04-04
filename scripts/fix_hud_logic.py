import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the broken SystemHUD logic in App.tsx
# Problem: disk.health_score does not exist in StorageInfo
hud_pattern = r'animate=\{\{ width: `\$\{100 - disk\.health_score\}%` \}\}\s+className=\{cn\("h-full", disk\.health_score < 20 \? "bg-rose-500" : "bg-indigo-500 shadow-\[0_0_15px_#6366f1\]"\)\}'
hud_replacement = r'animate={{ width: `${((disk.total - disk.available) / disk.total * 100).toFixed(1)}%` }}\n                     className={cn("h-full", (disk.available / disk.total) < 0.1 ? "bg-rose-500" : "bg-indigo-500 shadow-[0_0_15px_#6366f1]")}'

content = re.sub(hud_pattern, hud_replacement, content)

# Check for any other broken properties in SystemHUD
# disk.name, disk.mount, disk.available, disk.total are all valid

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("SystemHUD Logic Restoration Successful.")
