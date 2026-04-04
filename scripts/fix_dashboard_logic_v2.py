import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Refined pattern to match exactly what's in App.tsx
pattern = r"\{activeView !== 'dash' && \([\s\S]+?\{contexts\.map\([\s\S]+?\)\}\s+<\/div>\s+<\/?>\}"

replacement = """{activeView !== 'dash' && (
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

            {activeView === 'dash' && (
              <>
                {!presentationMode && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="w-full max-w-2xl glass-bright rounded-[2.5rem] p-6 shadow-3xl border border-white/5 hover:border-white/10 transition-all mb-12"
                  >
                    <div className="flex items-center gap-5 px-4 py-2">
                      <Search className={cn("w-7 h-7 transition-colors", isThinking ? "text-indigo-400 animate-pulse" : "text-slate-600")} />
                      <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleSearchIntent}
                        placeholder="Detecting Neural Intent..."
                        className="bg-transparent border-none outline-none text-2xl w-full text-white placeholder:text-slate-700 font-light"
                      />
                      <kbd className="hidden md:flex bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Enter</kbd>
                    </div>
                  </motion.div>
                )}

                <div className="flex gap-12 items-center overflow-hidden w-full max-w-5xl py-4 border-y border-white/5 bg-black/20 backdrop-blur-md px-12 rounded-[5rem] mb-12 group cursor-pointer relative">
                  <div className="flex gap-12 items-center animate-marquee whitespace-nowrap group-hover:pause">
                    {marketIntel.map((m: any, i: number) => (
                      <div key={i} className="flex gap-4 items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.symbol}</span>
                        <span className="text-sm font-bold text-white tracking-tight">{m.price}</span>
                        <span className={cn("text-[10px] font-black tracking-widest uppercase", m.change.startsWith('+') ? "text-emerald-500" : "text-red-500")}>
                          {m.change}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                  {[
                    { label: 'Target ARR', val: simMode ? `$${simMetrics.arr}M` : founderMetrics.arr, icon: Activity },
                    { label: 'Burn Rate', val: simMode ? `$${simMetrics.burn}K` : founderMetrics.burn, icon: Zap },
                    { label: 'Projected Runway', val: founderMetrics.runway, icon: Shield },
                    { label: 'Growth Momentum', val: simMode ? `${simMetrics.momentum}%` : founderMetrics.momentum, icon: Activity }
                  ].map((m, i) => (
                    <div key={i} className="glass p-6 rounded-3xl border border-white/5 flex flex-col gap-3">
                      <m.icon className="w-5 h-5 text-indigo-400" />
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{m.label}</span>
                        <div className="text-xl font-bold text-white">{m.val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <SystemPanel
                  stats={systemStats}
                  windows={runningWindows}
                  processes={processes}
                  storage={storageMap}
                  devices={devices}
                  processPriorities={processPriorities}
                  priorityCache={priorityCache}
                  batteryHealth={batteryHealth}
                  lastSync={systemLastSync}
                  onRefresh={refreshSystemSnapshot}
                  onKillProcess={handleKillProcess}
                  onSuspendProcess={handleSuspendProcess}
                  onResumeProcess={handleResumeProcess}
                  onSetPriority={handleSetPriority}
                />
              </>
            )}

            {activeView === 'timeline' && (
              <CortexLog 
                logs={neuralLogs} 
                onRefresh={refreshSystemSnapshot}
              />
            )}

            <div className="flex gap-8 pb-12">
              {contexts.map((ctx) => {
                const Icon = ctx.icon;
                const isActive = activeContext === ctx.id;
                return (
                  <motion.button
                    key={ctx.id}
                    onClick={() => handleContextSwitch(ctx.id)}
                    whileHover={{ y: -5 }}
                    className={cn("flex flex-col items-center gap-4 group", isActive ? "opacity-100" : "opacity-30 hover:opacity-100")}
                  >
                    <div className={cn("w-20 h-20 rounded-[1.8rem] flex items-center justify-center border transition-all shadow-2xl", isActive ? "bg-indigo-600 border-white/20 shadow-indigo-500/40" : "glass border-transparent hover:border-white/10")}>
                      <Icon className={cn("w-8 h-8", isActive ? "text-white" : "text-slate-500")} />
                    </div>
                    <span className={cn("text-[9px] font-bold uppercase tracking-[0.3em]", isActive ? "text-white" : "text-slate-600")}>{ctx.name}</span>
                  </motion.button>
                );
              })}
            </div>"""

new_content = re.sub(pattern, replacement, content)

if new_content == content:
    print("Pattern Match Failed. Trying fallback.")
    # Fallback to a broader match if possible
    # ...
else:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Dashboard Logic Restoration Successful.")
