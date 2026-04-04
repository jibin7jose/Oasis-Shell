import os
import re

path = r'd:\myproject\new\oasis-shell\src-tauri\src\lib.rs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Restore serde imports
if 'use serde::{Serialize, Deserialize};' not in content:
    content = 'use serde::{Serialize, Deserialize};\n' + content

# 2. Restore pub fn run
run_broken = r'\}\s+let conn = rusqlite::Connection::open\("oasis_crates\.db"\)'
run_restored = """}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let conn = rusqlite::Connection::open("oasis_crates.db")"""

content = re.sub(run_broken, run_restored, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Kernel Entry Restoration Successful.")
