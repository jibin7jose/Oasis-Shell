import subprocess
import os

repo_path = r'd:\myproject\new\oasis-shell'
os.chdir(repo_path)

commit_msg = "feat: Phase 6.8 - OS Parallel Layouts & Priority Authority V2.0 (Win32 Snapshots, TTL Rules, Data Exports, Virtualization)"

try:
    subprocess.run(["git", "add", "."], check=True)
    subprocess.run(["git", "commit", "-m", commit_msg], check=True)
    subprocess.run(["git", "push"], check=True)
    print("GitHub Sync Successfully Manifested.")
except Exception as e:
    print(f"Sync Fail: {e}")
