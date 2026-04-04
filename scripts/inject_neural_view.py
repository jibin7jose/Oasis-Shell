import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State Injection
if 'const [neuralLogs' not in content:
    old_st = "  const [activeView, setActiveView] = useState<'dash' | 'processes' | 'storage'>('dash');"
    new_st = "  const [activeView, setActiveView] = useState<'dash' | 'processes' | 'storage' | 'timeline'>('dash');\n  const [neuralLogs, setNeuralLogs] = useState<any[]>([]);"
    content = content.replace(old_st, new_st)

# 2. Sync Logic Injection
if 'const logs = await invoke("get_neural_logs"' not in content:
    sync_p = r'const pins = await invoke\("get_pinned_contexts"\) as any\[\];\s+setPinnedContexts\(pins\);'
    sync_replacement = """const pins = await invoke("get_pinned_contexts") as any[];
        setPinnedContexts(pins);
        const logs = await invoke("get_neural_logs", { limit: 50 }) as any[];
        setNeuralLogs(logs);"""
    content = re.sub(sync_p, sync_replacement, content)

# 3. Add Component Import
if 'import CortexLog' not in content:
    imp_p = "import SystemPanel from './components/panels/SystemPanel';"
    content = content.replace(imp_p, "import SystemPanel from './components/panels/SystemPanel';\nimport CortexLog from './components/panels/CortexLog';")

# 4. View Rendering
if 'activeView === \'timeline\'' not in content:
    panel_p = r'storage=\{storageMap\}[\s\S]+?onSetPriority=\{handleSetPriority\}\s+/>'
    panel_replacement = """storage={storageMap}
              devices={devices}
              processPriorities={processPriorities}
              batteryHealth={batteryHealth}
              lastSync={systemLastSync}
              onRefresh={refreshSystemSnapshot}
              onKillProcess={handleKillProcess}
              onSuspendProcess={handleSuspendProcess}
              onResumeProcess={handleResumeProcess}
              onSetPriority={handleSetPriority}
            />
          )}

          {activeView === 'timeline' && (
            <CortexLog 
              logs={neuralLogs} 
              onRefresh={refreshSystemSnapshot}
            />"""
    content = re.sub(panel_p, panel_replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Neural View Injection Successful.")
