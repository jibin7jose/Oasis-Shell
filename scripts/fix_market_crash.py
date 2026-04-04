import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix for get_market_intelligence ticker array in TAURI_DEFAULTS
expanded_defaults = r"""get_market_intelligence: [
    { symbol: "OASIS_INDEX", price: "$1,442.20", change: "+2.4%" },
    { symbol: "RUST_FOUNDRY", price: "0.14s", change: "-0.2%" },
    { symbol: "GOLEM_NODES", price: "1.4k", change: "+12.8%" },
    { symbol: "SENTINEL_YIELD", price: "99.2%", change: "+0.1%" }
  ],"""

target_pattern = r"get_market_intelligence: \{ market_index: 100 \},"

content = re.sub(target_pattern, expanded_defaults, content)

# Also fix the marketIntel map call with an array guard
content = content.replace('{marketIntel.map((m: any, i: number) => (', '{(Array.isArray(marketIntel) ? marketIntel : []).map((m: any, i: number) => (')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Market Intelligence Hub Restored.")
