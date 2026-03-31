
import os

path = r"d:\myproject\new\oasis-shell\src\App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Pinpoint targeting of the version span
old_span = 'text-indigo-500/50 border border-indigo-500/20 px-2 py-0.5 rounded">SENTINEL_VERSION_PORTAL'
new_span = 'text-amber-500/50 border border-amber-500/20 px-2 py-0.5 rounded font-black tracking-widest uppercase">V4.4.1-SENTINEL (ENCRYPTED CORE)'

# Global button gateway
button_gate = '</span><button onClick={() => setShowSentinel(true)} className="ml-8 px-6 py-2 bg-amber-600/20 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-amber-600/40 transition-all flex items-center gap-3"><Shield className="w-4 h-4" /> Sentinel Archive</button>'

if old_span in content:
    new_content = content.replace(old_span, new_span + button_gate)
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("INFUSION_COMPLETE")
else:
    print("MARKER_NOT_FOUND")
