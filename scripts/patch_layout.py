import os

path = r"D:\myproject\new\oasis-shell\src\App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Patch Command Palette Overlay
old_alerts = """      {/* Oracle Alert Notification (Pillar 20) */}"""
new_alerts = """      {/* Neural Command Palette (GLOBAL CORE) */}
      <AnimatePresence>
        {showCommandPalette && (
          <CommandPalette />
        )}
      </AnimatePresence>

      {/* Oracle Alert Notification (Pillar 20) */}"""

content = content.replace(old_alerts, new_alerts)

# 2. Patch Sidebar
old_nav_block = """          <nav className="flex-1 flex flex-col gap-6 items-center">
            {[
              { id: 'dash', icon: LayoutDashboard, label: 'Dash' },
              { id: 'graph', icon: BrainCircuit, label: 'Cortex' },
              { id: 'vault', icon: FolderOpen, label: 'Vault' },
              { id: 'logs', icon: Activity, label: 'History' },
              { id: 'sim', icon: Zap, label: 'Simulation' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'graph') setShowGraph(true);
                  else if (item.id === 'vault') setShowVault(true);
                  else if (item.id === 'logs') setShowLogs(true);
                  else if (item.id === 'sim') setSimMode(true);
                  else { handleContextSwitch('dev'); }
                }}
                className={cn(
                  "p-4 rounded-2xl transition-all group relative",
                  (item.id === 'sim' && simMode) ? "bg-amber-500/20 text-amber-500" : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >"""

new_nav_block = """          <nav className="flex-1 flex flex-col gap-6 items-center">
            {[
              { id: 'dash', icon: LayoutDashboard, label: 'Dash' },
              { id: 'processes', icon: Cpu, label: 'Nodes' },
              { id: 'storage', icon: Shield, label: 'Disk' },
              { id: 'graph', icon: BrainCircuit, label: 'Cortex' },
              { id: 'vault', icon: FolderOpen, label: 'Vault' },
              { id: 'logs', icon: Activity, label: 'Pulse' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (['dash', 'processes', 'storage'].includes(item.id)) setActiveView(item.id as any);
                  else if (item.id === 'graph') setShowGraph(true);
                  else if (item.id === 'vault') setShowVault(true);
                  else if (item.id === 'logs') setShowLogs(true);
                }}
                className={cn(
                  "p-4 rounded-2xl transition-all group relative",
                  activeView === item.id ? "bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]" : "text-slate-500 hover:text-white hover:bg-white/5"
                )}
              >"""

content = content.replace(old_nav_block, new_nav_block)

# 3. Patch Main Content Area for switching rooms
old_intent_bar = """        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-12 overflow-y-auto custom-scrollbar">"""
new_intent_bar = """        <div className="flex-1 flex flex-col items-center justify-start pt-12 p-12 overflow-y-auto custom-scrollbar">
            {activeView !== 'dash' && (
               <div className="w-full max-w-7xl flex flex-col items-start gap-12">
                  <div className="flex items-center gap-6">
                     <button onClick={() => setActiveView('dash')} className="p-4 glass rounded-[1.5rem] hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                        <RotateCcw className="w-6 h-6" />
                     </button>
                     <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
                        {activeView === 'processes' ? 'Strategic Process HUD' : 'Host Storage Atlas'}
                     </h2>
                  </div>
                  <SystemHUD />
               </div>
            )}

            {activeView === 'dash' && <>
"""

content = content.replace(old_intent_bar, new_intent_bar)

# 4. Closing the dash block
old_closing = """                  </motion.button>
                );
              })}
            </div>
        </div>"""

new_closing = """                  </motion.button>
                );
              })}
            </div>
            </>}
        </div>"""

content = content.replace(old_closing, new_closing)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("Patch complete.")
