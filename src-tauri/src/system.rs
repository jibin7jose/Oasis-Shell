use crate::AppState;
use serde::{Deserialize, Serialize};
use sysinfo::{Disks, System, Components, Networks};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GetWindowTextW, IsWindowVisible, GetWindowThreadProcessId,
    GetWindowRect, SetWindowPos, ShowWindow, SWP_NOZORDER, SWP_SHOWWINDOW, SW_RESTORE
};
use windows::Win32::Foundation::{RECT, HWND, LPARAM, BOOL};
use crate::seal_strategic_asset;

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemStats {
    pub oas_id: String,
    pub path_status: String,
    pub binary_sync: bool,
    pub cpu_load: f32,
    pub mem_used: f32,
    pub battery_level: u32,
    pub is_charging: bool,
    pub battery_health: i32,
    pub time_remaining_min: i32,
    pub vault_locked: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BatteryHealthInfo {
    pub health_percent: i32,
    pub design_capacity: i32,
    pub full_charge_capacity: i32,
    pub cycle_count: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu_usage: f32,
    pub mem_usage: u64,
    pub status: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StorageInfo {
    pub name: String,
    pub mount: String,
    pub total: u64,
    pub available: u64,
    pub health_score: f32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DeviceInfo {
    pub id: String,
    pub category: String,
    pub status: String,
    pub metadata: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct WindowInfo {
    pub title: String,
    pub pid: u32,
    pub exe_path: String,
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
    pub is_maximized: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WindowSnapshot {
    pub title: String,
    pub x: i32,
    pub y: i32,
    pub width: i32,
    pub height: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VentureActiveState {
    pub name: String,
    pub pid: Option<u32>,
    pub port: Option<u16>,
    pub status: String,
    pub forge_mode: String,
    pub timestamp: String,
}

pub static VENTURE_REGISTRY: std::sync::LazyLock<std::sync::Mutex<std::collections::HashMap<String, VentureActiveState>>> =
    std::sync::LazyLock::new(|| std::sync::Mutex::new(std::collections::HashMap::new()));

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KnowledgeCrate {
    pub name: String,
    pub telemetry: SystemStats,
    pub active_processes: Vec<String>,
    pub oracle: Option<OraclePulse>,
    pub metadata: String,
    pub timestamp: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OraclePulse {
    pub btc_usd: f32,
    pub eth_usd: f32,
    pub sentiment: String,
    pub tech_momentum: f32,
    pub timestamp: String,
}

static ORACLE_CACHE: std::sync::Mutex<Option<OraclePulse>> = std::sync::Mutex::new(None);
static LAST_ORACLE_UPDATE: std::sync::Mutex<Option<chrono::DateTime<chrono::Local>>> = std::sync::Mutex::new(None);
 Arkansas Arkansas
 Arkansas Arkansas
 Arkansas Arkansas
 Arkansas Arkansas
 Arkansas Arkansas
 Arkansas Arkansas
 Arkansas Arkansas

#[tauri::command]
pub fn get_running_windows() -> Vec<WindowInfo> {
    let mut windows: Vec<WindowInfo> = Vec::new();

    unsafe {
        let _ = EnumWindows(Some(enum_window_callback), LPARAM(&mut windows as *mut Vec<WindowInfo> as isize));
    }

    windows
}

unsafe extern "system" fn enum_window_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
    let windows = &mut *(lparam.0 as *mut Vec<WindowInfo>);

    if IsWindowVisible(hwnd).as_bool() {
        let mut buffer = [0u16; 512];
        let length = GetWindowTextW(hwnd, &mut buffer);
        let title = String::from_utf16_lossy(&buffer[..length as usize]);

        if !title.is_empty() && title != "Program Manager" && title != "Settings" {
            let mut pid = 0u32;
            GetWindowThreadProcessId(hwnd, Some(&mut pid));
            
            use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
            use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
            
            let mut exe_path = String::new();
            if let Ok(handle) = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid) {
                let mut path_buffer = [0u16; 1024];
                let path_len = GetModuleFileNameExW(handle, None, &mut path_buffer);
                if path_len > 0 {
                    exe_path = String::from_utf16_lossy(&path_buffer[..path_len as usize]);
                }
                let _ = windows::Win32::Foundation::CloseHandle(handle);
            }

            let mut rect = RECT::default();
            if GetWindowRect(hwnd, &mut rect).is_ok() {
                windows.push(WindowInfo {
                    title,
                    pid,
                    exe_path,
                    x: rect.left,
                    y: rect.top,
                    width: rect.right - rect.left,
                    height: rect.bottom - rect.top,
                    is_maximized: false, // Calculate if needed via GetWindowPlacement
                });
            }
        }
    }
    BOOL::from(true)
}

#[tauri::command]
pub fn launch_context_apps(apps: Vec<WindowInfo>) -> Result<Vec<String>, String> {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    let running_exes: Vec<String> = sys.processes().values()
        .filter_map(|p| p.exe().map(|e| e.to_string_lossy().to_string()))
        .collect();

    let mut launched = Vec::new();
    for app in apps {
        if !app.exe_path.is_empty() {
             if !running_exes.iter().any(|e| e.contains(&app.exe_path) || app.exe_path.contains(e)) {
                 if std::process::Command::new(&app.exe_path).spawn().is_ok() {
                    launched.push(app.title.clone());
                 }
             }
        }
    }
    Ok(launched)
}

#[tauri::command]
pub async fn run_system_diagnostic() -> Result<SystemStats, String> {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    
    let cpu_load = sys.global_cpu_usage();
    let mem_used = (sys.used_memory() as f32 / sys.total_memory() as f32) * 100.0;

    // Default battery telemetry
    let mut battery_level = 100u32;
    let mut is_charging = false;
    let mut battery_health = -1;
    let mut time_remaining_min = -1;

    #[cfg(target_os = "windows")]
    {
        // Try to get battery status via PowerShell
        let cmd = "Get-CimInstance -ClassName Win32_Battery | Select-Object -Property EstimatedChargeRemaining, BatteryStatus, ExpectedLife | ConvertTo-Json";
        if let Ok(output) = std::process::Command::new("powershell").args(["-Command", cmd]).output() {
            if output.status.success() {
                if let Ok(json) = serde_json::from_slice::<serde_json::Value>(&output.stdout) {
                    battery_level = json["EstimatedChargeRemaining"].as_u64().unwrap_or(100) as u32;
                    is_charging = json["BatteryStatus"].as_u64().unwrap_or(1) != 2;
                    time_remaining_min = json["ExpectedLife"].as_i64().unwrap_or(-1) as i32;
                }
            }
        }
        
        if let Ok(health_info) = get_battery_health_wmi().await {
            battery_health = health_info.health_percent;
        }
    }

    Ok(SystemStats {
        oas_id: "OAS_KRNL_4.5-SENTINEL".into(),
        path_status: "Neural Link Established".into(),
        binary_sync: true,
        cpu_load,
        mem_used,
        battery_level,
        is_charging,
        battery_health,
        time_remaining_min,
        vault_locked: !crate::is_vault_session_valid(),
    })
}

#[tauri::command]
pub async fn get_process_list() -> Result<Vec<ProcessInfo>, String> {
    let mut sys = sysinfo::System::new_all();
    sys.refresh_all();
    
    let mut procs: Vec<ProcessInfo> = sys.processes().values().map(|p| {
        ProcessInfo {
            pid: p.pid().as_u32(),
            name: p.name().to_string_lossy().into(),
            cpu_usage: p.cpu_usage(),
            mem_usage: p.memory(),
            status: format!("{:?}", p.status()),
        }
    }).collect();

    procs.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());
    Ok(procs.into_iter().take(15).collect())
}

#[tauri::command]
pub async fn get_storage_map() -> Result<Vec<StorageInfo>, String> {
    let disks = Disks::new_with_refreshed_list();

    let disks: Vec<StorageInfo> = disks.list().iter().map(|d| {
        let total = d.total_space();
        let available = d.available_space();
        let health = (available as f32 / total as f32) * 100.0;
        
        StorageInfo {
            name: d.name().to_string_lossy().into(),
            mount: d.mount_point().to_string_lossy().into(),
            total,
            available,
            health_score: health,
        }
    }).collect();
    
    Ok(disks)
}

#[tauri::command]
pub async fn get_system_devices() -> Result<Vec<DeviceInfo>, String> {
    let components = Components::new_with_refreshed_list();
    let networks = Networks::new_with_refreshed_list();
    
    let mut devices = Vec::new();
    
    // Physical Components
    for c in components.iter() {
        devices.push(DeviceInfo {
            id: format!("HW-{}", c.label()),
            category: "Physical".into(),
            status: "Online".into(),
            metadata: format!("Temp: {:.1}°C", c.temperature().unwrap_or(0.0)),
        });
    }

    // Network Interfaces
    for (name, data) in networks.iter() {
        let rx_kb = data.received() / 1024;
        let tx_kb = data.transmitted() / 1024;
        if rx_kb > 0 || tx_kb > 0 {
            devices.push(DeviceInfo {
                id: format!("NET-{}", name),
                category: "Network".into(),
                status: "Active".into(),
                metadata: format!("RX: {} KB | TX: {} KB", rx_kb, tx_kb),
            });
        }
    }

    Ok(devices)
}

#[tauri::command]
pub async fn kill_quarantine_process(pid: u32, seal: bool) -> Result<String, String> {
    if seal {
        let mut sys = sysinfo::System::new_all();
        sys.refresh_all();
        if let Some(process) = sys.process(sysinfo::Pid::from_u32(pid)) {
            if let Some(exe_path) = process.exe() {
                let path_str = exe_path.to_string_lossy().to_string();
                let title = format!("Aegis Quarantine: {}", process.name().to_string_lossy());
                let _ = seal_strategic_asset(path_str, title).await;
            }
        }
    }

    #[cfg(target_os = "windows")]
    {
        let output = std::process::Command::new("taskkill")
            .args(["/F", "/PID", &pid.to_string()])
            .output()
            .map_err(|e| e.to_string())?;
            
        if output.status.success() {
            Ok(format!("Aegis Neutralization: PID {} purged from Host OS.", pid))
        } else {
            Err(format!("Aegis Failure: {}", String::from_utf8_lossy(&output.stderr)))
        }
    }
    #[cfg(not(target_os = "windows"))]
    { Ok("Aegis synchronization only available on Windows for now.".into()) }
}

#[tauri::command]
pub async fn get_process_priority(pid: u32) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let cmd = format!("(Get-Process -Id {}).PriorityClass", pid);
        let output = std::process::Command::new("powershell")
            .args(["-Command", &cmd])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
        } else {
            Err(format!("Priority readback failure: {}", String::from_utf8_lossy(&output.stderr)))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("UNKNOWN".into())
    }
}

#[tauri::command]
pub async fn get_battery_health_wmi() -> Result<BatteryHealthInfo, String> {
    #[cfg(target_os = "windows")]
    {
        let cmd = "$b=Get-CimInstance -ClassName Win32_Battery | Select-Object -First 1; if ($null -eq $b) { @{health_percent=-1;design_capacity=-1;full_charge_capacity=-1;cycle_count=-1} | ConvertTo-Json -Compress } else { $design=$b.DesignCapacity; $full=$b.FullChargeCapacity; $cycles=$b.CycleCount; $health=if ($design -gt 0) { [math]::Round($full/$design*100) } else { -1 }; @{health_percent=$health;design_capacity=$design;full_charge_capacity=$full;cycle_count=$cycles} | ConvertTo-Json -Compress }";
        let output = std::process::Command::new("powershell")
            .args(["-Command", cmd])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            let json = String::from_utf8_lossy(&output.stdout);
            let info: BatteryHealthInfo = serde_json::from_str(json.trim()).map_err(|e| e.to_string())?;
            Ok(info)
        } else {
            Err(format!("WMI battery query failure: {}", String::from_utf8_lossy(&output.stderr)))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok(BatteryHealthInfo { health_percent: -1, design_capacity: -1, full_charge_capacity: -1, cycle_count: -1 })
    }
}

#[tauri::command]
pub async fn suspend_process(pid: u32) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let output = std::process::Command::new("powershell")
            .args(["-Command", &format!("Suspend-Process -Id {}", pid)])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(format!("Process PID {} suspended.", pid))
        } else {
            Err(format!("Suspend failure: {}", String::from_utf8_lossy(&output.stderr)))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Suspend only available on Windows for now.".into())
    }
}

