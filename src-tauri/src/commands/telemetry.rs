use crate::models::{
    DbState, HardwareTelemetry, PriorityAuditLog, PriorityCacheEntry, ProcessInfo, TelemetryState,
    WindowInfo,
};
use tauri::Emitter;
use tiny_http::Response;

use windows::Win32::Foundation::{BOOL, HWND, LPARAM, RECT};
use windows::Win32::System::Power::{GetSystemPowerStatus, SYSTEM_POWER_STATUS};
use windows::Win32::UI::WindowsAndMessaging::{
    EnumWindows, GetWindowRect, GetWindowTextW, GetWindowThreadProcessId, IsWindowVisible, IsZoomed,
};

#[tauri::command]
pub fn get_running_windows() -> Vec<WindowInfo> {
    let mut windows: Vec<WindowInfo> = Vec::new();

    unsafe {
        let _ = EnumWindows(
            Some(enum_window_callback),
            LPARAM(&mut windows as *mut Vec<WindowInfo> as isize),
        );
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

            use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
            use windows::Win32::System::Threading::{
                OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ,
            };

            let mut exe_path = String::new();
            if let Ok(handle) = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid)
            {
                let mut path_buffer = [0u16; 1024];
                let path_len = GetModuleFileNameExW(handle, None, &mut path_buffer);
                if path_len > 0 {
                    exe_path = String::from_utf16_lossy(&path_buffer[..path_len as usize]);
                }
                let _ = windows::Win32::Foundation::CloseHandle(handle);
            }

            if !exe_path.is_empty() && !exe_path.contains("oasis-shell") {
                let is_duplicate = windows.iter().any(|w| w.exe_path == exe_path);
                let mut rect = RECT::default();
                let _ = GetWindowRect(hwnd, &mut rect);

                let w = rect.right - rect.left;
                let h = rect.bottom - rect.top;

                if !is_duplicate && w > 50 && h > 50 {
                    let is_maximized = IsZoomed(hwnd).as_bool();
                    windows.push(WindowInfo {
                        title,
                        pid,
                        exe_path,
                        x: rect.left,
                        y: rect.top,
                        width: w,
                        height: h,
                        is_maximized,
                    });
                }
            }
        }
    }
    BOOL(1)
}

#[tauri::command]
pub fn get_hardware_telemetry(
    state: tauri::State<TelemetryState>,
) -> Result<HardwareTelemetry, String> {
    let mut sys = state.0.lock().unwrap();
    sys.refresh_cpu_usage();
    sys.refresh_memory();

    let disks = sysinfo::Disks::new_with_refreshed_list();
    let mut total_disk_space = 0;
    let mut total_disk_used = 0;

    for disk in &disks {
        total_disk_space += disk.total_space();
        total_disk_used += disk.total_space() - disk.available_space();
    }

    let disk_usage = if total_disk_space > 0 {
        (total_disk_used as f32 / total_disk_space as f32) * 100.0
    } else {
        0.0
    };

    let cpu_usage = sys.global_cpu_usage();
    let ram_usage = (sys.used_memory() as f32 / sys.total_memory() as f32) * 100.0;

    let mut networks = sysinfo::Networks::new_with_refreshed_list();
    std::thread::sleep(std::time::Duration::from_millis(200)); // Sleep slightly to measure diff
    networks.refresh(true);
    let mut total_up = 0.0;
    let mut total_down = 0.0;
    for (_, data) in &networks {
        total_up += data.transmitted() as f32;
        total_down += data.received() as f32;
    }

    // Convert to MB/s
    let network_up = total_up / 1024.0 / 1024.0;
    let network_down = total_down / 1024.0 / 1024.0;
    let gpu_usage = std::process::Command::new("nvidia-smi")
        .args([
            "--query-gpu=utilization.gpu",
            "--format=csv,noheader,nounits",
        ])
        .output()
        .ok()
        .and_then(|out| {
            String::from_utf8_lossy(&out.stdout)
                .trim()
                .parse::<f32>()
                .ok()
        })
        .unwrap_or(0.0);

    let mut battery_percent: u8 = 100;
    let mut is_charging: bool = true;

    unsafe {
        let mut power_status = SYSTEM_POWER_STATUS::default();
        if GetSystemPowerStatus(&mut power_status).is_ok() {
            if power_status.BatteryLifePercent != 255 {
                battery_percent = power_status.BatteryLifePercent;
            }
            is_charging = power_status.ACLineStatus == 1;
        }
    }

    Ok(HardwareTelemetry {
        cpu_usage,
        ram_usage,
        disk_usage,
        network_up,
        network_down,
        gpu_usage,
        battery_percent,
        is_charging,
        system_uptime: sysinfo::System::uptime(),
    })
}

