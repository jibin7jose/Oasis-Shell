import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. handlePinContext replacement
pin_pattern = r'const handlePinContext = async \(name: string\) => \{[\s\S]+?  \};'
pin_replacement = """const handlePinContext = async (name: string) => {
    try {
      const windowLayout = await invoke("get_active_windows");
      const stateBlob = JSON.stringify({
        view: activeView,
        venture: activeVenture,
        zen: zenMode,
        sim: simMode,
        aura: activeContext,
        windowLayout,
        timestamp: new Date().toISOString()
      });

      await invoke("pin_context", { 
        name: name || `Snapshot ${new Date().toLocaleTimeString()}`, 
        stateBlob, 
        aura: activeContext 
      });
      
      const pins = await invoke("get_pinned_contexts") as any[];
      setPinnedContexts(pins);
      const logs = await invoke("get_neural_logs", { limit: 50 }) as any[];
      setNeuralLogs(logs);
      setNotification(`Chronos Snapshot Pin Manifested: [${name || 'System'}]`);
    } catch (e) {
      setNotification(`State Freeze Failed: ${e}`);
    }
  };"""

content = re.sub(pin_pattern, pin_replacement, content)

# 2. handleRestoreContext replacement
restore_pattern = r'const handleRestoreContext = \(pin: any\) => \{[\s\S]+?  \};'
restore_replacement = """const handleRestoreContext = async (pin: any) => {
    try {
      const state = JSON.parse(pin.state_blob);
      if (state.view) setActiveView(state.view);
      if (state.zen !== undefined) setZenMode(state.zen);
      if (state.sim !== undefined) setSimMode(state.sim);
      if (state.venture) setActiveVenture(state.venture);
      
      // OS Parallel Restoration
      if (state.windowLayout) {
        await invoke("set_window_layout", { layout: state.windowLayout });
      }

      setNotification(`Chronos Restored: ${pin.name}`);
    } catch (e) {
      setNotification("Temporal Drift detected. Snapshot Corrupted.");
    }
  };"""

# Note: Changing handleRestoreContext to async in replace_file_content would be safer
content = re.sub(restore_pattern, restore_replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Parallel Snapshots Injection Successful.")
