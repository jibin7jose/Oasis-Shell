import os

path = r"D:\myproject\new\oasis-shell\src\App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Patch Header with Live OS HUD
old_header = """               <h1 className={cn("text-xl font-bold tracking-tight text-white flex items-center gap-2 transition-all", zenMode && "opacity-0 translate-y-[-10px]")}>
                 <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                 {activeVenture} 
                 <span className="text-slate-500 text-xs font-normal">[{contexts.find(c => c.id === activeContext)?.name}]</span>
                 <span className="ml-4 text-[9px] font-mono text-amber-500/50 border border-amber-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">V4.4.1-SENTINEL (ENCRYPTED CORE)</span>"""

new_header = """               <h1 className={cn("text-xl font-bold tracking-tight text-white flex items-center gap-6 transition-all", zenMode && "opacity-0 translate-y-[-10px]")}>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_10px_#6366f1]" />
                    <span className="uppercase tracking-tighter">{activeVenture}</span>
                  </div>

                  <div className="flex items-center gap-6 border-l border-white/10 pl-6 h-8">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Host Pulse</span>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-indigo-400 font-black">{systemStats? systemStats.cpu_load.toFixed(1) : "0.0"}% CPU</span>
                        <span className="text-[10px] font-mono text-purple-400 font-black">{systemStats? systemStats.mem_used.toFixed(1) : "0.0"}% RAM</span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Power</span>
                      <div className="flex items-center gap-2">
                        <Shield className={cn("w-3 h-3", systemStats?.is_charging ? "text-emerald-500 animate-pulse" : "text-amber-500")} />
                        <span className="text-[10px] font-mono text-slate-300 font-bold">{systemStats? systemStats.battery_level : "0"}%</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[9px] font-mono text-indigo-500/50 border border-indigo-500/20 px-3 py-1 rounded-lg font-black tracking-widest uppercase bg-indigo-500/5">
                    OAS_KRNL_4.5 // SENTINEL CORE
                  </span>"""

if old_header in content:
    content = content.replace(old_header, new_header)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Header patched.")
else:
    print("Header pattern not found.")
