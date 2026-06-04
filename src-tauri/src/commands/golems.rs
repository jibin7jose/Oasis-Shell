use crate::models::DbState;
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
    let registry = GOLEM_REGISTRY.lock().unwrap();
    let mut tasks: Vec<GolemTask> = registry.values().cloned().collect();
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

#[tauri::command]
pub async fn get_golem_proposals() -> Result<Vec<GolemProposal>, String> {
    let registry = PROPOSAL_REGISTRY.lock().unwrap();
    let mut props: Vec<GolemProposal> = registry.values().cloned().collect();
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
pub async fn execute_golem_manifest(id: String, title: String, code: String) -> Result<String, String> {
    // Write out the proposed code to a new location or mock the merge
    let file_basename = title.replace(" ", "_").to_lowercase();
    std::fs::write(&format!("{}.ts", file_basename), &code).unwrap_or_default();
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
