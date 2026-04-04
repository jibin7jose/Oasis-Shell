import os
import re

path = r'd:\myproject\new\oasis-shell\src-tauri\src\lib.rs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# pin_context
pattern = r'(conn\.execute\(\s+"INSERT INTO pinned_contexts[\s\S]+?\[name, state_blob, aura\.to_string\(\), timestamp\],\s+\)\.map_err\(\|e\| e\.to_string\(\)\)\?;)'
replacement = r"""\1

    // Neural Continuity: Record Pin
    let _ = conn.execute(
        "INSERT INTO neural_logs (event_type, message, timestamp) VALUES (?1, ?2, ?3)",
        rusqlite::params!["CONTEXT_PIN", format!("Workspace Context Pinned: {}", name), timestamp],
    );"""

content = re.sub(pattern, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Snapshot Logging Manifest Successful.")
