import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. handlePinContext update
pin_pattern = r'const handlePinContext = async \(name: string\) => \{([\s\S]+?)\};'
pin_replacement = r"""const handlePinContext = async (name: string) => {
    try {
      const windowLayout = await invoke("get_active_windows");
      const currentState = {
        activeVenture,
        activeView,
        zenMode,
        autoAura,
        windowLayout
      };

      const state_blob = JSON.stringify(currentState);
      await invoke("pin_context", { name, state_blob, aura: activeVenture === "Sentinel" ? "rose" : "indigo" });
      
      const pins = await invoke("get_pinned_contexts") as any[];
      setPinnedContexts(pins);
      setNotification("Venture Snapshot Sealed: " + name);
    } catch (e) {
      setNotification("Snapshot Manifest Failed: " + e);
    }
  };"""

content = re.sub(pin_pattern, pin_replacement, content)

# 2. handleRestoreContext update
restore_pattern = r'const handleRestoreContext = async \(pin: any\) => \{([\s\S]+?)\};'
restore_replacement = r"""const handleRestoreContext = async (pin: any) => {
    try {
      const state = JSON.parse(pin.state_blob);
      if (state.activeVenture) setActiveVenture(state.activeVenture);
      if (state.activeView) setActiveView(state.activeView);
      if (state.zenMode !== undefined) setZenMode(state.zenMode);
      if (state.autoAura !== undefined) setAutoAura(state.autoAura);

      // OS Parallel Restoration
      if (state.windowLayout) {
        await invoke("set_window_layout", { layout: state.windowLayout });
      }

      setNotification("Venture Context Restored: " + pin.name);
    } catch (e) {
      setNotification("Context Restoration Divergent: " + e);
    }
  };"""

content = re.sub(restore_pattern, restore_replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Parallel Layout Injection Successful.")
