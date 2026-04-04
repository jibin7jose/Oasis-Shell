import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Inject Handlers before handlePaletteAction
if 'const handlePinContext' not in content:
    handlers = """  const handlePinContext = async (name: string) => {
    const stateBlob = JSON.stringify({
      view: activeView,
      venture: activeVenture,
      zen: zenMode,
      sim: simMode,
      aura: activeContext,
      integrity: ventureIntegrity,
      timestamp: new Date().toISOString()
    });

    try {
      await invoke("pin_context", { 
        name: name || `Snapshot ${new Date().toLocaleTimeString()}`, 
        stateBlob, 
        aura: activeContext 
      });
      const pins = await invoke("get_pinned_contexts") as any[];
      setPinnedContexts(pins);
      setNotification(`Chronos Snapshot Pin Manifested: [${name || 'System'}]`);
    } catch (e) {
      setNotification(`State Freeze Failed: ${e}`);
    }
  };

  const handleRestoreContext = (pin: any) => {
    try {
      const state = JSON.parse(pin.state_blob);
      if (state.view) setActiveView(state.view);
      if (state.zen !== undefined) setZenMode(state.zen);
      if (state.sim !== undefined) setSimMode(state.sim);
      setNotification(`Chronos Restored: ${pin.name}`);
    } catch (e) {
      setNotification("Temporal Drift detected. Snapshot Corrupted.");
    }
  };

"""
    content = content.replace('  const handlePaletteAction = async (id: string) => {', handlers + '  const handlePaletteAction = async (id: string) => {')

# 2. Update LeftRail props
# We look for <LeftRail.../> and add the new props
lr_pattern = r'<LeftRail\s+activeView=\{activeView\}[\s\S]+?/>'
replacement = """<LeftRail
        activeView={activeView}
        onViewChange={(v: any) => setActiveView(v)}
        presentationMode={presentationMode}
        simMode={simMode}
        onDash={() => setActiveView("dash")}
        onOpenGraph={() => setShowGraph(true)}
        onOpenVault={() => setShowVault(true)}
        onOpenLogs={() => setShowLogs(true)}
        onActivateSim={() => setSimMode(true)}
        onToggleSim={() => setSimMode(!simMode)}
        onOpenSettings={() => setShowSettings(!showSettings)}
        chronosIndex={chronosIndex}
        chronosCount={pinnedContexts.length}
        chronosLabel={chronosIndex >= 0 ? pinnedContexts[chronosIndex]?.name : undefined}
        onChronosChange={handleChronosSliderChange}
        onJumpToPresent={() => setChronosIndex(-1)}
        pinnedContexts={pinnedContexts}
        onRestoreContext={handleRestoreContext}
      />"""

content = re.sub(lr_pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Phase 3.5 Manifest Successful.")
