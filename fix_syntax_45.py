
import os

path = r"d:\myproject\new\oasis-shell\src\App.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Pattern to find (End of the Sentinel Grid)
target = 'Vault Empty / Awaiting Seal</span>\n                  </div>\n               </div>\n           </motion.div>'
replacement = 'Vault Empty / Awaiting Seal</span>\n                  </div>\n               </div>\n            )}\n           </motion.div>'

if target in content:
    new_content = content.replace(target, replacement)
    with open(path, "w", encoding="utf-8") as f:
        f.write(new_content)
    print("RECOVERY_COMPLETE")
else:
    # Try with CRLF line endings
    target_crlf = target.replace('\n', '\r\n')
    replacement_crlf = replacement.replace('\n', '\r\n')
    if target_crlf in content:
        new_content = content.replace(target_crlf, replacement_crlf)
        with open(path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print("RECOVERY_COMPLETE_CRLF")
    else:
        print("MANIFEST_NOT_FOUND")
