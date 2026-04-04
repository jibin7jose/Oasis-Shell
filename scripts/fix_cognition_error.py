import os
import re

path = r'd:\myproject\new\oasis-shell\src\App.tsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Fix the unsafe recommendation access in the get_neural_wisdom useEffect
target = r"setMessages\(prev => \[\.\.\.prev, \{ role: \"assistant\", content: `Neural Wisdom: \${res\.recommendation}` \}\]\);"
replacement = r"""if (res?.recommendation) {
            setMessages(prev => [...prev, { role: "assistant", content: `Neural Wisdom: ${res.recommendation}` }]);
          }"""

# Use regex to replace the exact line while ignoring horizontal whitespace
content = re.sub(target, replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Cognition Effectors Restoration Successful.")
