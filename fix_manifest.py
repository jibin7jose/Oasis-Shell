
import os

path = r"d:\myproject\new\oasis-shell\src\App.tsx"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
skip = 0
found = False

# Pattern to find the damaged line
marker = 'asset.authorizer}</span></span><button'

for line in lines:
    if skip > 0:
        skip -= 1
        continue
    
    if marker in line:
        # We restore the EXACT JSX structure with confirmed indentation
        new_lines.append('                             <span className="text-[10px] font-bold text-indigo-400">{asset.authorizer}</span>\n')
        new_lines.append('                          </div>\n')
        new_lines.append('                       </div>\n')
        new_lines.append('                       <button onClick={() => handleSealAsset(asset.file_path, asset.file_path.split("/").pop() || "Strategic Asset")} className="w-full mt-6 py-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase tracking-widest rounded-2xl transition-all border border-amber-500/20 flex items-center justify-center gap-2">\n')
        new_lines.append('                          <Lock className="w-3 h-3" /> Seal within Sentinel\n')
        new_lines.append('                       </button>\n')
        new_lines.append('                    </motion.div>\n')
        skip = 3
        found = True
    else:
        new_lines.append(line)

if found:
    with open(path, "w", encoding="utf-8") as f:
        f.writelines(new_lines)
    print("RECOVERY_COMPLETE")
else:
    print("FRACTURE_NOT_FOUND")
