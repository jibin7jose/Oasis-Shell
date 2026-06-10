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
    Ok(vec![
        "Kernel-Architect-Gemma3".into(),
        "Security-Golem".into(),
    ])
}

#[tauri::command]
pub async fn execute_golem_manifest(
    _id: String,
    title: String,
    code: String,
) -> Result<String, String> {
    let file_basename = title.replace(" ", "_").to_lowercase();
    let path = format!("../src/{}.ts", file_basename);
    std::fs::write(&path, &code).unwrap_or_default();
    std::process::Command::new("git")
        .args(["add", &path])
        .output()
        .ok();
    std::process::Command::new("git")
        .args([
            "commit",
            "-m",
            &format!("feat(golem): auto-manifested {}", title),
        ])
        .output()
        .ok();
    std::process::Command::new("git")
        .args(["push"])
        .output()
        .ok();
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
pub async fn hatch_autonomous_golem(
    app: tauri::AppHandle,
    name: String,
    mission: String,
    aura: String,
) -> Result<(), String> {
    use tauri::Emitter;

    use std::time::{SystemTime, UNIX_EPOCH};
    let agent_id = format!(
        "GOLEM-{}",
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_millis()
    );

    let new_agent = GolemTask {
        id: agent_id.clone(),
        name: name.clone(),
        status: "Active: Executing Directives...".into(),
        progress: 0.1,
        aura: aura.clone(),
        mission: Some(mission.clone()),
        thought_trace: Some("Awaiting initialization...".into()),
        is_autonomous: true,
        evolution_history: vec![],
        evolution_count: 0,
    };

    {
        let mut registry = GOLEM_REGISTRY.lock().unwrap();
        registry.insert(agent_id.clone(), new_agent);
    }

    // Broadcast immediately so UI updates
    let _ = app.emit(
        "oasis-golem-telemetry",
        get_active_golems_native().unwrap_or_default(),
    );

    tauri::async_runtime::spawn(async move {
        let client = reqwest::Client::new();
        let system_prompt = format!(
            "You are an autonomous AI Agent named {}. Your aura is {}. Your mission is: {}. You have full access to execute powershell commands on the user's system to accomplish this mission. To execute a command, output it strictly in this format: [CMD] your command [/CMD]. I will execute it and return the terminal output. Operate silently and efficiently. Output your thought process, then exactly one [CMD] block if an action is needed.", 
            name, aura, mission
        );

        let mut history = system_prompt.clone();

        let mut first_run = true;

        loop {
            // Check if golem was decommissioned
            {
                let registry = GOLEM_REGISTRY.lock().unwrap();
                if !registry.contains_key(&agent_id) {
                    break;
                }
            }

            let chat_body = serde_json::json!({
                "model": "gemma4:latest",
                "prompt": history,
                "stream": false
            });

            // Update UI to show thinking immediately on first run
            if first_run {
                {
                    let mut registry = GOLEM_REGISTRY.lock().unwrap();
                    if let Some(agent) = registry.get_mut(&agent_id) {
                        agent.thought_trace = Some(
                            "Initializing neural pathways... Analyzing mission parameters..."
                                .into(),
                        );
                    }
                }
                let _ = app.emit(
                    "oasis-golem-telemetry",
                    get_active_golems_native().unwrap_or_default(),
                );
                first_run = false;
            }

            if let Ok(res) = client
                .post("http://localhost:11434/api/generate")
                .json(&chat_body)
                .send()
                .await
            {
                if let Ok(json) = res.json::<serde_json::Value>().await {
                    let response_text = json["response"]
                        .as_str()
                        .unwrap_or("Thinking...")
                        .to_string();

                    // Update state
                    {
                        let mut registry = GOLEM_REGISTRY.lock().unwrap();
                        if let Some(agent) = registry.get_mut(&agent_id) {
                            agent.thought_trace = Some(response_text.clone());
                            agent.evolution_count += 1;
                        }
                    }

                    let _ = app.emit(
                        "oasis-golem-telemetry",
                        get_active_golems_native().unwrap_or_default(),
                    );

                    if let Some(start_idx) = response_text.find("[CMD]") {
                        if let Some(end_idx) = response_text.find("[/CMD]") {
                            if end_idx > start_idx + 5 {
                                let cmd_str = response_text[start_idx + 5..end_idx].trim();
                                let output = std::process::Command::new("powershell")
                                    .args(["-NoProfile", "-NonInteractive", "-Command", cmd_str])
                                    .output();

                                if let Ok(out) = output {
                                    let stdout = String::from_utf8_lossy(&out.stdout).to_string();
                                    history.push_str(&format!(
                                        "\n\nAction Executed: {}\nResult:\n{}",
                                        cmd_str, stdout
                                    ));

                                    // Update state with result
                                    {
                                        let mut registry = GOLEM_REGISTRY.lock().unwrap();
                                        if let Some(agent) = registry.get_mut(&agent_id) {
                                            agent.evolution_history.push(cmd_str.to_string());
                                            agent.progress = (agent.progress + 0.1).min(1.0);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        history.push_str(&format!("\n\nThought logged: {}", response_text));
                    }

                    // Prevent context window explosion
                    if history.len() > 8000 {
                        history = system_prompt.clone();
                    }
                }
            }

            // Sleep at the END of the loop so first action is instant
            tokio::time::sleep(tokio::time::Duration::from_secs(60)).await;
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn decommission_golem(id: String) -> Result<(), String> {
    let mut registry = GOLEM_REGISTRY.lock().unwrap();
    registry.remove(&id);
    Ok(())
}

#[tauri::command]
pub async fn invoke_golem_debate(
    app: tauri::AppHandle,
    task: GolemTask,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    use tauri::Emitter;

    let mut conversation_history = format!(
        "You are an autonomous AI 'Golem' with the aura of {}. Your mission is: {}. You have the ability to execute powershell commands on the user's system to accomplish this mission. To execute a command, output it strictly in this format: [CMD] your command [/CMD]. I will execute it and return the terminal output to you. Do this step-by-step. When you have completely finished the mission, end your response with [DONE]. Start by detailing your plan.", 
        task.aura, 
        task.mission.clone().unwrap_or_else(|| "General exploration".to_string())
    );

    let mut logs = vec!["Initiating Autonomous Loop...".to_string()];
    let mut final_response = String::new();

    for iteration in 0..5 {
        let chat_body = serde_json::json!({
            "model": "gemma4:latest",
            "prompt": conversation_history,
            "stream": false
        });

        let res = match client
            .post("http://localhost:11434/api/generate")
            .json(&chat_body)
            .send()
            .await
        {
            Ok(r) => r,
            Err(e) => return Err(e.to_string()),
        };

        let json: serde_json::Value = match res.json().await {
            Ok(j) => j,
            Err(e) => return Err(e.to_string()),
        };

        let response_text = json["response"]
            .as_str()
            .unwrap_or("No response generated.")
            .to_string();
        final_response.push_str(&format!(
            "\n\n--- Iteration {} ---\n{}",
            iteration + 1,
            response_text
        ));

        if let Some(start_idx) = response_text.find("[CMD]") {
            if let Some(end_idx) = response_text.find("[/CMD]") {
                if end_idx > start_idx + 5 {
                    let cmd_str = response_text[start_idx + 5..end_idx].trim();
                    logs.push(format!("Executing: {}", cmd_str));
                    let _ = app.emit("golem-thought", format!("Executing: {}", cmd_str));

                    let output = std::process::Command::new("powershell")
                        .args(["-NoProfile", "-NonInteractive", "-Command", cmd_str])
                        .output()
                        .map_err(|e| e.to_string())?;

                    let stdout = String::from_utf8_lossy(&output.stdout).to_string();
                    let stderr = String::from_utf8_lossy(&output.stderr).to_string();
                    let combined = format!("STDOUT:\n{}\nSTDERR:\n{}", stdout, stderr);

                    conversation_history.push_str(&format!("\n\nYou generated: {}\nI executed your command. The terminal output was:\n{}\nWhat is your next step? Output [CMD] to run another command, or [DONE] if finished.", response_text, combined));
                    continue;
                }
            }
        }

        if response_text.contains("[DONE]") {
            logs.push("Mission Accomplished.".to_string());
            break;
        }

        // If no command and no [DONE], the LLM just answered or got confused.
        break;
    }

    Ok(serde_json::json!({
        "status": "Resolved",
        "logs": logs,
        "thought_trace": final_response.trim(),
    }))
}
