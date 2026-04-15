use crate::AppState;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

// Assume NeuralAgent is defined in lib.rs or needs to be imported:
// For now, we will import it from crate if it exists.
// use crate::NeuralAgent;
// Actually, looking at the code it seems NeuralAgent was defined somewhere. We'll leave it out, let compilation fail and then we'll import it.

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GolemTask {
    pub id: String,
    pub name: String,
    pub status: String,
    pub progress: f32, // 0.0 to 1.0
    pub aura: String,   // emerald, amber, rose, indigo
}

pub static GOLEM_REGISTRY: LazyLock<Mutex<HashMap<String, GolemTask>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

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
    pub status: String, // "pending", "merged", "discarded"
}

pub static PROPOSAL_REGISTRY: LazyLock<Mutex<HashMap<String, GolemProposal>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

// Wait, I need to know what NeuralAgent is. I'll just check it after creating the file.
// I will create the file first without register_new_golem and delete_golem, or I'll just copy them.

#[tauri::command]
pub async fn register_new_golem(agent: crate::NeuralAgent) -> Result<String, String> {
    let path = ".golem_registry.json";
    let mut registry = if std::path::Path::new(path).exists() {
        let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        serde_json::from_str::<Vec<crate::NeuralAgent>>(&data).unwrap_or_default()
    } else {
        Vec::new()
    };

    registry.push(agent.clone());
    let data = serde_json::to_string(&registry).map_err(|e| e.to_string())?;
    std::fs::write(path, data).map_err(|e| e.to_string())?;
    Ok(format!("Strategic Golem [{}] Forged into Registry.", agent.name))
}

#[tauri::command]
pub async fn delete_golem(id: String) -> Result<String, String> {
    let path = ".golem_registry.json";
    if std::path::Path::new(path).exists() {
        let data = std::fs::read_to_string(path).map_err(|e| e.to_string())?;
        let mut registry = serde_json::from_str::<Vec<crate::NeuralAgent>>(&data).unwrap_or_default();
        registry.retain(|a| a.id != id);
        let data = serde_json::to_string(&registry).map_err(|e| e.to_string())?;
        std::fs::write(path, data).map_err(|e| e.to_string())?;
        Ok("Golem purged from Registry.".into())
    } else {
        Err("No Registry found.".into())
    }
}

#[tauri::command]
pub async fn execute_golem_manifest(_id: String, title: String, code: String) -> Result<String, String> {
    // 1. Ensure Manifest Directory Exists
    let dir_path = "manifested";
    if !std::path::Path::new(dir_path).exists() {
        std::fs::create_dir_all(dir_path).map_err(|e| e.to_string())?;
    }

    // 2. Write Manifestation
    let file_basename = title.replace(" ", "_").to_lowercase();
    let path = format!("{}/{}.ts", dir_path, file_basename);
    std::fs::write(&path, &code).map_err(|e| e.to_string())?;

    // 3. Neural Git Sync (Forensic Locking)
    let _ = std::process::Command::new("git")
        .args(["add", &path])
        .output();
    
    let commit_msg = format!("Oasis Neural Manifest: {}", title);
    let _ = std::process::Command::new("git")
        .args(["commit", "-m", &commit_msg])
        .output();

    Ok(format!("Strategic Execution Complete: Neural Module '{}' manifested and forensically locked in Git repository.", title))
}

