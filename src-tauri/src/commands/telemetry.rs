use crate::models::{HardwareTelemetry, TelemetryState, WindowInfo};
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

    Ok(HardwareTelemetry {
        cpu_usage,
        ram_usage,
        disk_usage,
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