#[tauri::command]
pub async fn resume_process(pid: u32) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let output = std::process::Command::new("powershell")
            .args(["-Command", &format!("Resume-Process -Id {}", pid)])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(format!("Process PID {} resumed.", pid))
        } else {
            Err(format!("Resume failure: {}", String::from_utf8_lossy(&output.stderr)))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Resume only available on Windows for now.".into())
    }
}

#[tauri::command]
pub async fn set_process_priority(pid: u32, priority: String) -> Result<String, String> {
    #[cfg(target_os = "windows")]
    {
        let class = match priority.to_lowercase().as_str() {
            "idle" | "low" => "Idle",
            "below_normal" | "below" => "BelowNormal",
            "above_normal" | "above" => "AboveNormal",
            "high" => "High",
            "realtime" => "RealTime",
            _ => "Normal",
        };

        let cmd = format!("$p = Get-Process -Id {}; $p.PriorityClass = '{}'", pid, class);
        let output = std::process::Command::new("powershell")
            .args(["-Command", &cmd])
            .output()
            .map_err(|e| e.to_string())?;

        if output.status.success() {
            Ok(format!("Process PID {} priority set to {}.", pid, class))
        } else {
            Err(format!("Priority change failure: {}", String::from_utf8_lossy(&output.stderr)))
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        Ok("Priority changes only available on Windows for now.".into())
    }
}

#[tauri::command]
pub async fn get_active_windows() -> Result<Vec<WindowSnapshot>, String> {
    let mut windows: Vec<WindowSnapshot> = Vec::new();
    
    extern "system" fn enum_window_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let windows_ptr = lparam.0 as *mut Vec<WindowSnapshot>;
        let windows = unsafe { &mut *windows_ptr };
        
        unsafe {
            if IsWindowVisible(hwnd).as_bool() {
                let mut text = [0u16; 512];
                let len = GetWindowTextW(hwnd, &mut text);
                if len > 0 {
                    let title = String::from_utf16_lossy(&text[..len as usize]);
                    let mut rect = RECT::default();
                    if GetWindowRect(hwnd, &mut rect).is_ok() {
                        windows.push(WindowSnapshot {
                            title,
                            x: rect.left,
                            y: rect.top,
                            width: rect.right - rect.left,
                            height: rect.bottom - rect.top,
                        });
                    }
                }
            }
        }
        BOOL::from(true)
    }

    unsafe {
        let lparam = LPARAM(&mut windows as *mut Vec<WindowSnapshot> as isize);
        let _ = EnumWindows(Some(enum_window_callback), lparam);
    }

    Ok(windows)
}