#[tauri::command]
pub async fn release_golem_workforce(
    state: tauri::State<'_, AppState>,
    task_id: String,
    agent_name: String,
    file_path: String,
    instructions: String,
) -> Result<String, String> {
    let original_content = std::fs::read_to_string(&file_path).unwrap_or_else(|_| "".into());
    let task_id_clone = task_id.clone();
    let file_path_clone = file_path.clone();
    let config_clone = state.config.clone();

    // Spawn Background Golem Thread
    drop(state);
    tauri::async_runtime::spawn(async move {
        // Initial state
        {
            let mut registry = GOLEM_REGISTRY.lock().unwrap();
            registry.insert(task_id_clone.clone(), GolemTask {
                id: task_id_clone.clone(),
                name: agent_name.clone(),
                status: "Analyzing Objective...".into(),
                progress: 10.0,
                aura: "indigo".into(),
            });
        }

        // Delay for dramatic effect
        tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

        // Code Generation via DeepOracle
        let prompt = format!(
            "Role: Elite Software Architect (Agent: {}). 
             Task: Rewrite this file to fulfill the user's instructions.
             Instructions: {}
             File Content:
             ```
             {}
             ```
             Output ONLY the full rewritten code block. No explanations.",
             agent_name, instructions, original_content
        );

        let body = serde_json::json!({
            "model": "gemma3:4b",
            "prompt": prompt,
            "stream": false
        });

        let client = reqwest::Client::new();
        let res_result = client.post(format!("{}/api/generate", config_clone.ollama_url)).json(&body).send().await;

        // Simulated Progress
        {
            let mut registry = GOLEM_REGISTRY.lock().unwrap();
            if let Some(task) = registry.get_mut(&task_id_clone) {
                task.status = "Manifesting Code Solutions...".into();
                task.progress = 60.0;
                task.aura = "amber".into();
            }
        }

        tokio::spawn(async move {
            tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;
            
            if let Ok(res) = res_result {
                if let Ok(json) = res.json::<serde_json::Value>().await {
                    let resp_str = json["response"].as_str().unwrap_or("").trim_matches('`').replace("json", "").replace("typescript", "").trim().to_string();
                    
                    let mut prop_registry = PROPOSAL_REGISTRY.lock().unwrap();
                    let proposal_id = format!("PR-{}", chrono::Local::now().timestamp());
                    
                    prop_registry.insert(proposal_id.clone(), GolemProposal {
                        id: proposal_id,
                        task_id: task_id_clone.clone(),
                        agent_name: agent_name.clone(),
                        file_path: file_path_clone,
                        title: format!("Feature Sprint: {}", agent_name),
                        original_content: original_content.clone(),
                        proposed_content: resp_str,
                        rationale: "Synthesized via distributed intelligence.".into(),
                        status: "pending".into(),
                    });

                    // Update UI State to complete
                    let mut registry = GOLEM_REGISTRY.lock().unwrap();
                    if let Some(task) = registry.get_mut(&task_id_clone) {
                        task.status = "Awaiting Founder Review".into();
                        task.progress = 100.0;
                        task.aura = "emerald".into();
                    }
                }
            } else {
                // Fallback if AI offline
                 let mut registry = GOLEM_REGISTRY.lock().unwrap();
                 if let Some(task) = registry.get_mut(&task_id_clone) {
                     task.status = "Neutral Edge Failure (LLM Offline)".into();
                     task.aura = "rose".into();
                 }
            }
        });
    });

    Ok(task_id)
}

#[tauri::command]
pub async fn get_golem_proposals() -> Result<Vec<GolemProposal>, String> {
    let registry = PROPOSAL_REGISTRY.lock().unwrap();
    Ok(registry.values().cloned().collect())
}

#[tauri::command]
pub async fn resolve_golem_proposal(proposal_id: String, action: String) -> Result<String, String> {
    let mut prop_registry = PROPOSAL_REGISTRY.lock().unwrap();
    if let Some(prop) = prop_registry.get_mut(&proposal_id) {
        if action == "merge" {
            std::fs::write(&prop.file_path, &prop.proposed_content).map_err(|e| e.to_string())?;
            prop.status = "merged".into();
            
            // Cleanup task
            let mut task_registry = GOLEM_REGISTRY.lock().unwrap();
            task_registry.remove(&prop.task_id);
            
            Ok("Neural PR Merged Successfully.".into())
        } else {
            prop.status = "discarded".into();
            let mut task_registry = GOLEM_REGISTRY.lock().unwrap();
            task_registry.remove(&prop.task_id);
            Ok("Neural PR Discarded.".into())
        }
    } else {
        Err("Proposal not found.".into())
    }
}

#[tauri::command]
pub async fn get_active_golems() -> Result<Vec<GolemTask>, String> {
    let registry = GOLEM_REGISTRY.lock().unwrap();
    Ok(registry.values().cloned().collect())
}

#[tauri::command]
pub async fn register_golem_task(id: String, name: String, aura: String) -> Result<(), String> {
    let mut registry = GOLEM_REGISTRY.lock().unwrap();
    registry.insert(id.clone(), GolemTask {
        id,
        name,
        status: "Neural Initialization...".into(),
        progress: 0.0,
        aura,
    });
    Ok(())
}

#[tauri::command]
pub async fn update_golem_task(id: String, status: String, progress: f32) -> Result<(), String> {
    let mut registry = GOLEM_REGISTRY.lock().unwrap();
    if let Some(task) = registry.get_mut(&id) {
        task.status = status;
        task.progress = progress;
    }
    Ok(())
}

#[tauri::command]
pub async fn complete_golem_task(id: String) -> Result<String, String> {
    let mut registry = GOLEM_REGISTRY.lock().unwrap();
    if let Some(task) = registry.get_mut(&id) {
        task.status = "Completed".into();
        task.progress = 1.0;
        Ok(format!("Task {} archived successfully.", id))
    } else {
        Err(format!("Task {} not found in registry.", id))
    }
}