static PROCESS_CACHE: std::sync::RwLock<Vec<ProcessInfo>> = std::sync::RwLock::new(Vec::new());

pub fn start_telemetry_stream(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        use tauri::Manager;
        loop {
            std::thread::sleep(std::time::Duration::from_secs(2));

            // Hardware telemetry (uses TelemetryState)
            if let Some(state) = app.try_state::<TelemetryState>() {
                if let Ok(hardware) = get_hardware_telemetry(state.clone()) {
                    // Compute health score: 100 - weighted penalties
                    let cpu_penalty = (hardware.cpu_usage / 100.0) * 35.0;
                    let ram_penalty = (hardware.ram_usage / 100.0) * 30.0;
                    let disk_penalty = (hardware.disk_usage / 100.0) * 20.0;
                    let bat_penalty = if hardware.battery_percent < 15 {
                        15.0
                    } else {
                        0.0
                    };
                    let health_score =
                        (100.0 - cpu_penalty - ram_penalty - disk_penalty - bat_penalty)
                            .clamp(0.0, 100.0) as u8;

                    let _ = app.emit("oasis-hardware-telemetry", &hardware);
                    let _ = app.emit("oasis-health-score", health_score);
                }

                // Update Process Cache in the background
                let mut sys = state.0.lock().unwrap();
                sys.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
                let procs: Vec<ProcessInfo> = sys
                    .processes()
                    .values()
                    .map(|p| ProcessInfo {
                        pid: p.pid().as_u32(),
                        name: p.name().to_string_lossy().into(),
                        cpu_usage: p.cpu_usage(),
                        mem_usage: p.memory(),
                        status: format!("{:?}", p.status()),
                    })
                    .collect();
                if let Ok(mut cache) = PROCESS_CACHE.write() {
                    *cache = procs;
                }
            }

            // Running windows — no DbState needed, pure Win32 call
            let windows = get_running_windows_impl();
            let _ = app.emit("oasis-windows-telemetry", windows.clone());

            // Productivity Analytics (Track Active Foreground Window)
            unsafe {
                use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowThreadProcessId, GetWindowTextW};
                use windows::Win32::System::ProcessStatus::GetModuleFileNameExW;
                use windows::Win32::System::Threading::{OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
                
                let hwnd = GetForegroundWindow();
                if !hwnd.is_invalid() {
                    let mut buffer = [0u16; 512];
                    let length = GetWindowTextW(hwnd, &mut buffer);
                    let title = String::from_utf16_lossy(&buffer[..length as usize]);
                    
                    let mut pid = 0u32;
                    GetWindowThreadProcessId(hwnd, Some(&mut pid));
                    
                    let mut exe_path = String::new();
                    if let Ok(handle) = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid) {
                        let mut path_buffer = [0u16; 1024];
                        let path_len = GetModuleFileNameExW(handle, None, &mut path_buffer);
                        if path_len > 0 {
                            exe_path = String::from_utf16_lossy(&path_buffer[..path_len as usize]);
                        }
                        let _ = windows::Win32::Foundation::CloseHandle(handle);
                    }
                    
                    if !exe_path.is_empty() {
                        let exe_name = std::path::Path::new(&exe_path)
                            .file_name()
                            .map(|s| s.to_string_lossy().to_string())
                            .unwrap_or(exe_path);
                            
                        if let Some(db_state) = app.try_state::<crate::models::DbState>() {
                            if let Ok(conn) = db_state.0.get() {
                                let _ = conn.execute(
                                    "INSERT INTO app_usage_analytics (exe_name, window_title, focus_time_seconds, last_seen) 
                                     VALUES (?1, ?2, 2, CURRENT_TIMESTAMP) 
                                     ON CONFLICT(exe_name) DO UPDATE SET 
                                     window_title = ?2, 
                                     focus_time_seconds = focus_time_seconds + 2, 
                                     last_seen = CURRENT_TIMESTAMP",
                                    rusqlite::params![exe_name, title],
                                );
                            }
                        }
                    }
                }
            }

            // Golem workforce state
            if let Ok(golems) = crate::commands::golems::get_active_golems_native() {
                let _ = app.emit("oasis-golem-telemetry", golems);
            }
        }
    });
}

