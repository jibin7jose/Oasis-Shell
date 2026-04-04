import os
import re

path = r'd:\myproject\new\oasis-shell\src-tauri\src\lib.rs'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. register_golem_task
reg_pattern = r'async fn register_golem_task\(db: tauri::State<\'_, DbState>, task: GolemTask\) -> Result<\(\), String> \{[\s\S]+?\}'
reg_replacement = """async fn register_golem_task(db: tauri::State<'_, DbState>, task: GolemTask) -> Result<(), String> {
    let mut registry = GOLEM_REGISTRY.lock().unwrap();
    registry.insert(task.id.clone(), task.clone());

    // Neural Continuity: Record Manifestation
    let conn = db.0.lock().unwrap();
    let timestamp = chrono::Local::now().to_rfc3339();
    let _ = conn.execute(
        "INSERT INTO neural_logs (event_type, message, timestamp) VALUES (?1, ?2, ?3)",
        rusqlite::params!["GOLEM_MANIFEST", format!("Autonomous Agent manifested: {}", task.name), timestamp],
    );

    Ok(())
}"""

content = re.sub(reg_pattern, reg_replacement, content)

# 2. complete_golem_task
comp_pattern = r'async fn complete_golem_task\(id: String\) -> Result<\(\), String> \{[\s\S]+?\}'
comp_replacement = """async fn complete_golem_task(db: tauri::State<'_, DbState>, id: String) -> Result<(), String> {
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

content = re.sub(comp_pattern, comp_replacement, content)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Neural Memory Injection Successful.")
