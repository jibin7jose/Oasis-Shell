use crate::{AppState, CollectiveNode};
use std::collections::HashMap;
use std::sync::{LazyLock, Mutex};

pub static BIOMETRIC_SESSION: Mutex<Option<chrono::DateTime<chrono::Local>>> = Mutex::new(None);

pub fn biometric_session_is_valid_at(
    session: Option<chrono::DateTime<chrono::Local>>,
    now: chrono::DateTime<chrono::Local>,
) -> bool {
    if let Some(timestamp) = session {
        let diff = now.signed_duration_since(timestamp);
        return diff.num_minutes() < 5;
    }
    false
}

#[tauri::command]
pub async fn check_biometric_status() -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let cmd = "Add-Type -AssemblyName System.Runtime.WindowsRuntime; [Windows.Security.Credentials.UI.UserConsentVerifier, Windows.Security.Credentials, ContentType=WindowsRuntime]::CheckAvailabilityAsync().GetAwaiter().GetResult() -eq 'Available'";
        let output = std::process::Command::new("powershell")
            .args(["-Command", cmd])
            .output()
            .map_err(|e| e.to_string())?;

        Ok(String::from_utf8_lossy(&output.stdout).trim() == "True")
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(false)
    }
}

#[tauri::command]
pub async fn trigger_biometric_scan(reason: String) -> Result<bool, String> {
    #[cfg(target_os = "windows")]
    {
        let cmd = format!(
            "Add-Type -AssemblyName System.Runtime.WindowsRuntime; $res = [Windows.Security.Credentials.UI.UserConsentVerifier, Windows.Security.Credentials, ContentType=WindowsRuntime]::RequestVerificationAsync('{}').GetAwaiter().GetResult(); $res -eq 'Verified'",
            reason
        );

        let output = std::process::Command::new("powershell")
            .args(["-Command", &cmd])
            .output()
            .map_err(|e| e.to_string())?;

        let verified = String::from_utf8_lossy(&output.stdout).trim() == "True";
        if verified {
            let mut session = BIOMETRIC_SESSION.lock().unwrap();
            *session = Some(chrono::Local::now());
        }
        Ok(verified)
    }
    #[cfg(not(target_os = "windows"))]
    {
        Ok(true)
    }
}

#[tauri::command]
pub async fn is_biometric_session_valid() -> bool {
    let session = BIOMETRIC_SESSION.lock().unwrap();
    biometric_session_is_valid_at(*session, chrono::Local::now())
}

pub fn build_collective_node(ip: String, port: u16, hostname: String) -> CollectiveNode {
    CollectiveNode {
        id: format!("NODE_{}", hostname.to_uppercase()),
        ip,
        port,
        hostname,
        status: "Active".into(),
        last_pulse: chrono::Local::now().to_rfc3339(),
        aura: "amber".into(),
        latency_ms: 0,
    }
}

pub static COLLECTIVE_REGISTRY: LazyLock<Mutex<HashMap<String, CollectiveNode>>> =
    LazyLock::new(|| Mutex::new(HashMap::new()));

#[tauri::command]
pub async fn register_remote_node(
    _state: tauri::State<'_, AppState>,
    ip: String,
    port: u16,
    hostname: String,
) -> Result<String, String> {
    let mut registry = COLLECTIVE_REGISTRY.lock().unwrap();
    let node = build_collective_node(ip, port, hostname.clone());
    let node_id = node.id.clone();
    registry.insert(node_id.clone(), node);
    Ok(format!("Distributed Node {} Manifested.", node_id))
}

#[tauri::command]
pub async fn get_collective_nodes() -> Result<Vec<CollectiveNode>, String> {
    let registry = COLLECTIVE_REGISTRY.lock().unwrap();
    Ok(registry.values().cloned().collect())
}

#[tauri::command]
pub async fn broadcast_distributed_aura(message: String) -> Result<usize, String> {
    let registry = {
        let registry = COLLECTIVE_REGISTRY.lock().unwrap();
        registry.values().cloned().collect::<Vec<CollectiveNode>>()
    };
    let client = reqwest::Client::new();
    let mut success_count = 0;

    for node in registry.iter() {
        if node.status == "Active" {
            let url = format!("http://{}:{}/neural-broadcast", node.ip, node.port);
            let _ = client.post(url).body(message.clone()).send().await;
            success_count += 1;
        }
    }

    Ok(success_count)
}

#[cfg(test)]
mod tests {
    use super::{biometric_session_is_valid_at, build_collective_node};

    #[test]
    fn biometric_session_helper_respects_time_window() {
        let now = chrono::Local::now();
        assert!(biometric_session_is_valid_at(Some(now - chrono::Duration::minutes(4)), now));
        assert!(!biometric_session_is_valid_at(Some(now - chrono::Duration::minutes(6)), now));
    }

    #[test]
    fn collective_node_builder_prefixes_hostname() {
        let node = build_collective_node("127.0.0.1".into(), 4040, "alpha".into());
        assert_eq!(node.id, "NODE_ALPHA");
        assert_eq!(node.status, "Active");
        assert_eq!(node.aura, "amber");
    }
}
