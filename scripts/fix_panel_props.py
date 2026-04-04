import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the SystemPanel props in App.tsx
panel_pattern = r'<SystemPanel[\s\S]+?onSetPriority=\{handleSetPriority\}'
panel_replacement = r"""<SystemPanel
                  stats={systemStats}
                  windows={runningWindows}
                  processes={processes}
                  storage={storageMap}
                  devices={devices}
                  processPriorities={processPriorities}
                  priorityCache={priorityCache}
                  priorityAudit={priorityAudit}
                  batteryHealth={batteryHealth}
                  lastSync={systemLastSync}
                  onRefresh={refreshSystemSnapshot}
                  onKillProcess={handleKillProcess}
                  onSuspendProcess={handleSuspendProcess}
                  onResumeProcess={handleResumeProcess}
                  onSetPriority={handleSetPriority}
                  onClearCacheReset={handleClearCacheReset}"""

content = re.sub(panel_pattern, panel_replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("SystemPanel Props Restoration Successful.")
