use crate::models::{HardwareTelemetry, TelemetryState, WindowInfo, ProcessInfo, DbState, PriorityAuditLog, PriorityCacheEntry};
use tauri::Emitter;
use tiny_http::Response;

use windows::Win32::Foundation::{BOOL, HWND, LPARAM, RECT};
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
                let is_duplicate = windows
                    .iter()
                    .any(|w| w.exe_path == exe_path);
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
        .args(["--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"])
        .output()
        .ok()
        .and_then(|out| String::from_utf8_lossy(&out.stdout).trim().parse::<f32>().ok())
        .unwrap_or(0.0);

    Ok(HardwareTelemetry {
        cpu_usage,
        ram_usage,
        disk_usage,
        network_up,
        network_down,
        gpu_usage,
    })
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
    state: tauri::State<TelemetryState>,
    search: Option<String>,
    filter: Option<String>,
    sort_by: Option<String>,
    sort_dir: Option<String>,
    limit: Option<usize>,
) -> Result<Vec<ProcessInfo>, String> {
    let mut sys = state.0.lock().unwrap();
    sys.refresh_processes();

    let mut procs: Vec<ProcessInfo> = sys.processes().values().map(|p| {
        ProcessInfo {
            pid: p.pid().as_u32(),
            name: p.name().to_string_lossy().into(),
            cpu_usage: p.cpu_usage(),
            mem_usage: p.memory(),
            status: format!("{:?}", p.status()),
        }
    }).collect();

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
            "paused" => procs.retain(|p| p.status.to_lowercase().contains("sleep") || p.status.to_lowercase().contains("idle")),
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
            _ => a.cpu_usage.partial_cmp(&b.cpu_usage).unwrap_or(std::cmp::Ordering::Equal),
        };
        if is_asc { cmp } else { cmp.reverse() }
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
    let conn = state.0.lock().map_err(|_| "Failed to lock database".to_string())?;
    
    let current_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_millis() as u64;

    conn.execute(
        "INSERT INTO priority_audit (pid, name, priority, source, time) VALUES (?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![pid, name, priority, source, current_time],
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
    let conn = state.0.lock().map_err(|_| "Failed to lock database".to_string())?;

    let mut sql = "SELECT id, pid, name, priority, source, time FROM priority_audit WHERE 1=1".to_string();
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
        params.push(Box::new(start));
        count_params.push(Box::new(start));
    }

    if let Some(end) = end_time {
        sql.push_str(" AND time <= ?");
        count_sql.push_str(" AND time <= ?");
        params.push(Box::new(end));
        count_params.push(Box::new(end));
    }

    sql.push_str(" ORDER BY time DESC LIMIT ? OFFSET ?");
    
    // Add pagination params
    let limit = page_size;
    let offset = page * page_size;
    params.push(Box::new(limit));
    params.push(Box::new(offset));

    let total_records: u32 = {
        let borrowed_params: Vec<&dyn rusqlite::ToSql> = count_params.iter().map(|b| b.as_ref()).collect();
        conn.query_row(&count_sql, rusqlite::params_from_iter(borrowed_params), |row| row.get(0)).unwrap_or(0)
    };

    let total_pages = if total_records == 0 { 1 } else { (total_records as f32 / page_size as f32).ceil() as u32 };

    let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
    let borrowed_params: Vec<&dyn rusqlite::ToSql> = params.iter().map(|b| b.as_ref()).collect();
    
    let log_iter = stmt.query_map(rusqlite::params_from_iter(borrowed_params), |row| {
        Ok(PriorityAuditLog {
            id: row.get(0)?,
            pid: row.get(1)?,
            name: row.get(2)?,
            priority: row.get(3)?,
            source: row.get(4)?,
            time: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;

    let mut logs = Vec::new();
    for log in log_iter {
        if let Ok(l) = log {
            logs.push(l);
        }
    }

    Ok(AuditLogResponse {
        logs,
        total_pages
    })
}

#[tauri::command]
pub fn get_priority_cache(state: tauri::State<DbState>) -> Result<std::collections::HashMap<String, PriorityCacheEntry>, String> {
    let conn = state.0.lock().map_err(|_| "Failed to lock database".to_string())?;
    
    let mut stmt = conn.prepare("SELECT name, priority, source, last_applied, ignore, ttl_days FROM priority_cache").map_err(|e| e.to_string())?;
    
    let cache_iter = stmt.query_map([], |row| {
        Ok(PriorityCacheEntry {
            name: row.get(0)?,
            priority: row.get(1)?,
            source: row.get(2)?,
            lastApplied: row.get(3)?,
            ignore: row.get(4)?,
            ttlDays: row.get(5)?,
        })
    }).map_err(|e| e.to_string())?;

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
    let conn = state.0.lock().map_err(|_| "Failed to lock database".to_string())?;
    
    conn.execute(
        "INSERT INTO priority_cache (name, priority, source, last_applied, ignore, ttl_days) 
         VALUES (?1, ?2, ?3, ?4, ?5, ?6) 
         ON CONFLICT(name) DO UPDATE SET 
            priority=excluded.priority, 
            source=excluded.source, 
            last_applied=excluded.last_applied, 
            ignore=excluded.ignore, 
            ttl_days=excluded.ttl_days",
        rusqlite::params![entry.name, entry.priority, entry.source, entry.lastApplied, entry.ignore, entry.ttlDays],
    ).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn remove_priority_cache_entry(
    state: tauri::State<DbState>,
    name: String,
) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "Failed to lock database".to_string())?;
    conn.execute("DELETE FROM priority_cache WHERE name = ?1", rusqlite::params![name]).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn clear_priority_cache(
    state: tauri::State<DbState>,
) -> Result<(), String> {
    let conn = state.0.lock().map_err(|_| "Failed to lock database".to_string())?;
    conn.execute("DELETE FROM priority_cache", []).map_err(|e| e.to_string())?;
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

#[tauri::command]
pub fn suspend_process(pid: u32) -> Result<(), String> {
    // Stub implementation. For Windows, requires NtSuspendProcess or PowerShell.
    println!("Suspending process: {}", pid);
    Ok(())
}

#[tauri::command]
pub fn resume_process(pid: u32) -> Result<(), String> {
    // Stub implementation.
    println!("Resuming process: {}", pid);
    Ok(())
}

#[tauri::command]
pub fn set_process_priority(pid: u32, priority: String) -> Result<(), String> {
    // Stub implementation. For Windows requires wmic or windows API SetPriorityClass
    println!("Setting priority of {} to {}", pid, priority);
    Ok(())
}



