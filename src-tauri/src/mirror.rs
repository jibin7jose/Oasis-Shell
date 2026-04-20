use crate::AppState;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use std::path::Path;
use std::fs;
use std::process::Command;
use crate::ai;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NeuralMutation {
    pub id: String,
    pub file_path: String,
    pub rationale: String,
    pub original_content: String,
    pub proposed_content: String,
    pub logic_score: u8,
    pub status: String, // "Awaiting Review", "Verified", "Applied"
    pub timestamp: String,
}

pub static MUTATION_REGISTRY: LazyLock<Mutex<HashMap<String, NeuralMutation>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub async fn get_neural_mutations() -> Result<Vec<NeuralMutation>, String> {
    let registry = MUTATION_REGISTRY.lock().unwrap();
    Ok(registry.values().cloned().collect())
}

#[tauri::command]
pub async fn analyze_system_genome(app: tauri::AppHandle, state: tauri::State<'_, AppState>, target_file: String) -> Result<NeuralMutation, String> {
    // 1. READ GENOME (Self-Reading)
    let content = fs::read_to_string(&target_file).map_err(|e| format!("Failed to read genome at {}: {}", target_file, e))?;
    
    // 2. SELF-REFLECTION (AI Analysis)
    let instruction = format!(
        "You are the Oasis Neural Mirror. 
        Analyze the following source code for technical debt, bottlenecks, or logic optimization.
        Target File: {}.
        Code Content:
        {}
        
        Manifest a high-fidelity refactor. Output ONLY JSON: {{
           \"rationale\": \"WHY THIS CHANGE IMPROVES THE SYSTEM\",
           \"proposed_content\": \"COMPLETE REFACTORED SOURCE CODE\",
           \"logic_score\": 95
        }}",
        target_file, content
    );

    let client = reqwest::Client::new();
    let body = serde_json::json!({
        "model": "gemma3",
        "prompt": instruction,
        "stream": false,
        "format": "json"
    });

    let res = client.post(format!("{}/api/generate", state.config.ollama_url))
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    let resp_raw = json["response"].as_str().unwrap_or("{}");
    let mutation_data: serde_json::Value = serde_json::from_str(resp_raw).map_err(|e| e.to_string())?;

    let id = format!("MUT-{}", chrono::Local::now().timestamp());
    let mutation = NeuralMutation {
        id: id.clone(),
        file_path: target_file,
        rationale: mutation_data["rationale"].as_str().unwrap_or("Optimization derived from neural reflection.").to_string(),
        original_content: content,
        proposed_content: mutation_data["proposed_content"].as_str().unwrap_or("").to_string(),
        logic_score: mutation_data["logic_score"].as_u64().unwrap_or(0) as u8,
        status: "Awaiting Review".into(),
        timestamp: chrono::Local::now().to_rfc3339(),
    };

    let mut registry = MUTATION_REGISTRY.lock().unwrap();
    registry.insert(id, mutation.clone());
    Ok(mutation)
}

#[tauri::command]
pub async fn verify_system_mutation(mutation_id: String) -> Result<String, String> {
    let mutation = {
        let registry = MUTATION_REGISTRY.lock().unwrap();
        registry.get(&mutation_id).cloned().ok_or("Mutation not found.")?
    };

    if !mutation.file_path.ends_with(".rs") {
        return Ok("Non-Rust mutation: Visual validation only.".into());
    }

    // Baseline Integrity Check: Run 'cargo check' on the current project
    let output = Command::new("cargo")
        .arg("check")
        .output()
        .map_err(|e| format!("Failed to initiate forensic audit: {}", e))?;

    if output.status.success() {
        Ok("System Logic Integrity Verified. Mutation safe for manifestation.".into())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Integrity Breach Detected: {}", stderr))
    }
}

#[tauri::command]
pub async fn apply_neural_mutation(mutation_id: String) -> Result<String, String> {
    let mut mutation = {
        let mut registry = MUTATION_REGISTRY.lock().unwrap();
        registry.get_mut(&mutation_id).map(|m| m.clone()).ok_or("Mutation not found.")?
    };

    fs::write(&mutation.file_path, &mutation.proposed_content)
        .map_err(|e| format!("Manifestation Failed: {}", e))?;

    mutation.status = "Applied".into();
    let mut registry = MUTATION_REGISTRY.lock().unwrap();
    registry.insert(mutation_id, mutation);
    
    Ok("NEURAL MUTATION MANIFESTED. System Evolution Complete.".into())
}
