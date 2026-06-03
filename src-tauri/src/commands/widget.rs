#[tauri::command]
pub fn set_widget_mode(app: tauri::AppHandle, enable: bool) -> Result<(), String> {
    use tauri::Manager;
    use tauri::LogicalSize;
    if let Some(window) = app.get_webview_window("main") {
        if enable {
            let _ = window.set_size(LogicalSize::new(350.0, 700.0));
            let _ = window.set_always_on_top(true);
        } else {
            let _ = window.set_size(LogicalSize::new(1200.0, 800.0));
            let _ = window.set_always_on_top(false);
        }
    }
    Ok(())
}