fn get_running_windows_impl() -> Vec<WindowInfo> {
    get_running_windows()
}

#[derive(serde::Serialize)]
pub struct AppUsage {
    pub exe_name: String,
    pub window_title: String,
    pub focus_time_seconds: u32,
    pub last_seen: String,
}

#[tauri::command]
pub fn get_app_usage_analytics(state: tauri::State<'_, crate::models::DbState>) -> Result<Vec<AppUsage>, String> {
    let conn = state.0.get().map_err(|e| e.to_string())?;
    let mut stmt = conn.prepare("SELECT exe_name, window_title, focus_time_seconds, last_seen FROM app_usage_analytics ORDER BY focus_time_seconds DESC LIMIT 20").map_err(|e| e.to_string())?;
    
    let rows = stmt.query_map([], |row| {
        Ok(AppUsage {
            exe_name: row.get(0)?,
            window_title: row.get(1)?,
            focus_time_seconds: row.get(2)?,
            last_seen: row.get(3)?,
        })
    }).map_err(|e| e.to_string())?;
    
    let mut usages = Vec::new();
    for row in rows {
        if let Ok(usage) = row {
            usages.push(usage);
        }
    }
    
    Ok(usages)
}

#[tauri::command]
pub fn start_telemetry_server(app: tauri::AppHandle) -> Result<(), String> {
    std::thread::spawn(move || {
        if let Ok(server) = tiny_http::Server::http("0.0.0.0:4040") {
            for mut request in server.incoming_requests() {
                let url = request.url().to_string();

                if request.method() == &tiny_http::Method::Options {
                    let response = Response::empty(204)
                        .with_header(
                            tiny_http::Header::from_bytes(
                                &b"Access-Control-Allow-Origin"[..],
                                &b"*"[..],
                            )
                            .unwrap(),
                        )
                        .with_header(
                            tiny_http::Header::from_bytes(
                                &b"Access-Control-Allow-Methods"[..],
                                &b"GET, POST, OPTIONS"[..],
                            )
                            .unwrap(),
                        )
                        .with_header(
                            tiny_http::Header::from_bytes(
                                &b"Access-Control-Allow-Headers"[..],
                                &b"Content-Type"[..],
                            )
                            .unwrap(),
                        );
                    let _ = request.respond(response);
                    continue;
                }

                if url == "/scout-sync" && request.method() == &tiny_http::Method::Post {
                    let mut content = String::new();
                    if let Ok(_) = request.as_reader().read_to_string(&mut content) {
                        if let Ok(json) = serde_json::from_str::<serde_json::Value>(&content) {
                            let _ = app.emit("scout-telemetry", json);
                        }
                    }
                } else if url == "/heartbeat" {
                    let response = Response::from_string("{\"status\":\"active\",\"aura\":\"emerald\",\"ready\":true,\"online\":true}")
                        .with_header(tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..]).unwrap());
                    let _ = request.respond(response);
                    continue;
                }

                let response = Response::from_string("OK").with_header(
                    tiny_http::Header::from_bytes(&b"Access-Control-Allow-Origin"[..], &b"*"[..])
                        .unwrap(),
                );
                let _ = request.respond(response);
            }
        }
    });
    Ok(())
}

