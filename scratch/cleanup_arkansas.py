import os

def cleanup_files(root_dir):
    pattern = " Arkansas Arkansas"
    for root, dirs, files in os.walk(root_dir):
        if "node_modules" in root or ".git" in root or "target" in root:
            continue
        for file in files:
            if file.endswith(('.rs', '.tsx', '.ts', '.css', '.md')):
                path = os.path.join(root, file)
                try:
                    with open(path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    if pattern in content:
                        print(f"Cleaning {path}")
                        new_content = content.replace(pattern, "")
                        with open(path, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                except Exception as e:
                    print(f"Error reading {path}: {e}")

if __name__ == "__main__":
    cleanup_files(".")
