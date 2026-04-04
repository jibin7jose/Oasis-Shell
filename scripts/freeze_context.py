import os

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. State Injection
old_state = '  const [golems, setGolems] = useState<any[]>([]);'
new_state = '  const [golems, setGolems] = useState<any[]>([]);\n  const [pinnedContexts, setPinnedContexts] = useState<any[]>([]);'
content = content.replace(old_state, new_state)

# 2. Sync Logic Injection
old_sync = '        const active = await invoke("get_active_golems") as any[];\n        setGolems(active);'
new_sync = '        const active = await invoke("get_active_golems") as any[];\n        setGolems(active);\n        const pins = await invoke("get_pinned_contexts") as any[];\n        setPinnedContexts(pins);'
content = content.replace(old_sync, new_sync)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Synchronization Successful.")