#[tauri::command]
pub async fn set_window_layout(layout: Vec<WindowSnapshot>) -> Result<(), String> {
    extern "system" fn set_layout_callback(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let layout_ptr = lparam.0 as *const Vec<WindowSnapshot>;
        let layout = unsafe { &*layout_ptr };
        
        unsafe {
            let mut text = [0u16; 512];
            let len = GetWindowTextW(hwnd, &mut text);
            if len > 0 {
                let title = String::from_utf16_lossy(&text[..len as usize]);
                if let Some(target) = layout.iter().find(|w| w.title == title) {
                   let _ = ShowWindow(hwnd, SW_RESTORE);
                   let _ = SetWindowPos(hwnd, HWND::default(), target.x, target.y, target.width, target.height, SWP_NOZORDER | SWP_SHOWWINDOW);
                }
            }
        }
        BOOL::from(true)
    }

    unsafe {
        let lparam = LPARAM(&layout as *const Vec<WindowSnapshot> as isize);
        let _ = EnumWindows(Some(set_layout_callback), lparam);
    }

    Ok(())
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileInfo {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub last_modified: u64,
}

#[tauri::command]
pub async fn read_directory(path: Option<String>) -> Result<Vec<FileInfo>, String> {
    let target_path = match path {
        Some(p) if !p.trim().is_empty() => p,
        _ => {
            // Default to home directory
            if let Ok(home) = std::env::var("USERPROFILE").or_else(|_| std::env::var("HOME")) {
                home
            } else {
                "C:\\".to_string()
            }
        }
    };

    let mut files = Vec::new();

    let entries = std::fs::read_dir(&target_path).map_err(|e| format!("Failed to read directory {}: {}", target_path, e))?;

    for entry in entries {
        if let Ok(entry) = entry {
            let metadata = entry.metadata().ok();
            
            let is_dir = metadata.as_ref().map(|rn| rn.is_dir()).unwrap_or(false);
            let size = metadata.as_ref().map(|m| m.len()).unwrap_or(0);
            
            let last_modified = metadata
                .as_ref()
                .and_then(|m| m.modified().ok())
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs())
                .unwrap_or(0);

            files.push(FileInfo {
                name: entry.file_name().to_string_lossy().into_owned(),
                path: entry.path().to_string_lossy().into_owned(),
                is_dir,
                size,
                last_modified,
            });
        }
    }

    // Sort: directories first, then files alphabetically
    files.sort_by(|a, b| {
        if a.is_dir && !b.is_dir {
            std::cmp::Ordering::Less
        } else if !a.is_dir && b.is_dir {
            std::cmp::Ordering::Greater
        } else {
            a.name.to_lowercase().cmp(&b.name.to_lowercase())
        }
    });

    Ok(files)
}