#[tauri::command]
pub fn get_process_list(
    _state: tauri::State<TelemetryState>,
    search: Option<String>,
    filter: Option<String>,
    sort_by: Option<String>,
    sort_dir: Option<String>,
    limit: Option<usize>,
) -> Result<Vec<ProcessInfo>, String> {
    // Read instantly from the background-updated RwLock cache (zero-latency)
    let cache = PROCESS_CACHE.read().unwrap();
    let mut procs = cache.clone();

    if let Some(query) = search {
        if !query.trim().is_empty() {
            let q = query.to_lowercase();
            procs.retain(|p| p.name.to_lowercase().contains(&q) || p.pid.to_string().contains(&q));
        }
    }

    if let Some(ftype) = filter {
        match ftype.as_str() {
            "high_cpu" => procs.retain(|p| p.cpu_usage >= 30.0),
            "high_mem" => procs.retain(|p| p.mem_usage >= 600 * 1024 * 1024),
            "paused" => procs.retain(|p| {
                p.status.to_lowercase().contains("sleep")
                    || p.status.to_lowercase().contains("idle")
            }),
            _ => {}
        }
    }

    let sort = sort_by.unwrap_or_else(|| "cpu".to_string());
    let dir = sort_dir.unwrap_or_else(|| "desc".to_string());
    let is_asc = dir == "asc";

    procs.sort_by(|a, b| {
        let cmp = match sort.as_str() {
            "mem" => a.mem_usage.cmp(&b.mem_usage),
            "status" => a.status.to_lowercase().cmp(&b.status.to_lowercase()),
            _ => a
                .cpu_usage
                .partial_cmp(&b.cpu_usage)
                .unwrap_or(std::cmp::Ordering::Equal),
        };
        if is_asc {
            cmp
        } else {
            cmp.reverse()
        }
    });

    let lim = limit.unwrap_or(50);
    Ok(procs.into_iter().take(lim).collect())
}

