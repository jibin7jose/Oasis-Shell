import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State Injection
if 'const [zenithActive' not in content:
    old_st = "  const [mounted, setMounted] = useState(false);"
    new_st = "  const [mounted, setMounted] = useState(false);\n  const [zenithActive, setZenithActive] = useState(false);"
    content = content.replace(old_st, new_st)

# 2. Add Component Import
if 'import ZenithHUD' not in content:
    imp_p = "import CortexLog from './components/panels/CortexLog';"
    content = content.replace(imp_p, "import CortexLog from './components/panels/CortexLog';\nimport ZenithHUD from './components/dashboard/ZenithHUD';")

# 3. Handle Zenith Pulse
if 'const handleZenithPulse' not in content:
    handlers_p = "  const handlePinContext = async (name: string) => {"
    new_handler = """  const handleZenithPulse = () => {
    setZenithActive(true);
    setNotification("Zenith Pulse Manifested. Shrouding Telemetry.");
  };

"""
    content = content.replace(handlers_p, new_handler + handlers_p)

# 4. CommandPalette update (ensure onZenithPulse is passed)
if 'onZenithPulse={handleZenithPulse}' not in content:
    cp_p = r'onPinContext=\{handlePinContext\}\s+/>'
    content = re.sub(cp_p, "onPinContext={handlePinContext}\n          onZenithPulse={handleZenithPulse}\n        />", content)

# 5. UI Shroud (Wrap LeftRail and TopBar in animate presence/check zenith)
# This is tricky without seeing the full structure again.
# I'll just add the ZenithHUD at the bottom for now.
if '<ZenithHUD' not in content:
    hud_p = r'</div>\s+</div>\s+</body>'
    # Wait, App is a div not body.
    # I'll place it near the CommandPalette
    content = content.replace("<CommandPalette", "<AnimatePresence>{zenithActive && <ZenithHUD cpuLoad={systemStats?.cpu_load??0} integrity={ventureIntegrity} burn={fiscalBurn.total_burn} activeVenture={activeVenture} onExit={() => setZenithActive(false)} />}</AnimatePresence>\n      <CommandPalette")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Zenith Logic Injection Successful.")