#[tauri::command]
pub async fn launch_path(path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("cmd")
            .args(["/C", "start", "", &path])
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(target_os = "windows"))]
    {
        // For macOS/Linux if we ever target them
        #[cfg(target_os = "macos")]
        std::process::Command::new("open").arg(&path).spawn().map_err(|e| e.to_string())?;
        #[cfg(target_os = "linux")]
        std::process::Command::new("xdg-open").arg(&path).spawn().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn delete_path(path: String) -> Result<String, String> {
    // Security Gate
    if !crate::is_vault_session_valid() {
        return Err("Sentinel Vault Locked. Founder Signature Required for deletion.".into());
    }

    let target = std::path::Path::new(&path);
    if !target.exists() {
        return Err("Target path does not exist.".into());
    }

    if target.is_dir() {
        std::fs::remove_dir_all(target).map_err(|e| e.to_string())?;
    } else {
        std::fs::remove_file(target).map_err(|e| e.to_string())?;
    }

    Ok(format!("Strategic asset purged: {}", path))
}

#[tauri::command]
pub async fn rename_path(path: String, new_name: String) -> Result<String, String> {
    // Security Gate
    if !crate::is_vault_session_valid() {
        return Err("Sentinel Vault Locked. Founder Signature Required for renaming.".into());
    }

    let old_path = std::path::Path::new(&path);
    if !old_path.exists() {
        return Err("Source path does not exist.".into());
    }

    let mut new_path = old_path.parent().unwrap_or(std::path::Path::new("")).to_path_buf();
    new_path.push(new_name);

    std::fs::rename(old_path, &new_path).map_err(|e| e.to_string())?;

    Ok(format!("Asset Re-designated: {} to {}", path, new_path.display()))
}/// Phase 35: Omni-Vent Forge — Polyglot Scaffolding Engine
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum VentureForgeMode {
    ReactVite,
    RustTauri,
}

#[tauri::command]
pub async fn manifest_new_venture(
    state: tauri::State<'_, AppState>,
    name: String,
    intent: String,
    forge_mode: Option<VentureForgeMode>,
) -> Result<String, String> {
    let mode = forge_mode.unwrap_or(VentureForgeMode::ReactVite);
    match mode {
        VentureForgeMode::ReactVite  => scaffold_react_vite_venture(state, name, intent).await,
        VentureForgeMode::RustTauri  => scaffold_tauri_venture(state, name, intent).await,
    }
}

/// React / Vite sub-venture (existing path, now a named helper)
async fn scaffold_react_vite_venture(
    _state: tauri::State<'_, AppState>,
    name: String,
    intent: String,
) -> Result<String, String> {
    let venture_dir = format!("ventures/{}", name);
    let path = std::path::PathBuf::from(&venture_dir);
    if path.exists() {
        return Err("Strategic Protocol Breach: Venture identity already exists.".into());
    }
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;

    let output = std::process::Command::new("npx")
        .args(["-y", "create-vite@latest", ".", "--template", "react-ts"])
        .current_dir(&path)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(format!("Scaffolding Failure: {}", String::from_utf8_lossy(&output.stderr)));
    }

    let app_tsx = format!(
        "import React, {{ useEffect, useState }} from 'react';\n\
        export default function App() {{ \n\
          const [context, setContext] = useState<any>(null);\n\
          useEffect(() => {{ \n\
            fetch('/src/assets/knowledge.json').then(res => res.json()).then(setContext).catch(console.error);\n\
          }}, []);\n\
          return (\n\
            <div className='oasis-subsidiary'>\n\
              <h1>Oasis Subsidiary: {}</h1>\n\
              <div className='context-badge'>{{context ? `SYNCED: ${{context.timestamp.split('T')[1].split('.')[0]}}` : 'CONNECTING...'}}</div>\n\
              <p>Manifested via Neural Singularity.</p>\n\
              <div className='intent-core'>Intent: {}</div>\n\
              {{context && (\n\
                <div className='telemetry-stream'>\n\
                  CPU: {{context.telemetry.cpu_load.toFixed(1)}}% | MEM: {{context.telemetry.mem_used.toFixed(1)}}%\n\
                </div>\n\
              )}}\n\
            </div>\n\
          );\n\
        }}",
        name, intent
    );

    let index_css = "body { background: #020617; color: #6366f1; font-family: 'Inter', sans-serif; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }\n\
                     .oasis-subsidiary { border: 1px solid rgba(99, 102, 241, 0.2); padding: 4rem; border-radius: 3rem; background: rgba(0,0,0,0.4); backdrop-filter: blur(20px); text-align: center; border-left: 4px solid #10b981; }\n\
                     h1 { text-transform: uppercase; letter-spacing: 0.5em; font-weight: 900; margin-bottom: 2rem; color: white; }\n\
                     .context-badge { font-size: 10px; font-weight: 900; color: #10b981; letter-spacing: 0.2em; margin-bottom: 2rem; opacity: 0.6; }\n\
                     .intent-core { opacity: 0.5; font-size: 0.8rem; font-style: italic; margin-bottom: 2rem; }\n\
                     .telemetry-stream { font-family: monospace; font-size: 10px; background: rgba(0,0,0,0.4); padding: 1rem; border-radius: 1rem; border: 1px solid rgba(255,255,255,0.05); }";

    let assets_dir = path.join("src/assets");
    std::fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;
    std::fs::write(path.join("src/App.tsx"), app_tsx).map_err(|e| e.to_string())?;
    std::fs::write(path.join("src/index.css"), index_css).map_err(|e| e.to_string())?;
    let _ = manifest_knowledge_crate(name.clone()).await;

    // Register in Venture Registry
    {
        let mut registry = VENTURE_REGISTRY.lock().unwrap();
        registry.insert(name.clone(), VentureActiveState {
            name: name.clone(),
            pid: None,
            port: Some(5173),
            status: "Scaffolded (React/Vite)".into(),
            forge_mode: "react-vite".into(),
            timestamp: chrono::Local::now().to_rfc3339(),
        });
    }

    Ok(format!("Strategic Venture [{}] Manifested (React/Vite) in /ventures/.", name))
}

