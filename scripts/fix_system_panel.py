import os
import re

path = r'd:\myproject\new\oasis-shell\src\components\panels\SystemPanel.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the injected garbage in Line 78
broken_pattern = r'if \(!ts \|\| ts <= 0\) return "Never";`n`nconst normalizePriority = \(value: string\) => \{`n  const v = value\.toLowerCase\(\);`n  if \(v\.includes\("low"\)\) return "low";`n  if \(v\.includes\("high"\)\) return "high";`n  return "normal";`n\};'
fixed_logic = """if (!ts || ts <= 0) return "Never";
  return new Date(ts).toLocaleTimeString();
};

const normalizePriority = (value: string) => {
  const v = value.toLowerCase();
  if (v.includes("low")) return "low";
  if (v.includes("high")) return "high";
  return "normal";
};"""

content = re.sub(broken_pattern, fixed_logic, content)

# Also fix any extra closing brace or typo from the above
content = content.replace('      return new Date(ts).toLocaleTimeString();\n};', '      return new Date(ts).toLocaleTimeString();\n    };')

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("SystemPanel Structural Restoration Successful.")
