import os
import re

path = r'd:\myproject\new\oasis-shell\src\components\overlays\CommandPalette.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# handleExecute
old_he = r"else if \(cmd\.id === 'pin_context'\) \{ onPinContext\('Snapshot ' \+ new Date\(\)\.toLocaleTimeString\(\)\); onClose\(\); \}"
new_he = r"else if (cmd.id === 'pin_context') { onPinContext('Snapshot ' + new Date().toLocaleTimeString()); onClose(); }\n    else if (cmd.id === 'zenith_pulse') { onZenithPulse(); onClose(); }"

content = re.sub(old_he, new_he, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Zenith Directive Injection Successful.")
