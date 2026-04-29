use crate::AppState;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use chrono;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StrategicMacro {
    pub id: String,
    pub name: String,
    pub description: String,
    pub script: String,        // PowerShell or system directive
    pub trigger_pattern: String, // Semantic context pattern
    pub signed: bool,          // Founder approval flag
    pub aura: String,          // emerald, amber, rose, indigo
    pub status: String,        // "idle", "active", "cooldown"
    pub node_manifest: Option<String>, // Serialized JSON of ForgeNode[]
}

static MACRO_REGISTRY: LazyLock<Mutex<HashMap<String, StrategicMacro>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub async fn forge_macro_intent(state: tauri::State<'_, AppState>, prompt: String, visual_context: String) -> Result<StrategicMacro, String> {
    let client = reqwest::Client::new();
    let instruction = format!(
        "Role: Oasis Strategic Forge. 
          Input: Visual Context [{}], User Intent [{}].
          Goal: Forge a strategic automation macro with a visual node manifest. 
          Output ONLY JSON: {{ 
            \"name\": \"MACRO NAME\", 
            \"description\": \"STRATEGIC SUMMARY\", 
            \"nodes\": [ {{ \"id\": \"node-1\", \"type\": \"trigger|action|logic\", \"label\": \"LABEL\", \"data\": {{ \"command\": \"PS SCRIPT\" }}, \"position\": {{ \"x\": 100, \"y\": 100 }} }} ],
            \"edges\": [ {{ \"id\": \"e1\", \"source\": \"node-1\", \"target\": \"node-2\" }} ],
            \"aura\": \"emerald|amber|rose|indigo\" 
          }}",
        visual_context, prompt
    );

    let body = serde_json::json!({ "model": "gemma3:4b", "prompt": instruction, "stream": false });
    let res = client.post(format!("{}/api/generate", state.config.ollama_url)).json(&body).send().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    
    let resp_str = json["response"].as_str().unwrap_or("{}").trim_matches('`').replace("json", "").trim().to_string();
    let macro_data: serde_json::Value = serde_json::from_str(&resp_str).map_err(|e| e.to_string())?;
    
    let id = format!("FORGE-{}", chrono::Local::now().timestamp());
    let st_macro = StrategicMacro {
        id: id.clone(),
        name: macro_data["name"].as_str().unwrap_or("Unnamed Golem").into(),
        description: macro_data["description"].as_str().unwrap_or("Neural automation forged from intent.").into(),
        script: macro_data["script"].as_str().unwrap_or("echo 'Forge empty.'").into(),
        trigger_pattern: macro_data["trigger"].as_str().unwrap_or("manual").into(),
        signed: false,
        aura: macro_data["aura"].as_str().unwrap_or("indigo").into(),
        status: "idle".into(),
        node_manifest: Some(serde_json::to_string(&serde_json::json!({
            "nodes": macro_data["nodes"],
            "edges": macro_data["edges"]
        })).unwrap_or_default()),
    };

    let mut registry = MACRO_REGISTRY.lock().unwrap();
    registry.insert(id, st_macro.clone());
    Ok(st_macro)
}

#[tauri::command]
pub async fn execute_macro_golem(id: String) -> Result<String, String> {
    let st_macro = {
        let registry = MACRO_REGISTRY.lock().unwrap();
        registry.get(&id).cloned().ok_or_else(|| "Macro not found in forge registry.")?
    };

    if !st_macro.signed {
        return Err("Macro security breach: Founder Signature required for initial Forge execution.".into());
    }

    // Execute via PowerShell
    use std::process::Command;
    let output = Command::new("powershell")
        .args(["-Command", &st_macro.script])
        .output()
        .map_err(|e| e.to_string())?;

    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr = String::from_utf8_lossy(&output.stderr).to_string();

    Ok(format!("Macro {} Executed.\nOutput: {}\nErrors: {}", st_macro.name, stdout, stderr))
}

#[tauri::command]
pub async fn sign_macro_golem(id: String) -> Result<(), String> {
    let mut registry = MACRO_REGISTRY.lock().unwrap();
    if let Some(m) = registry.get_mut(&id) {
        m.signed = true;
        Ok(())
    } else {
        Err("Macro not found.".into())
    }
}

#[tauri::command]
pub async fn get_macro_inventory() -> Result<Vec<StrategicMacro>, String> {
    let registry = MACRO_REGISTRY.lock().unwrap();
    Ok(registry.values().cloned().collect())
}

#[tauri::command]
pub async fn execute_visual_macro(id: String) -> Result<String, String> {
    let st_macro = {
        let registry = MACRO_REGISTRY.lock().unwrap();
        registry.get(&id).cloned().ok_or_else(|| "Macro not found.")?
    };

    if let Some(manifest_str) = st_macro.node_manifest {
        let manifest: serde_json::Value = serde_json::from_str(&manifest_str).map_err(|e| e.to_string())?;
        let nodes = manifest["nodes"].as_array().ok_or("Invalid node manifest")?;
        
        // Simple sequential execution for MVP (Topological sort would be better)
        let mut results = Vec::new();
        for node in nodes {
            if node["type"] == "action" {
                if let Some(cmd) = node["data"]["command"].as_str() {
                    let output = std::process::Command::new("powershell")
                        .args(["-Command", cmd])
                        .output()
                        .map_err(|e| e.to_string())?;
                    results.push(String::from_utf8_lossy(&output.stdout).trim().to_string());
                }
            }
        }
        Ok(format!("Visual Macro Executed: {}", results.join(" -> ")))
    } else {
        Err("No visual manifest found for this macro.".into())
    }
}

pub fn run() {
    // Module commands are registered from crate root.
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AutomationTask {
    pub id: String,
    pub name: String,
    pub schedule: String,
    pub status: String,
    pub last_run: Option<i64>,
}

#[tauri::command]
pub async fn get_automation_tasks(state: tauri::State<'_, AppState>) -> Result<Vec<AutomationTask>, String> {
    let db = state.pool.get().map_err(|e| e.to_string())?;
    let mut stmt = db.prepare("SELECT id, name, schedule, status, last_run FROM automation_tasks").map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([], |row| {
        let last_run: Option<i64> = row.get(4).unwrap_or(None);
        Ok(AutomationTask {
            id: row.get(0)?,
            name: row.get(1)?,
            schedule: row.get(2)?,
            status: row.get(3)?,
            last_run,
        })
    }).map_err(|e| e.to_string())?;

    let mut tasks = Vec::new();
    for r in rows {
        if let Ok(task) = r {
            tasks.push(task);
        }
    }
    
    Ok(tasks)
}

#[tauri::command]
pub async fn execute_automation_task(state: tauri::State<'_, AppState>, id: String) -> Result<String, String> {
    let db = state.pool.get().map_err(|e| e.to_string())?;
    
    let now = chrono::Utc::now().timestamp_millis();
    db.execute("UPDATE automation_tasks SET status = 'success', last_run = ?1 WHERE id = ?2", rusqlite::params![now, id])
        .map_err(|e| e.to_string())?;
    
    // Add to audit logs
    let log_id = format!("log_{}", now);
    db.execute(
        "INSERT INTO audit_logs (id, timestamp, action, category, details) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![log_id, now, "EXEC_AUTOMATION", "system", format!("Executed task {}", id)]
    ).map_err(|e| e.to_string())?;

    Ok("Task Executed".into())
}
