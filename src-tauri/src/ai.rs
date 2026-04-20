use crate::AppState;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};
use tauri::Emitter;
use chrono;

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum AgentPersona {
    Architect,   // Code/Logic
    Strategist,  // Business/Economic
    Sentinel,    // Security/Integrity
    Synthesizer, // Final Synthesis
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SingularityAgent {
    pub id: String,
    pub name: String,
    pub persona: AgentPersona,
    pub status: String,
    pub last_thought: String,
}

pub static AGENT_COLLECTIVE: LazyLock<Mutex<HashMap<String, SingularityAgent>>> =
    LazyLock::new(|| {
        let mut m = HashMap::new();
        m.insert("architect".into(), SingularityAgent {
            id: "architect".into(),
            name: "The Architect".into(),
            persona: AgentPersona::Architect,
            status: "Online".into(),
            last_thought: "Ready to manifest systemic logic.".into(),
        });
        m.insert("strategist".into(), SingularityAgent {
            id: "strategist".into(),
            name: "The Strategist".into(),
            persona: AgentPersona::Strategist,
            status: "Online".into(),
            last_thought: "Scanning global momentum patterns.".into(),
        });
        m.insert("sentinel".into(), SingularityAgent {
            id: "sentinel".into(),
            name: "The Sentinel".into(),
            persona: AgentPersona::Sentinel,
            status: "Online".into(),
            last_thought: "Shields active. Monitoring neural drift.".into(),
        });
        Mutex::new(m)
    });

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DebateState {
    pub task: String,
    pub persona_thoughts: HashMap<String, String>,
    pub final_verdict: Option<String>,
}

#[tauri::command]
pub async fn get_agent_collective() -> Result<Vec<SingularityAgent>, String> {
    let collective = AGENT_COLLECTIVE.lock().unwrap();
    Ok(collective.values().cloned().collect())
}

#[tauri::command]
pub async fn invoke_golem_debate(app: tauri::AppHandle, state: tauri::State<'_, AppState>, task: String) -> Result<DebateState, String> {
    let client = reqwest::Client::new();
    let mut thoughts = HashMap::new();
    
    // 1. The Architect Proposes
    let _ = app.emit("agent-thought", ("architect", "Drafting technical blueprint..."));
    let arch_instruction = format!("Task: {}. Persona: The Architect. Focus on technical manifestation and logic. Provide a proposal.", task);
    let arch_thought = request_gemma_thought(&client, &state, arch_instruction).await?;
    thoughts.insert("Architect".into(), arch_thought.clone());
    
    // 2. The Sentinel Audits
    let _ = app.emit("agent-thought", ("sentinel", "Verifying security vectors..."));
    let sent_instruction = format!("Task: {}. Architect's Proposal: {}. Persona: The Sentinel. Focus on risks, security breaches, and integrity. Audit the proposal.", task, arch_thought);
    let sent_thought = request_gemma_thought(&client, &state, sent_instruction).await?;
    thoughts.insert("Sentinel".into(), sent_thought.clone());
    
    // 3. The Strategist Refines
    let _ = app.emit("agent-thought", ("strategist", "Analyzing market divergence..."));
    let strat_instruction = format!("Task: {}. Architect: {}. Sentinel: {}. Persona: The Strategist. Focus on strategic value, momentum, and ROI. Refine the approach.", task, arch_thought, sent_thought);
    let strat_thought = request_gemma_thought(&client, &state, strat_instruction).await?;
    thoughts.insert("Strategist".into(), strat_thought.clone());
    
    // 4. Synthesis
    let _ = app.emit("agent-thought", ("synthesizer", "Manifesting Singularity..."));
    let sync_instruction = format!("Task: {}. Architect: {}. Sentinel: {}. Strategist: {}. Synthesize a final strategic manifest.", task, arch_thought, sent_thought, strat_thought);
    let final_verdict = request_gemma_thought(&client, &state, sync_instruction).await?;

    Ok(DebateState {
        task,
        persona_thoughts: thoughts,
        final_verdict: Some(final_verdict),
    })
}

async fn request_gemma_thought(client: &reqwest::Client, state: &tauri::State<'_, AppState>, instruction: String) -> Result<String, String> {
    let body = serde_json::json!({
        "model": "gemma3",
        "prompt": instruction,
        "stream": false
    });

    let res = client.post(format!("{}/api/generate", state.config.ollama_url))
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;
    Ok(json["response"].as_str().unwrap_or("Thinking failure.").to_string())
}
