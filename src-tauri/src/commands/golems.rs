use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GolemTask {
    pub id: String,
    pub name: String,
    pub status: String,
    pub progress: f32,
    pub aura: String,
    pub mission: Option<String>,
    pub thought_trace: Option<String>,
    pub is_autonomous: bool,
    pub evolution_history: Vec<String>,
    pub evolution_count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GolemProposal {
    pub id: String,
    pub task_id: String,
    pub agent_name: String,
    pub file_path: String,
    pub title: String,
    pub original_content: String,
    pub proposed_content: String,
    pub rationale: String,
    pub status: String,
}

pub static GOLEM_REGISTRY: LazyLock<Mutex<HashMap<String, GolemTask>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

pub static PROPOSAL_REGISTRY: LazyLock<Mutex<HashMap<String, GolemProposal>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub async fn get_active_golems() -> Result<Vec<GolemTask>, String> {
    println!("get_active_golems CALLED");
    let mut tasks = {
        let registry = GOLEM_REGISTRY.lock().unwrap();
        registry.values().cloned().collect::<Vec<GolemTask>>()
    };
    // Default mock data if empty
    if tasks.is_empty() {
        tasks.push(GolemTask {
            id: "TASK-1".into(),
            name: "Kernel-Architect-Gemma3".into(),
            status: "Manifesting Solutions...".into(),
            progress: 0.6,
            aura: "emerald".into(),
            mission: Some("Refactor telemetry stream".into()),
            thought_trace: None,
            is_autonomous: true,
            evolution_history: vec![],
            evolution_count: 0,
        });
    }
    Ok(tasks)
}

pub fn get_active_golems_native() -> Result<Vec<GolemTask>, String> {
    let tasks = {
        let registry = GOLEM_REGISTRY.lock().unwrap();
        registry.values().cloned().collect::<Vec<GolemTask>>()
    };
    Ok(tasks)
}

#[tauri::command]
pub async fn get_golem_proposals() -> Result<Vec<GolemProposal>, String> {
    let mut props = {
        let registry = PROPOSAL_REGISTRY.lock().unwrap();
        registry.values().cloned().collect::<Vec<GolemProposal>>()
    };
    if props.is_empty() {
        props.push(GolemProposal {
            id: "PR-8483".into(),
            task_id: "TASK-1".into(),
            agent_name: "Kernel-Architect-Gemma3".into(),
            file_path: "src-tauri/src/commands/telemetry.rs".into(),
            title: "Optimize Telemetry Vector".into(),
            original_content: "pub fn get_hardware_telemetry...".into(),
            proposed_content: "pub fn get_hardware_telemetry(state: tauri::State<TelemetryState>) -> Result<HardwareTelemetry, String> {\n  // Optimized memory sync\n}".into(),
            rationale: "Detected inefficient lock holding time in get_hardware_telemetry.".into(),
            status: "pending".into(),
        });
    }
    Ok(props)
}

#[tauri::command]
pub async fn get_neural_workforce() -> Result<Vec<String>, String> {
    Ok(vec!["Kernel-Architect-Gemma3".into(), "Security-Golem".into()])
}

#[tauri::command]
pub async fn execute_golem_manifest(_id: String, title: String, code: String) -> Result<String, String> {
    let file_basename = title.replace(" ", "_").to_lowercase();
    let path = format!("../src/{}.ts", file_basename);
    std::fs::write(&path, &code).unwrap_or_default();
    std::process::Command::new("git").args(["add", &path]).output().ok();
    std::process::Command::new("git").args(["commit", "-m", &format!("feat(golem): auto-manifested {}", title)]).output().ok();
    std::process::Command::new("git").args(["push"]).output().ok();
    Ok("Merged successfully".into())
}

#[tauri::command]
pub async fn resolve_golem_proposal(proposal_id: String, action: String) -> Result<String, String> {
    let mut registry = PROPOSAL_REGISTRY.lock().unwrap();
    if let Some(prop) = registry.get_mut(&proposal_id) {
        prop.status = action;
    }
    Ok("Resolved".into())
}

#[tauri::command]
pub async fn hatch_autonomous_golem(new_agent: GolemTask) -> Result<(), String> {
    let mut registry = GOLEM_REGISTRY.lock().unwrap();
    registry.insert(new_agent.id.clone(), new_agent);
    Ok(())
}

#[tauri::command]
pub async fn decommission_golem(id: String) -> Result<(), String> {
    let mut registry = GOLEM_REGISTRY.lock().unwrap();
    registry.remove(&id);
    Ok(())
}

#[tauri::command]
pub async fn invoke_golem_debate(task: GolemTask) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    
    let prompt = format!(
        "You are an autonomous AI 'Golem' with the aura of {}. Your mission is: {}. Briefly detail your plan to accomplish this task and any sub-steps involved.", 
        task.aura, 
        task.mission.unwrap_or_else(|| "General exploration".to_string())
    );

    let chat_body = serde_json::json!({ 
        "model": "gemma4:latest", 
        "prompt": prompt, 
        "stream": false 
    });

    let res = client
        .post("http://localhost:11434/api/generate")
        .json(&chat_body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let response_text = json["response"].as_str().unwrap_or("No response generated.").to_string();

    Ok(serde_json::json!({
        "status": "Resolved",
        "logs": ["Initiating Neural Sync...", "Debate parameters initialized.", "Response generated."],
        "thought_trace": response_text,
    }))
}
