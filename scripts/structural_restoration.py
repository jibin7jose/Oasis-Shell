import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Fix Priority Cache source - Auto-Applied in sync loop
sync_pattern = r'\[proc\.name\]: \{ priority: cachedPriority, lastApplied: Date\.now\(\) \}'
sync_replacement = '[proc.name]: { priority: cachedPriority, lastApplied: Date.now(), source: "Auto-Applied" }'
content = content.replace(sync_pattern, sync_replacement)

# 2. Fix Priority Cache source - Manual in handleSetPriority
manual_pattern = r'\[procName\]: \{ priority: priority\.toUpperCase\(\), lastApplied: Date\.now\(\) \}'
manual_replacement = '[procName]: { priority: priority.toUpperCase(), lastApplied: Date.now(), source: "Manual" }'
content = content.replace(manual_pattern, manual_replacement)

# 3. Fix the JSX structure in App.tsx (Line 1182 area)
# The broken structure was:
# {commandOpen && (
#   <AnimatePresence>{zenithActive && <ZenithHUD ... />}</AnimatePresence>
# <CommandPalette ... />
# )}
jsx_broken = r'<AnimatePresence>\s+\{commandOpen && \(\s+<AnimatePresence>\{zenithActive && <ZenithHUD[\s\S]+?onExit=\{[^}]+?\} />\}</AnimatePresence>\s+<CommandPalette[\s\S]+?\/>\s+\)\}\s+<\/AnimatePresence>'
jsx_fixed = """<AnimatePresence>
        {zenithActive && (
          <ZenithHUD 
            cpuLoad={systemStats?.cpu_load??0} 
            integrity={ventureIntegrity} 
            burn={fiscalBurn.total_burn} 
            activeVenture={activeVenture} 
            onExit={() => setZenithActive(false)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {commandOpen && (
           <CommandPalette 
              open={commandOpen}
              query={commandQuery}
              onQueryChange={setCommandQuery}
              onClose={() => setCommandOpen(false)}
              onExecute={handlePaletteAction}
              permissions={permissions}
              onRequestPermission={handleCommandPermissionRequest}
              onQuarantinePid={handleQuarantinePid}
              processes={processes}
              onPinContext={(name) => handlePinContext(name)}
              onZenithPulse={handleZenithPulse}
            />
        )}
      </AnimatePresence>"""

content = re.sub(jsx_broken, jsx_fixed, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Structural Restoration Successful.")
