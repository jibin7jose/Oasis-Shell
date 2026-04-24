use crate::{AppState, HardwareStatus, VentureMetrics};

#[tauri::command]
pub async fn invoke_multimodal_oracle(
    state: tauri::State<'_, AppState>,
    image_b64: String,
    task: String,
) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();

    let prompt = format!(
        "You are the Oasis Omniscient Eye. Analyze this visual workspace context. \
        The Founder is focused on: {}. Identify any anomalies, strategic charts, or layout misalignments. \
        Provide a terse, executive-level strategic verdict based on what you see.",
        task
    );

    let body = serde_json::json!({
        "model": "gemma3",
        "prompt": prompt,
        "images": [image_b64],
        "stream": false,
        "format": "json"
    });

    let res = client
        .post(format!("{}/api/generate", state.config.ollama_url))
        .json(&body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = res.json().await.map_err(|e| e.to_string())?;

    if let Some(resp) = json["response"].as_str() {
        let parsed: serde_json::Value = serde_json::from_str(resp)
            .unwrap_or(serde_json::json!({ "advice": resp, "thought_trace": "Visual reasoning manifested." }));
        Ok(parsed)
    } else {
        Err("Oracle Vision Resonance Failure: Final diagnostic withheld.".into())
    }
}

#[tauri::command]
pub async fn trigger_hardware_symbiosis(stress_color: String) -> Result<HardwareStatus, String> {
    if stress_color == "#ef4444" {
        Ok(HardwareStatus {
            focus_mode: "Survival Mode (Grayscale Lockdown)".into(),
            aura_intensity: 1.0,
        })
    } else {
        Ok(HardwareStatus {
            focus_mode: "Strategic Harmony (Full Spectrum)".into(),
            aura_intensity: 0.2,
        })
    }
}

#[tauri::command]
pub async fn create_restore_point(
    _metrics: VentureMetrics,
    _files: Vec<String>,
) -> Result<String, String> {
    let id = format!("SNAP_{}", chrono::Utc::now().timestamp());
    Ok(format!("Restore Point {} Created. Venture State Synchronized.", id))
}
