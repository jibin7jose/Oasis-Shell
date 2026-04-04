import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Unified TAURI_DEFAULTS for Market Intelligence
unified_market_intel = r"""get_market_intelligence: {
    market_index: 100.0,
    index_change: "+2.4%",
    ticker: [
      { symbol: "OASIS_INDEX", price: "$1,442.20", change: "+2.4%" },
      { symbol: "RUST_FOUNDRY", price: "0.14s", change: "-0.2%" },
      { symbol: "GOLEM_NODES", price: "1.4k", change: "+12.8%" },
      { symbol: "SENTINEL_YIELD", price: "99.2%", change: "+0.1%" }
    ]
  },"""

# Target the array-based one I just added
target_defaults = r"get_market_intelligence: \[\s+[\s\S]+?s*  \],"
content = re.sub(target_defaults, unified_market_intel, content)

# Update the hydration logic to distribute individual properties correctly
old_sync = r"const intel = await invokeSafe\(\"get_market_intelligence\"\\) as any;\s+setMarketIntel\(intel\);"
new_sync = r"""const intel = await invokeSafe("get_market_intelligence") as any;
        setMarketIntel(intel.ticker || []);
        setDisplayedMarket({ market_index: intel.market_index, index_change: intel.index_change });"""

content = re.sub(old_sync, new_sync, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Market Intelligence Unification Successful.")