#[tauri::command]
pub fn log_priority_audit(
    state: tauri::State<DbState>,
    pid: u32,
    name: String,
    priority: String,
    source: String,
) -> Result<(), String> {
    let conn = state
        .0
        .get()
        .map_err(|_| "Failed to lock database".to_string())?;

    let current_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    conn.execute(
        "INSERT INTO priority_audit (pid, name, priority, source, time) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![pid as i64, name, priority, source, current_time as i64],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(serde::Serialize)]
pub struct AuditLogResponse {
    pub logs: Vec<PriorityAuditLog>,
    pub total_pages: u32,
}

#[tauri::command]
pub fn get_priority_audit(
    state: tauri::State<DbState>,
    query: Option<String>,
    filter: Option<String>,
    start_time: Option<u64>,
    end_time: Option<u64>,
    page: u32,
    page_size: u32,
) -> Result<AuditLogResponse, String> {
    let conn = state
        .0
        .get()
        .map_err(|_| "Failed to lock database".to_string())?;

    let mut sql =
        "SELECT id, pid, name, priority, source, time FROM priority_audit WHERE 1=1".to_string();
    let mut count_sql = "SELECT COUNT(*) FROM priority_audit WHERE 1=1".to_string();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
    let mut count_params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(q) = query {
        if !q.trim().is_empty() {
            let search = format!("%{}%", q);
            sql.push_str(" AND (name LIKE ? OR CAST(pid AS TEXT) LIKE ?)");
            count_sql.push_str(" AND (name LIKE ? OR CAST(pid AS TEXT) LIKE ?)");
            params.push(Box::new(search.clone()));
            params.push(Box::new(search.clone()));
            count_params.push(Box::new(search.clone()));
            count_params.push(Box::new(search));
        }
    }

    if let Some(f) = filter {
        if f != "all" {
            sql.push_str(" AND LOWER(source) = ?");
            count_sql.push_str(" AND LOWER(source) = ?");
            let source_lower = f.to_lowercase();
            params.push(Box::new(source_lower.clone()));
            count_params.push(Box::new(source_lower));
        }
    }

    if let Some(start) = start_time {
        sql.push_str(" AND time >= ?");
        count_sql.push_str(" AND time >= ?");
        params.push(Box::new(start as i64));
        count_params.push(Box::new(start as i64));
    }

    if let Some(end) = end_time {
        sql.push_str(" AND time <= ?");
        count_sql.push_str(" AND time <= ?");
        params.push(Box::new(end as i64));
        count_params.push(Box::new(end as i64));
    }

    sql.push_str(" ORDER BY time DESC LIMIT ? OFFSET ?");

    // Add pagination params
    let limit = page_size as i64;
    let offset = (page * page_size) as i64;
    params.push(Box::new(limit));
    params.push(Box::new(offset));

    let total_records: u32 = {
        let borrowed_params: Vec<&dyn rusqlite::ToSql> =
            count_params.iter().map(|b| b.as_ref()).collect();
        conn.query_row(
            &count_sql,
            rusqlite::params_from_iter(borrowed_params),
            |row| row.get(0),
        )
        .unwrap_or(0)
    };

    let total_pages = if total_records == 0 {
        1
    } else {
        (total_records as f32 / page_size as f32).ceil() as u32
    };

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let borrowed_params: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

    let log_iter = stmt
        .query_map(rusqlite::params_from_iter(borrowed_params), |row| {
            Ok(PriorityAuditLog {
                id: row.get(0)?,
                pid: row.get::<_, i64>(1)? as u32,
                name: row.get(2)?,
                priority: row.get(3)?,
                source: row.get(4)?,
                time: row.get::<_, i64>(5)? as u64,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut logs = Vec::new();
    for log in log_iter {
        if let Ok(l) = log {
            logs.push(l);
        }
    }

    Ok(AuditLogResponse { logs, total_pages })
}

#[tauri::command]
pub fn get_priority_cache(
    state: tauri::State<DbState>,
) -> Result<std::collections::HashMap<String, PriorityCacheEntry>, String> {
    let conn = state
        .0
        .get()
        .map_err(|_| "Failed to lock database".to_string())?;

    let mut stmt = conn
        .prepare(
            "SELECT name, priority, source, last_applied, ignore, ttl_days FROM priority_cache",
        )
        .map_err(|e| e.to_string())?;

    let cache_iter = stmt
        .query_map([], |row| {
            Ok(PriorityCacheEntry {
                name: row.get(0)?,
                priority: row.get(1)?,
                source: row.get(2)?,
                last_applied: row.get::<_, i64>(3)? as u64,
                ignore: row.get(4)?,
                ttl_days: row.get::<_, i64>(5)? as u32,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut cache = std::collections::HashMap::new();
    for entry in cache_iter {
        if let Ok(e) = entry {
            cache.insert(e.name.clone(), e);
        }
    }

    Ok(cache)
}

#[tauri::command]
pub fn set_priority_cache_entry(
    state: tauri::State<DbState>,
    entry: PriorityCacheEntry,
) -> Result<(), String> {
    let conn = state
        .0
        .get()
        .map_err(|_| "Failed to lock database".to_string())?;

    conn.execute(
        "INSERT INTO priority_cache (name, priority, source, last_applied, ignore, ttl_days) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6) 
         ON CONFLICT(name) DO UPDATE SET 
            priority=excluded.priority, 
            source=excluded.source, 
            last_applied=excluded.last_applied, 
            ignore=excluded.ignore, 
            ttl_days=excluded.ttl_days",
        rusqlite::params![
            entry.name,
            entry.priority,
            entry.source,
            entry.last_applied as i64,
            entry.ignore,
            entry.ttl_days as i64
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn remove_priority_cache_entry(
    state: tauri::State<DbState>,
    name: String,
) -> Result<(), String> {
    let conn = state
        .0
        .get()
        .map_err(|_| "Failed to lock database".to_string())?;
    conn.execute(
        "DELETE FROM priority_cache WHERE name = ?1",
        rusqlite::params![name],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn clear_priority_cache(state: tauri::State<DbState>) -> Result<(), String> {
    let conn = state
        .0
        .get()
        .map_err(|_| "Failed to lock database".to_string())?;
    conn.execute("DELETE FROM priority_cache", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn kill_process(pid: u32) -> Result<(), String> {
    let mut system = sysinfo::System::new();
    system.refresh_processes(sysinfo::ProcessesToUpdate::All, true);
    if let Some(process) = system.process(sysinfo::Pid::from_u32(pid)) {
        process.kill();
        Ok(())
    } else {
        Err("Process not found".to_string())
    }
}

#[link(name = "ntdll")]
extern "system" {
    fn NtSuspendProcess(ProcessHandle: windows::Win32::Foundation::HANDLE) -> i32;
    fn NtResumeProcess(ProcessHandle: windows::Win32::Foundation::HANDLE) -> i32;
}

#[tauri::command]
pub fn suspend_process(pid: u32) -> Result<(), String> {
    use windows::Win32::Foundation::CloseHandle;
    use windows::Win32::System::Threading::{OpenProcess, PROCESS_SUSPEND_RESUME};

    unsafe {
        if let Ok(handle) = OpenProcess(PROCESS_SUSPEND_RESUME, false, pid) {
            let status = NtSuspendProcess(handle);
            let _ = CloseHandle(handle);
            if status == 0 {
                return Ok(());
            }
        }
    }
    Err("Failed to suspend process".to_string())
}

#[tauri::command]
pub fn resume_process(pid: u32) -> Result<(), String> {
    use windows::Win32::Foundation::CloseHandle;
    use windows::Win32::System::Threading::{OpenProcess, PROCESS_SUSPEND_RESUME};

    unsafe {
        if let Ok(handle) = OpenProcess(PROCESS_SUSPEND_RESUME, false, pid) {
            let status = NtResumeProcess(handle);
            let _ = CloseHandle(handle);
            if status == 0 {
                return Ok(());
            }
        }
    }
    Err("Failed to resume process".to_string())
}

#[tauri::command]
pub fn set_process_priority(pid: u32, priority: String) -> Result<(), String> {
    use windows::Win32::Foundation::CloseHandle;
    use windows::Win32::System::Threading::{
        OpenProcess, SetPriorityClass, HIGH_PRIORITY_CLASS, IDLE_PRIORITY_CLASS,
        NORMAL_PRIORITY_CLASS, PROCESS_SET_INFORMATION, REALTIME_PRIORITY_CLASS,
    };

    let prio_class = match priority.to_lowercase().as_str() {
        "low" | "idle" => IDLE_PRIORITY_CLASS,
        "high" => HIGH_PRIORITY_CLASS,
        "realtime" => REALTIME_PRIORITY_CLASS,
        _ => NORMAL_PRIORITY_CLASS,
    };

    unsafe {
        if let Ok(handle) = OpenProcess(PROCESS_SET_INFORMATION, false, pid) {
            let result = SetPriorityClass(handle, prio_class);
            let _ = CloseHandle(handle);
            if result.is_ok() {
                return Ok(());
            }
        }
    }
    Err("Failed to set process priority".to_string())
}

#[derive(serde::Serialize)]
pub struct ClipboardItem {
    pub id: i32,
    pub content: String,
    pub item_type: String,
    pub timestamp: i64,
}

#[tauri::command]
pub fn get_clipboard_history(
    state: tauri::State<DbState>,
    query: Option<String>,
) -> Result<Vec<ClipboardItem>, String> {
    let conn = state.0.get().map_err(|_| "Failed to get db connection")?;
    let mut sql = "SELECT id, content, type, timestamp FROM clipboard_history".to_string();
    let mut params: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();

    if let Some(q) = query {
        if !q.trim().is_empty() {
            sql.push_str(" WHERE content LIKE ?");
            params.push(Box::new(format!("%{}%", q)));
        }
    }
    sql.push_str(" ORDER BY timestamp DESC LIMIT 50");

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let borrowed_params: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();

    let iter = stmt
        .query_map(rusqlite::params_from_iter(borrowed_params), |row| {
            Ok(ClipboardItem {
                id: row.get(0)?,
                content: row.get(1)?,
                item_type: row.get(2)?,
                timestamp: row.get(3)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut items = Vec::new();
    for item in iter.flatten() {
        items.push(item);
    }
    Ok(items)
}

#[tauri::command]
pub fn write_to_clipboard(content: String) -> Result<(), String> {
    if let Ok(mut clipboard) = arboard::Clipboard::new() {
        clipboard.set_text(content).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn start_voice_engine(app: tauri::AppHandle) -> Result<(), String> {
    use tauri::Emitter;
    std::thread::spawn(move || {
        let mut child = match std::process::Command::new("whisper-stream.exe")
            .arg("-m")
            .arg("ggml-base.en.bin")
            .arg("--step")
            .arg("4000")
            .arg("--length")
            .arg("8000")
            .arg("-c")
            .arg("0")
            .arg("-t")
            .arg("4")
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::null())
            .spawn()
        {
            Ok(c) => c,
            Err(e) => {
                let _ = app.emit("voice-engine-error", format!("Whisper.cpp offline: Could not find whisper-stream.exe or model in path. Error: {}", e));
                return;
            }
        };

        let stdout = child.stdout.take().unwrap();
        let reader = std::io::BufReader::new(stdout);
        use std::io::BufRead;
        for line in reader.lines() {
            if let Ok(l) = line {
                let trimmed = l.trim();
                let mut text = trimmed.to_string();
                if trimmed.starts_with('[') {
                    if let Some(idx) = trimmed.find(']') {
                        text = trimmed[idx + 1..].trim().to_string();
                    }
                }
                if !text.is_empty() && !text.starts_with("[_TT") {
                    let _ = app.emit("voice-transcript", text);
                }
            }
        }
    });
    Ok(())
}

#[tauri::command]
pub fn start_cron_scheduler(
    app: tauri::AppHandle,
    state: tauri::State<DbState>,
) -> Result<(), String> {
    let pool = state.0.clone();

    std::thread::spawn(move || {
        loop {
            // Sleep for 30 minutes (1800 seconds)
            std::thread::sleep(std::time::Duration::from_secs(1800));

            // Capture workspace state natively
            let windows = get_running_windows_impl();
            if windows.is_empty() {
                continue;
            }

            let timestamp_now = chrono::Local::now().format("%I:%M %p").to_string();
            let name = format!("Auto-Snapshot {}", timestamp_now);
            let apps_json = serde_json::to_string(&windows).unwrap_or_else(|_| "[]".to_string());
            let timestamp_db = chrono::Local::now().to_rfc3339();

            if let Ok(conn) = pool.get() {
                let _ = conn.execute(
                    "INSERT INTO context_crates (name, apps, timestamp) VALUES (?1, ?2, ?3)",
                    rusqlite::params![name, apps_json, timestamp_db],
                );

                // Keep only the 10 most recent Auto-Snapshots
                let _ = conn.execute(
                    "DELETE FROM context_crates WHERE name LIKE 'Auto-Snapshot %' AND id NOT IN (
                        SELECT id FROM context_crates WHERE name LIKE 'Auto-Snapshot %' ORDER BY timestamp DESC LIMIT 10
                    )",
                    [],
                );
            }

            use tauri::Emitter;
            let _ = app.emit("oasis-cron-snapshot", name);
        }
    });

    Ok(())
}

#[tauri::command]
pub fn organize_workspace(layout_mode: String) -> Result<String, String> {
    use windows::Win32::UI::WindowsAndMessaging::{
        GetSystemMetrics, SM_CXSCREEN, SM_CYSCREEN, SetWindowPos, ShowWindow, HWND_TOP, SW_RESTORE, SWP_SHOWWINDOW,
        EnumWindows, GetWindowTextW, IsWindowVisible
    };
    use windows::Win32::Foundation::{HWND, LPARAM, BOOL};

    struct SnapTarget {
        windows: Vec<HWND>,
    }

    unsafe extern "system" fn snap_enum(hwnd: HWND, lparam: LPARAM) -> BOOL {
        let targets = &mut *(lparam.0 as *mut SnapTarget);
        if IsWindowVisible(hwnd).as_bool() {
            let mut buffer = [0u16; 512];
            let length = GetWindowTextW(hwnd, &mut buffer);
            let title = String::from_utf16_lossy(&buffer[..length as usize]);
            
            // Ignore tiny windows, invisible windows, or Settings
            if !title.is_empty() && title != "Program Manager" && title != "Settings" && !title.contains("Oasis") {
                targets.windows.push(hwnd);
            }
        }
        BOOL(1)
    }

    unsafe {
        let mut targets = SnapTarget { windows: Vec::new() };
        let _ = EnumWindows(Some(snap_enum), LPARAM(&mut targets as *mut SnapTarget as isize));

        let width = GetSystemMetrics(SM_CXSCREEN);
        let height = GetSystemMetrics(SM_CYSCREEN);
        println!("Snapping Code and Browser. Monitor size: {}x{}", width, height);

        if targets.windows.len() >= 2 {
            // First window snapped left
            let left_hwnd = targets.windows[0];
            let _ = ShowWindow(left_hwnd, SW_RESTORE);
            let _ = SetWindowPos(left_hwnd, HWND_TOP, 0, 0, width / 2, height, SWP_SHOWWINDOW);

            // Second window snapped right
            let right_hwnd = targets.windows[1];
            let _ = ShowWindow(right_hwnd, SW_RESTORE);
            let _ = SetWindowPos(right_hwnd, HWND_TOP, width / 2, 0, width / 2, height, SWP_SHOWWINDOW);
        }
    }
    
    Ok(format!("Workspace organized to {}", layout_mode))
}

#[tauri::command]
pub fn execute_neural_macro(macro_sequence: String) -> Result<String, String> {
    std::thread::spawn(move || {
        use enigo::*;
        let mut enigo = Enigo::new(&Settings::default()).unwrap_or_else(|_| Enigo::new(&Settings::default()).unwrap());
        
        let steps = macro_sequence.split('|');
        for step in steps {
            let parts: Vec<&str> = step.splitn(2, ':').collect();
            if parts.len() < 2 { continue; }
            let cmd = parts[0];
            let val = parts[1];
            
            match cmd {
                "text" => {
                    let _ = enigo.text(val);
                },
                "key" => {
                    let key = match val {
                        "enter" | "return" => Key::Return,
                        "tab" => Key::Tab,
                        "space" => Key::Space,
                        "escape" => Key::Escape,
                        "up" => Key::UpArrow,
                        "down" => Key::DownArrow,
                        "left" => Key::LeftArrow,
                        "right" => Key::RightArrow,
                        "meta" | "win" => Key::Meta,
                        _ => continue,
                    };
                    let _ = enigo.key(key, Direction::Click);
                },
                "mouse_move" => {
                    let coords: Vec<&str> = val.split(',').collect();
                    if coords.len() == 2 {
                        if let (Ok(x), Ok(y)) = (coords[0].parse::<i32>(), coords[1].parse::<i32>()) {
                            let _ = enigo.move_mouse(x, y, Coordinate::Abs);
                        }
                    }
                },
                "mouse_click" => {
                    let _ = enigo.button(Button::Left, Direction::Click);
                },
                "sleep" => {
                    if let Ok(ms) = val.parse::<u64>() {
                        std::thread::sleep(std::time::Duration::from_millis(ms));
                    }
                }
                _ => {}
            }
            std::thread::sleep(std::time::Duration::from_millis(100)); // Delay between inputs
        }
    });
    Ok("Macro executed".to_string())
}

