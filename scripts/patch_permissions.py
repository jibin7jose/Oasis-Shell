import os
import re

path = r"D:\myproject\new\oasis-shell\src\App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Permissions State
if 'const [permissions, setPermissions]' not in content:
    # Inject after activeView state
    content = content.replace(
        "const [activeView, setActiveView] = useState<'dash' | 'processes' | 'storage'>('dash');",
        "const [activeView, setActiveView] = useState<'dash' | 'processes' | 'storage'>('dash');\n  const [permissions, setPermissions] = useState<Record<string, boolean>>({\n    process_control: false,\n    system_control: false\n  });"
    )

# 2. Add Request Permission Handler
if 'const handleRequestPermission' not in content:
    handler = """  const handleRequestPermission = (perm: string, label: string) => {
    setNotification(`Security: Elevated Access Required for [${label}]`);
    // In a real scenario, this would trigger a biometric/passkey prompt
    setTimeout(() => {
      setPermissions(prev => ({ ...prev, [perm]: true }));
      setNotification(`Authority Granted: ${perm} unlocked.`);
    }, 1500);
  };"""
    
    # Inject before handlePaletteAction
    content = content.replace("  const handlePaletteAction = async (id: string) => {", handler + "\n\n  const handlePaletteAction = async (id: string) => {")

# 3. Update CommandPalette passing
old_palette_usage = """        {showCommandPalette && (
          <CommandPalette 
            open={showCommandPalette}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onClose={() => setShowCommandPalette(false)}
            onExecute={handlePaletteAction}
          />
        )}"""

new_palette_usage = """        {showCommandPalette && (
          <CommandPalette 
            open={showCommandPalette}
            query={searchQuery}
            onQueryChange={setSearchQuery}
            onClose={() => setShowCommandPalette(false)}
            onExecute={handlePaletteAction}
            permissions={permissions as any}
            onRequestPermission={handleRequestPermission}
          />
        )}"""

content = content.replace(old_palette_usage, new_palette_usage)

with open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("App.tsx permissions system injected.")
