import os
import re

path = r'd:\myproject\new\oasis-shell\src-tauri\src\lib.rs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Restore complete_golem_task
broken_pattern = r'#\[tauri::command\]\s+Ok\(\)\s+\}'
restored_golem = """#[tauri::command]
async fn complete_golem_task(db: tauri::State<'_, DbState>, id: String) -> Result<(), String> {
    let mut registry = GOLEM_REGISTRY.lock().unwrap();
    if let Some(task) = registry.remove(&id) {
        // Neural Continuity: Record Completion
        let conn = db.0.lock().unwrap();
        let timestamp = chrono::Local::now().to_rfc3339();
        let _ = conn.execute(
            "INSERT INTO neural_logs (event_type, message, timestamp) VALUES (?1, ?2, ?3)",
            rusqlite::params!["GOLEM_RETIRAL", format!("Autonomous Agent retired: {}", task.name), timestamp],
        );
    }
    Ok(())
}"""

content = re.sub(broken_pattern, restored_golem, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Golem Lifecycle Restoration Successful.")
