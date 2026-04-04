import os

path = r'd:\myproject\new\oasis-shell\src\components\overlays\CommandPalette.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. BASE_COMMANDS
old_bc = '  { id: "process_quarantine", label: "Quarantine Process", hint: "Kill a process by PID", permission: "process_control" }\n];'
new_bc = '  { id: "process_quarantine", label: "Quarantine Process", hint: "Kill a process by PID", permission: "process_control" },\n  { id: "pin_context", label: "Pin Context Snapshot", hint: "Freeze current workspace metrics", permission: "system_control" }\n];'
content = content.replace(old_bc, new_bc)

# 2. handleExecute
old_he = '    else if (cmd.id === "process_quarantine") setPidMode(true);\n    else if (cmd.id === "open_vault") onExecute("vault");'
# Wait, maybe it uses single quotes
if old_he not in content:
    old_he = "    else if (cmd.id === 'process_quarantine') setPidMode(true);\n    else if (cmd.id === 'open_vault') onExecute('vault');"

new_he = "    else if (cmd.id === 'process_quarantine') setPidMode(true);\n    else if (cmd.id === 'pin_context') { onPinContext('Snapshot ' + new Date().toLocaleTimeString()); onClose(); }\n    else if (cmd.id === 'open_vault') onExecute('vault');"
content = content.replace(old_he, new_he)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Command Manifest Successful.")
