use crate::AppState;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use std::fs;
use std::process::Command;

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
pub async fn analyze_system_genome(_app: tauri::AppHandle, state: tauri::State<'_, AppState>, target_file: String) -> Result<NeuralMutation, String> {
    // 1. READ GENOME (Self-Reading)
    let content = fs::read_to_string(&target_file).map_err(|e| format!("Failed to read genome at {}: {}", target_file, e))?;
    
    // 2. SELF-REFLECTION (AI Analysis)
    let instruction = format!(
        "Role: Oasis Neural Mirror. 
        Task: Perform a high-fidelity refactor of the provided source code.
        Focus: Technical debt, performance bottlenecks, and architectural cleanliness.
        Target File: {}.
        
        CODE TO ANALYZE:
        ```
        {}
        ```
        
        INSTRUCTIONS:
        1. Maintain all existing functionality and core logic.
        2. Improve naming, structure, and efficiency.
        3. Output ONLY a valid JSON object with the following keys:
           - \"rationale\": \"Brief explanation of the improvements (1-2 sentences).\"
           - \"proposed_content\": \"The full, complete, and compilable source code for the file.\"
           - \"logic_score\": (Integer 0-100 representing the refactor quality).
        
        DO NOT include any markdown or text outside the JSON block.",
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
        .map_err(|e| format!("Neural Engine Unreachable: {}", e))?;

    let json: serde_json::Value = res.json().await.map_err(|e| format!("Failed to parse engine response: {}", e))?;
    let resp_raw = json["response"].as_str().ok_or("Empty response from Neural Engine")?;
    
    // Hardened JSON parsing for LLM outputs
    let mutation_data: serde_json::Value = serde_json::from_str(resp_raw).map_err(|e| {
        format!("Refactor Manifest Corrupted: {}. Raw: {}", e, resp_raw)
    })?;

    let id = format!("MUT-{}", chrono::Local::now().format("%Y%m%d-%H%M%S"));
    let mutation = NeuralMutation {
        id: id.clone(),
        file_path: target_file,
        rationale: mutation_data["rationale"].as_str().unwrap_or("Optimization derived from neural reflection.").to_string(),
        original_content: content,
        proposed_content: mutation_data["proposed_content"].as_str().ok_or("Proposed content missing from manifest")?.to_string(),
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
    let (mut mutation, original_content) = {
        let registry = MUTATION_REGISTRY.lock().unwrap();
        let m = registry.get(&mutation_id).cloned().ok_or("Mutation not found.")?;
        let original = fs::read_to_string(&m.file_path).map_err(|e| e.to_string())?;
        (m, original)
    };

    if !mutation.file_path.ends_with(".rs") {
        return Ok("Non-Rust mutation: Logical verification only (build audit skipped).".into());
    }

    // 1. TEMPORARY MANIFESTATION (Dry Run)
    fs::write(&mutation.file_path, &mutation.proposed_content)
        .map_err(|e| format!("Dry run manifestation failed: {}", e))?;

    // 2. FORENSIC BUILD AUDIT
    let output = Command::new("cargo")
        .arg("check")
        .output()
        .map_err(|e| format!("Failed to initiate forensic audit: {}", e))?;

    // 3. RESTORE ORIGINAL (Rollback)
    fs::write(&mutation.file_path, &original_content)
        .map_err(|e| format!("Rollback failed! SYSTEM INTEGRITY AT RISK: {}", e))?;

    if output.status.success() {
        // Update status in registry
        mutation.status = "Verified".into();
        let mut registry = MUTATION_REGISTRY.lock().unwrap();
        registry.insert(mutation_id, mutation);
        
        Ok("System Logic Integrity Verified. Mutation safe for manifestation.".into())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Integrity Breach (Build Error): {}", stderr))
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