/// Rust / Tauri sub-venture scaffold (Phase 35: Omni-Vent Forge)
async fn scaffold_tauri_venture(
    _state: tauri::State<'_, AppState>,
    name: String,
    intent: String,
) -> Result<String, String> {
    let venture_dir = format!("ventures/{}", name);
    let path = std::path::PathBuf::from(&venture_dir);
    if path.exists() {
        return Err("Strategic Protocol Breach: Venture identity already exists.".into());
    }
    std::fs::create_dir_all(&path).map_err(|e| e.to_string())?;

    // 1. Inner web frontend (Vite HTML)
    let src_dir = path.join("src");
    let src_tauri_dir = path.join("src-tauri/src");
    let assets_dir = path.join("src/assets");
    std::fs::create_dir_all(&src_dir).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&src_tauri_dir).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(&assets_dir).map_err(|e| e.to_string())?;
    std::fs::create_dir_all(path.join("src-tauri")).map_err(|e| e.to_string())?;

    // 2. index.html
    let index_html = format!(r#"<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Oasis Subsidiary: {name}</title>
    <style>
      * {{ box-sizing: border-box; margin: 0; padding: 0; }}
      body {{ background: #010409; color: #e2e8f0; font-family: Inter, sans-serif;
             height: 100vh; display: flex; align-items: center; justify-content: center;
             overflow: hidden; }}
      .shell {{ border: 1px solid rgba(139,92,246,0.2); padding: 5rem; border-radius: 3rem;
               backdrop-filter: blur(40px); background: rgba(0,0,0,0.5);
               border-left: 4px solid #8b5cf6; text-align: center; max-width: 700px; width: 90%; }}
      h1 {{ text-transform: uppercase; letter-spacing: 0.4em; font-weight: 900;
            font-size: 1.4rem; margin-bottom: 1rem; color: #fff; }}
      .badge {{ font-size: 9px; font-weight: 900; color: #8b5cf6; letter-spacing: 0.3em;
               text-transform: uppercase; margin-bottom: 2rem; opacity: 0.7; }}
      .intent {{ opacity: 0.4; font-size: 0.85rem; font-style: italic; margin-bottom: 3rem; }}
      .telemetry {{ font-family: monospace; font-size: 11px; background: rgba(0,0,0,0.5);
                   padding: 1.5rem 2rem; border-radius: 1.5rem; border: 1px solid rgba(255,255,255,0.04);
                   text-align: left; line-height: 2; color: #94a3b8; }}
      .telemetry span {{ color: #8b5cf6; font-weight: 900; }}
      .oracle-row {{ margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.05); color: #f59e0b; }}
    </style>
  </head>
  <body>
    <div class="shell" id="app">
      <div class="badge">⬡ Oasis Subsidiary // Tauri Kernel // Phase 35</div>
      <h1>{name}</h1>
      <div class="intent">{intent}</div>
      <div class="telemetry" id="telem">Loading Knowledge Crate...</div>
    </div>
    <script>
      async function loadCrate() {{
        try {{
          const r = await fetch('./assets/knowledge.json');
          const c = await r.json();
          const t = c.telemetry;
          const o = c.oracle;
          let html = `
            CPU: <span>${{t.cpu_load.toFixed(1)}}%</span> &nbsp;|&nbsp;
            RAM: <span>${{t.mem_used.toFixed(1)}}%</span><br/>
            Synced: <span>${{c.timestamp.split('T')[0]}}</span> &nbsp;|&nbsp;
            Processes: <span>${{c.active_processes.slice(0,3).join(', ')}}</span>`;
          if (o) {{
            html += `<div class="oracle-row">
              🔮 Oracle // BTC: <span>$${{o.btc_usd.toLocaleString()}}</span> &nbsp;|&nbsp;
              ETH: <span>$${{o.eth_usd.toLocaleString()}}</span> &nbsp;|&nbsp;
              Sentiment: <span>${{o.sentiment}}</span></div>`;
          }}
          document.getElementById('telem').innerHTML = html;
        }} catch(e) {{
          document.getElementById('telem').textContent = 'Knowledge Bridge offline.';
        }}
      }}
      loadCrate();
      setInterval(loadCrate, 30000);
    </script>
  </body>
</html>"#, name = name, intent = intent);

    // 3. Cargo.toml for sub-venture
    let cargo_toml = format!(r#"[package]
name = "{name}"
version = "0.1.0"
edition = "2021"

[lib]
name = "{lib_name}_lib"
crate-type = ["staticlib", "cdylib", "rlib"]

[build-dependencies]
tauri-build = {{ version = "2", features = [] }}

[dependencies]
tauri = {{ version = "2", features = [] }}
serde = {{ version = "1", features = ["derive"] }}
serde_json = "1"
"#, name = name, lib_name = name.replace('-', "_"));

    // 4. Main Rust kernel (lib.rs)
    let lib_rs = format!(r#"// Oasis Sub-Venture: {name}
// Gestated via Phase 35: Omni-Vent Forge
// Intent: {intent}
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {{
    tauri::Builder::default()
        .setup(|app| {{
            #[cfg(debug_assertions)]
            app.get_webview_window("main").unwrap().open_devtools();
            Ok(())
        }})
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}}
"#, name = name, intent = intent);

    let main_rs = "// Oasis Sub-Venture — Entry Point\n#![cfg_attr(not(debug_assertions), windows_subsystem = \"windows\")]\nfn main() { app_lib::run(); }\n"
        .replace("app_lib", &format!("{}_lib", name.replace('-', "_")));

    // 5. tauri.conf.json
    let tauri_conf = format!(r#"{{
  "productName": "{name}",
  "version": "0.1.0",
  "identifier": "com.oasis.{safe_name}",
  "build": {{
    "frontendDist": "../src",
    "devUrl": "../src/index.html"
  }},
  "app": {{
    "windows": [{{
      "title": "Oasis :: {name}",
      "width": 1100,
      "height": 700,
      "resizable": true,
      "fullscreen": false
    }}]
  }},
  "bundle": {{
    "active": true,
    "targets": "all",
    "icon": []
  }}
}}"#, name = name, safe_name = name.to_lowercase().replace('-', ""));

    // Write all files
    std::fs::write(path.join("src/index.html"), index_html).map_err(|e| e.to_string())?;
    std::fs::write(path.join("src-tauri/Cargo.toml"), cargo_toml).map_err(|e| e.to_string())?;
    std::fs::write(path.join("src-tauri/src/lib.rs"), lib_rs).map_err(|e| e.to_string())?;
    std::fs::write(path.join("src-tauri/src/main.rs"), main_rs).map_err(|e| e.to_string())?;
    std::fs::write(path.join("src-tauri/tauri.conf.json"), tauri_conf).map_err(|e| e.to_string())?;

    // 6. Inject Knowledge Crate
    let _ = manifest_knowledge_crate(name.clone()).await;

    // 7. Register in Venture Registry
    {
        let mut registry = VENTURE_REGISTRY.lock().unwrap();
        registry.insert(name.clone(), VentureActiveState {
            name: name.clone(),
            pid: None,
            port: Some(1420),
            status: "Scaffolded (Rust/Tauri)".into(),
            forge_mode: "rust-tauri".into(),
            timestamp: chrono::Local::now().to_rfc3339(),
        });
    }

    Ok(format!("Strategic Venture [{}] Manifested (Rust/Tauri Desktop) in /ventures/.", name))
}



#[tauri::command]
pub async fn manifest_knowledge_crate(name: String) -> Result<String, String> {
    let venture_dir = format!("ventures/{}", name);
    let path = std::path::PathBuf::from(&venture_dir);
    if !path.exists() {
        return Err("Venture trajectory not found.".into());
    }

    // 1. Capture Telemetry
    let stats = run_system_diagnostic().await?;
    
    // 2. Capture Active Context (Recent Processes)
    let processes = get_process_list().await?;
    let active_names = processes.iter().take(5).map(|p| p.name.clone()).collect();

    let oracle = get_oracle_pulse().await.ok();

    let crate_data = KnowledgeCrate {
        name: name.clone(),
        telemetry: stats,
        active_processes: active_names,
        oracle,
        metadata: "Oasis Subsidiary Context Brick".into(),
        timestamp: chrono::Local::now().to_rfc3339(),
    };

    // 3. Inject into Assets
    let json = serde_json::to_string_pretty(&crate_data).map_err(|e| e.to_string())?;
    std::fs::write(path.join("src/assets/knowledge.json"), json).map_err(|e| e.to_string())?;

    Ok(format!("Knowledge Crate Injected into [{}].", name))
}

#[tauri::command]
pub async fn get_oracle_pulse() -> Result<OraclePulse, String> {
    // 1. Check Cache
    {
        let cache = ORACLE_CACHE.lock().unwrap();
        let last_update = LAST_ORACLE_UPDATE.lock().unwrap();
        if let (Some(pulse), Some(time)) = (cache.as_ref(), *last_update) {
            let diff = chrono::Local::now().signed_duration_since(time);
            if diff.num_minutes() < 15 {
                return Ok(pulse.clone());
            }
        }
    }

    // 2. Fetch Fresh Data (CoinGecko Simple API)
    let url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let response = client.get(url).send().await.map_err(|e| e.to_string())?;
    let json: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    let btc = json["bitcoin"]["usd"].as_f64().unwrap_or(0.0) as f32;
    let eth = json["ethereum"]["usd"].as_f64().unwrap_or(0.0) as f32;

    // 3. Synthesize Sentiment (Basic Logic)
    let sentiment = if btc > 60000.0 { "STRATEGIC BULL" } else if btc < 40000.0 { "MARKET BREACH" } else { "STABLE" };
    
    let pulse = OraclePulse {
        btc_usd: btc,
        eth_usd: eth,
        sentiment: sentiment.into(),
        tech_momentum: 0.85, // Placeholder for GitHub trends for now
        timestamp: chrono::Local::now().to_rfc3339(),
    };

    // 4. Update Cache
    {
        let mut cache = ORACLE_CACHE.lock().unwrap();
        let mut last_update = LAST_ORACLE_UPDATE.lock().unwrap();
        *cache = Some(pulse.clone());
        *last_update = Some(chrono::Local::now());
    }

    Ok(pulse)
}
 Arkansas Arkansas
}

#[tauri::command]
pub async fn launch_sub_venture(name: String) -> Result<u32, String> {
    let venture_dir = format!("ventures/{}", name);
    let path = std::path::PathBuf::from(&venture_dir);
    if !path.exists() {
        return Err("Ventures path not found.".into());
    }

    // Spawning Dev Server (npm run dev)
    let child = std::process::Command::new("npm")
        .args(["run", "dev"])
        .current_dir(&path)
        .spawn()
        .map_err(|e| e.to_string())?;

    let pid = child.id();
    // Detect forge mode from existing registry entry if available
    let existing_mode = {
        let registry = VENTURE_REGISTRY.lock().unwrap();
        registry.get(&name).map(|s| s.forge_mode.clone()).unwrap_or_else(|| "react-vite".into())
    };
    let state = VentureActiveState {
        name: name.clone(),
        pid: Some(pid),
        port: Some(5173),
        status: "Active".into(),
        forge_mode: existing_mode,
        timestamp: chrono::Local::now().to_rfc3339(),
    };

    {
        let mut registry = VENTURE_REGISTRY.lock().unwrap();
        registry.insert(name, state);
    }

    Ok(pid)
}

#[tauri::command]
pub async fn stop_sub_venture(name: String) -> Result<String, String> {
    let pid = {
        let mut registry = VENTURE_REGISTRY.lock().unwrap();
        if let Some(state) = registry.get_mut(&name) {
            let pid = state.pid;
            state.pid = None;
            state.status = "Offline".into();
            pid
        } else {
            return Err("Venture not found in active registry.".into());
        }
    };

    if let Some(pid) = pid {
        #[cfg(target_os = "windows")]
        {
            let _ = std::process::Command::new("taskkill")
                .args(["/F", "/PID", &pid.to_string(), "/T"]) // /T to kill child processes (npm + vite)
                .output();
        }
    }
    
    Ok(format!("Strategic Venture [{}] Terminated.", name))
}

#[tauri::command]
pub async fn list_active_ventures() -> Result<Vec<VentureActiveState>, String> {
    let registry = VENTURE_REGISTRY.lock().unwrap();
    Ok(registry.values().cloned().collect())
}

#[tauri::command]
pub async fn purge_sub_venture(name: String) -> Result<String, String> {
    // 1. Security Gate
    if !crate::is_vault_session_valid() {
        return Err("Strategic Protocol Breach: Founder Signature Required for Venture Purge.".into());
    }

    // 2. Stop Process
    let _ = stop_sub_venture(name.clone()).await;

    // 3. Delete Files
    let venture_dir = format!("ventures/{}", name);
    let path = std::path::PathBuf::from(&venture_dir);
    if path.exists() {
        std::fs::remove_dir_all(path).map_err(|e| e.to_string())?;
    }

    // 4. Clear Registry
    {
        let mut registry = VENTURE_REGISTRY.lock().unwrap();
        registry.remove(&name);
    }

    Ok(format!("Strategic Venture [{}] Purged from Reality.", name))
}
 Arkansas Arkansas
